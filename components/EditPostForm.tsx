import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Send, X } from 'lucide-react';
import { Activity, Post } from '../types';
import { ACTIVITIES, ACTIVITY_CONFIG } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

interface EditPostFormProps {
  post: Post;
  onUpdatePost: (postId: number, updates: { text: string; activity: Activity }) => void;
  onClose: () => void;
}

const MediaPreview: React.FC<{media: Post['media']}> = ({ media }) => {
    if (!media || media.length === 0) return null;
    
    if (media.length === 1 && media[0].type === 'video') {
        return <video src={media[0].url} controls muted loop className="w-full h-auto max-h-40 rounded-lg bg-slate-100 dark:bg-slate-700 mb-4"/>
    }
    
    return (
        <div className="grid grid-cols-5 gap-2 mb-4">
            {media.map((item, index) => (
                <div key={index} className="aspect-square">
                    <img src={item.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg bg-slate-100 dark:bg-slate-700"/>
                </div>
            ))}
        </div>
    );
}

export const EditPostForm: React.FC<EditPostFormProps> = ({ post, onUpdatePost, onClose }) => {
  const { t } = useTranslation();
  const [activity, setActivity] = useState<Activity>(post.activity);
  const [text, setText] = useState(post.text);
  const charCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !post.media && !post.backgroundColor) return;
    onUpdatePost(post.id, { text, activity });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-2xl w-full mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('edit.title')}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {post.media && <MediaPreview media={post.media} />}
        
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('create.activity.label')}</label>
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
        

        <div className="relative mb-6">
           <label htmlFor="statusText" className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 block">{t('create.text.label')}</label>
           <Type className="absolute top-11 left-3 text-gray-400 dark:text-gray-500" size={20} />
          <textarea 
            id="statusText"
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder={t('create.text.placeholder')} 
            maxLength={150} 
            className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200"
            rows={3}
            autoFocus
          />
           <span className={`absolute bottom-3 right-3 text-xs ${charCount > 140 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount}/150
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            {t('edit.button.cancel')}
          </button>
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:bg-brand-400 dark:disabled:bg-brand-800 disabled:cursor-not-allowed"
            disabled={!text.trim() && !post.media && !post.backgroundColor}
          >
            <Send size={16} /> {t('edit.button.save')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};