
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Activity } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, Save, AlertCircle, Camera, Upload } from 'lucide-react';
import { ACTIVITIES, ACTIVITY_CONFIG } from '../constants';

interface EditProfileFormProps {
  currentUser: User;
  onUpdateProfile: (updates: { bio: string, currentActivity: Activity, username?: string, avatar?: string }) => Promise<void>;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ currentUser, onUpdateProfile, onClose }) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState(currentUser.bio || '');
  const [activity, setActivity] = useState<Activity>(currentUser.currentActivity || 'Relaxing');
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bioCharCount = bio.length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const lastChangeTime = currentUser.lastUsernameChange ? new Date(currentUser.lastUsernameChange).getTime() : 0;
  const timeSinceChange = Date.now() - lastChangeTime;
  const canChangeUsername = timeSinceChange > sevenDaysMs;
  const daysRemaining = Math.ceil((sevenDaysMs - timeSinceChange) / (24 * 60 * 60 * 1000));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 1024 * 1024 * 2) { // 2MB Limit
              setError("Image too large. Max 2MB.");
              return;
          }
          try {
              const base64 = await fileToBase64(file);
              setAvatar(base64);
          } catch (err) {
              setError("Failed to process image.");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
    }
    
    if (!/^[a-z0-9_.]+$/.test(username)) {
        setError('Username can only contain letters, numbers, underscores, and dots (no spaces).');
        return;
    }

    setIsSubmitting(true);
    try {
        await onUpdateProfile({ bio, currentActivity: activity, username, avatar });
    } catch (e) {
        setError("Failed to update profile.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const isAvatarImage = avatar.startsWith('data:image') || avatar.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-md w-full mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('editProfile.title')}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
             <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
             <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-md overflow-hidden flex items-center justify-center text-brand-600 font-bold text-4xl">
                    {isAvatarImage ? (
                        <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        avatar
                    )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden" 
                />
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <Upload size={14} /> Change Photo
            </button>
        </div>

        <div className="mb-4">
            <label htmlFor="username" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">
                Username
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                <input 
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    disabled={!canChangeUsername && currentUser.username !== undefined}
                    className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg py-2.5 pl-8 pr-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            {!canChangeUsername && (
                <p className="text-xs text-orange-500 mt-1">
                    Next change available in {daysRemaining} days.
                </p>
            )}
             {canChangeUsername && (
                <p className="text-xs text-gray-400 mt-1">
                    You can change your username once every 7 days.
                </p>
            )}
        </div>

        <div className="relative mb-4">
           <label htmlFor="bioText" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">
             {t('editProfile.bio.label')}
           </label>
          <textarea 
            id="bioText"
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            placeholder={t('editProfile.bio.placeholder')} 
            maxLength={160} 
            className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200"
            rows={4}
          />
           <span className={`absolute bottom-3 right-3 text-xs ${bioCharCount > 150 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {bioCharCount}/160
          </span>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('editProfile.activity.label')}</label>
          <div className="bg-brand-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITIES.map(act => {
                const config = ACTIVITY_CONFIG[act];
                const isActive = activity === act;
                const label = t(`activity.${act}`);
                return (
                <button 
                  key={act} 
                  type="button"
                  onClick={() => setActivity(act)} 
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                      isActive ? `${config.colorClasses} ring-2 ring-offset-2 ring-offset-brand-50 dark:ring-offset-slate-700/50 ring-current` : `bg-white text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600`
                  }`}
                >
                  <config.icon size={14}/>
                  <span className="text-xs">{label}</span>
                </button>
              )})}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            {t('editProfile.button.cancel')}
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            <Save size={16} /> {isSubmitting ? 'Saving...' : t('editProfile.button.save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
