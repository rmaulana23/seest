import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Type, Send, X, UploadCloud, Palette, Video } from 'lucide-react';
import { Activity } from '../types';
import { ACTIVITIES, STATUS_BACKGROUNDS, ACTIVITY_CONFIG } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

interface CreatePostFormProps {
  onAddPost: (postData: { text: string; activity: Activity; media: { url: string, type: 'image' | 'video' }[]; backgroundColor: string | null; postType: 'status' | 'ask', aspectRatio?: 'portrait' | 'landscape' }) => void;
  onClose: () => void;
  startAsAnonymous?: boolean;
}

const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onAddPost, onClose, startAsAnonymous }) => {
  const { t } = useTranslation();
  const [activity, setActivity] = useState<Activity>(ACTIVITIES[0]);
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAsk, setIsAsk] = useState(startAsAnonymous || false);
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape' | undefined>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const charCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && mediaPreview.length === 0 && !backgroundColor) return;
    
    onAddPost({ text, activity, media: mediaPreview, backgroundColor, postType: isAsk ? 'ask' : 'status', aspectRatio });
    onClose();
  };
  
  const handleClear = () => {
    setText("");
    setMediaPreview([]);
    setBackgroundColor(null);
    setActivity(ACTIVITIES[0]);
    setIsAsk(false);
    setAspectRatio(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleFileProcessing = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBackgroundColor(null);

    const resetInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const hasVideo = Array.from(files).some(f => f.type.startsWith('video/'));
    const hasImage = Array.from(files).some(f => f.type.startsWith('image/'));

    if (hasVideo && hasImage) {
        alert(t('create.media.videoAndImageError'));
        resetInput();
        return;
    }

    if (hasVideo) {
        if (files.length > 1) {
            alert(t('create.media.videoAndImageError')); // Simple message for now
            resetInput();
            return;
        }
        const file = files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 60) {
                alert(t('create.media.videoTooLong'));
                resetInput();
                return;
            }
            try {
                const base64 = await fileToBase64(file);
                const ar = video.videoWidth / video.videoHeight < 1 ? 'portrait' : 'landscape';
                setAspectRatio(ar);
                setMediaPreview([{ url: base64, type: 'video' }]);
            } catch (error) {
                console.error("Error converting file to base64", error);
                resetInput();
            }
        };
        video.onerror = () => { console.error("Error loading video metadata"); resetInput(); };
        video.src = URL.createObjectURL(file);

    } else if (hasImage) {
        if (files.length > 5) {
            alert(t('create.media.imageLimitError'));
            resetInput();
            return;
        }

        const firstFile = files[0];
        const img = new window.Image();
        img.onload = async () => {
            const ar = img.naturalWidth / img.naturalHeight < 1 ? 'portrait' : 'landscape';
            setAspectRatio(ar);
            URL.revokeObjectURL(img.src);

            const imagePromises = Array.from(files).map(file => fileToBase64(file));
            try {
                const base64Images = await Promise.all(imagePromises);
                setMediaPreview(base64Images.map(url => ({ url, type: 'image' })));
            } catch (error) {
                console.error("Error converting images to base64", error);
                resetInput();
            }
        };
        img.onerror = () => { console.error("Error loading image dimensions"); resetInput(); };
        img.src = URL.createObjectURL(firstFile);
    }
  }, [t]);
  
  const handleSelectColor = (color: string) => {
      setBackgroundColor(color);
      handleRemoveAllMedia();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
          handleFileProcessing(files);
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
        handleFileProcessing(files);
        if (fileInputRef.current) {
            fileInputRef.current.files = files;
        }
    }
  };
  
  const handleRemoveMedia = (index: number) => {
      setMediaPreview(prev => {
        const newMedia = prev.filter((_, i) => i !== index);
        if (newMedia.length === 0) {
            setAspectRatio(undefined);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
        return newMedia;
      });
  };

  const handleRemoveAllMedia = () => {
    setMediaPreview([]);
    setAspectRatio(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('create.title')}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 bg-brand-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
            <div>
                <label htmlFor="ask-toggle" className="font-semibold text-gray-700 dark:text-gray-200">{t('create.ask.label')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('create.ask.description')}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAsk(!isAsk)}
              className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full transition-colors ${isAsk ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'}`}
              id="ask-toggle"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAsk ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        
        <AnimatePresence>
          {!isAsk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mb-4">
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
          />
           <span className={`absolute bottom-3 right-3 text-xs ${charCount > 140 ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount}/150
          </span>
        </div>

        {!isAsk && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {backgroundColor ? t('create.media.changeBg') : t('create.media.label')}
                </label>
            </div>
            
            {!mediaPreview.length && (
                <div className="flex items-center gap-2 mb-4">
                    {STATUS_BACKGROUNDS.map(bg => (
                        <button
                            type="button"
                            key={bg}
                            onClick={() => handleSelectColor(bg)}
                            className={`w-8 h-8 rounded-full ${bg} border-2 transition-transform transform hover:scale-110 ${backgroundColor === bg ? 'border-brand-500 scale-110' : 'border-white/50'}`}
                            aria-label={`Select ${bg} background`}
                         />
                    ))}
                    {backgroundColor && (
                        <button type="button" onClick={() => setBackgroundColor(null)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}
            
            {mediaPreview.length > 0 ? (
                    <div className="grid grid-cols-5 gap-2">
                        {mediaPreview.map((media, index) => (
                           <div key={index} className="relative group aspect-square">
                                <img src={media.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg bg-slate-100 dark:bg-slate-700"/>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveMedia(index)}
                                    className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="Remove media"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div 
                        onClick={() => !backgroundColor && fileInputRef.current?.click()}
                        onDragOver={!backgroundColor ? handleDragOver : undefined}
                        onDragLeave={!backgroundColor ? handleDragLeave : undefined}
                        onDrop={!backgroundColor ? handleDrop : undefined}
                        className={`relative w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors border-gray-300 dark:border-slate-600 ${!backgroundColor ? 'cursor-pointer hover:border-brand-400 dark:hover:border-brand-500' : 'opacity-50' } ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-slate-700' : ''}`}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/png, image/jpeg, image/gif, video/mp4"
                            className="hidden"
                            multiple
                            disabled={!!backgroundColor}
                        />
                        <UploadCloud className={`h-8 w-8 mb-2 transition-colors ${isDragging ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        <p className={`text-sm font-semibold transition-colors ${isDragging ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {t('create.media.upload')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('create.media.fileTypes')}</p>
                    </div>
                )
            }
          </motion.div>
        )}


        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={handleClear} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            <X size={16} /> {t('create.button.clear')}
          </button>
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:bg-brand-400 dark:disabled:bg-brand-800 disabled:cursor-not-allowed"
            disabled={!text.trim() && mediaPreview.length === 0 && !backgroundColor}
          >
            <Send size={16} /> {isAsk ? t('create.button.ask') : t('create.button.post')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};