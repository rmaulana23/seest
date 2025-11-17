import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Activity } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, Save } from 'lucide-react';
import { ACTIVITIES, ACTIVITY_CONFIG } from '../constants';

interface EditProfileFormProps {
  currentUser: User;
  onUpdateProfile: (updates: { bio: string, currentActivity: Activity }) => void;
  onClose: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ currentUser, onUpdateProfile, onClose }) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState(currentUser.bio || '');
  const [activity, setActivity] = useState<Activity>(currentUser.currentActivity || 'Relaxing');
  const bioCharCount = bio.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ bio, currentActivity: activity });
  };

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
      
      <form onSubmit={handleSubmit}>
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
            autoFocus
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
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Save size={16} /> {t('editProfile.button.save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};