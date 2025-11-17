import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, Check, Circle, Image as ImageIcon, UploadCloud } from 'lucide-react';

interface CreateEventFormProps {
  currentUser: User;
  allUsers: User[];
  onCreateEvent: (eventData: { title: string; description: string; type: 'stand-up' | 'podcast'; speakers: string[], coverImage?: string }) => void;
  onClose: () => void;
  type: 'stand-up' | 'podcast';
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ currentUser, allUsers, onCreateEvent, onClose, type }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [invitedSpeakers, setInvitedSpeakers] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const friends = allUsers.filter(u => currentUser.following.includes(u.id));

  const handleToggleSpeaker = (userId: string) => {
    setInvitedSpeakers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image is too large. Max size is 2MB.");
        return;
      }
      const base64 = await fileToBase64(file);
      setCoverImage(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (type === 'podcast' && (invitedSpeakers.length < 2 || invitedSpeakers.length > 5))) {
        if (type === 'podcast') alert(t('events.create.invite.label'));
        return;
    }
    onCreateEvent({ title, description, type, speakers: type === 'podcast' ? invitedSpeakers : [], coverImage: coverImage || undefined });
  };
  
  const isFormValid = title.trim() && (type === 'stand-up' || (invitedSpeakers.length >= 2 && invitedSpeakers.length <= 5));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('events.create.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {type === 'stand-up' ? t('events.standup.desc') : t('events.podcast.desc')}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="eventTitle" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('events.create.title.label')}</label>
          <input id="eventTitle" type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} required className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200"/>
        </div>
        
        <div>
          <label htmlFor="eventDesc" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('events.create.desc.label')}</label>
          <textarea id="eventDesc" value={description} onChange={e => setDescription(e.target.value)} maxLength={200} className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200" rows={3}/>
        </div>

        <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('events.create.cover.add')}</label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {coverImage ? (
                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    )}
                </div>
                <div>
                    <input type="file" ref={fileInputRef} onChange={handleCoverImageChange} accept="image/png, image/jpeg" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-slate-600">
                        <UploadCloud size={16} />
                        {coverImage ? t('events.create.cover.change') : t('create.media.upload')}
                    </button>
                    {coverImage && (
                        <button type="button" onClick={() => setCoverImage(null)} className="text-xs text-red-500 dark:text-red-400 hover:underline mt-2">
                           {t('events.create.cover.remove')}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {type === 'podcast' && (
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('events.create.invite.label')}</label>
            <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-brand-50 dark:bg-slate-700/50 rounded-lg custom-scrollbar">
              {friends.length > 0 ? friends.map(friend => (
                <button type="button" key={friend.id} onClick={() => handleToggleSpeaker(friend.id)} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-brand-100 dark:hover:bg-slate-600">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">{friend.avatar}</div>
                     <span className="font-semibold text-gray-700 dark:text-gray-200">@{friend.name}</span>
                  </div>
                  {invitedSpeakers.includes(friend.id) 
                    ? <Check className="h-5 w-5 text-white bg-brand-600 rounded-full p-0.5" /> 
                    : <Circle className="h-5 w-5 text-gray-300 dark:text-slate-500" />
                  }
                </button>
              )) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">You need to follow people to invite them to a podcast.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
           <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            {t('edit.button.cancel')}
          </button>
          <button 
            type="submit" 
            className="bg-brand-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:bg-brand-400 dark:disabled:bg-brand-800 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            {t('events.create.button')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};