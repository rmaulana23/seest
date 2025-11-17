import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, User, Reactions } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight, Send, Star } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';
import { REACTION_EMOJIS, CURRENT_USER_ID } from '../constants';

const STORY_DURATION_MS = 5000; // 5 seconds for images

interface StoryViewerProps {
  usersWithStories: User[];
  allPosts: Post[];
  initialUserIndex: number;
  onClose: () => void;
  onReact: (postId: number, emoji: string) => void;
  onViewProfile: (userId: string) => void;
  isFavorited: (postId: number) => boolean;
  onToggleFavorite: (postId: number) => void;
}

const MediaCarousel: React.FC<{
    media: Post['media'], 
    onFinish: () => void,
    isPaused: boolean,
    onManualChange: () => void,
}> = ({ media, onFinish, isPaused, onManualChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isPaused) return;

        if (media.length > 1) {
            timerRef.current = setTimeout(() => {
                if (currentIndex < media.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    onFinish();
                }
            }, STORY_DURATION_MS);
        } else if (media.length === 1 && media[0].type === 'image') {
            timerRef.current = setTimeout(onFinish, STORY_DURATION_MS);
        }

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [currentIndex, isPaused, media, onFinish]);


    if (!media || media.length === 0) return null;

    const goToPrevious = () => {
        onManualChange();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : 0));
    };
    const goToNext = () => {
        onManualChange();
        if (currentIndex < media.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const currentMedia = media[currentIndex];
    
    return (
        <div className="absolute inset-0">
             {media.length > 1 && (
                <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
                    {media.map((_, index) => (
                        <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                             {index <= currentIndex && (
                                <motion.div 
                                    className="h-full bg-white"
                                    initial={{ width: index < currentIndex ? '100%' : '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: STORY_DURATION_MS/1000, ease: 'linear' }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                >
                    {currentMedia.type === 'video' ? (
                        <video key={currentMedia.url} src={currentMedia.url} className="w-full h-full object-cover" autoPlay muted playsInline onEnded={onFinish} />
                    ) : (
                        <img src={currentMedia.url} alt="Story content" className="w-full h-full object-cover" />
                    )}
                </motion.div>
            </AnimatePresence>
            {media.length > 1 && (
                 <>
                    <div className="absolute left-0 top-0 h-full w-1/3 z-30" onClick={goToPrevious} />
                    <div className="absolute right-0 top-0 h-full w-1/3 z-30" onClick={goToNext} />
                </>
            )}
        </div>
    );
};

export const StoryViewer: React.FC<StoryViewerProps> = ({
  usersWithStories,
  allPosts,
  initialUserIndex,
  onClose,
  onReact,
  onViewProfile,
  isFavorited,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentUser = usersWithStories[currentUserIndex];
  const userStories = allPosts.filter(p => p.userId === currentUser.id && p.postType === 'status');
  const currentStory = userStories[currentStoryIndex];
  
  const goToNextUser = useCallback(() => {
    if (currentUserIndex < usersWithStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentUserIndex, usersWithStories, onClose]);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      goToNextUser();
    }
  }, [currentStoryIndex, userStories, goToNextUser]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentUser || !currentStory) {
    return null;
  }

  const handlePause = (pause: boolean) => {
    setIsPaused(pause);
  };
  
  const favorited = isFavorited(currentStory.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onMouseDown={() => handlePause(true)}
      onMouseUp={() => handlePause(false)}
      onTouchStart={() => handlePause(true)}
      onTouchEnd={() => handlePause(false)}
    >
      <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Story Content */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentStory.id}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
             {currentStory.media.length > 0 ? (
                <MediaCarousel media={currentStory.media} onFinish={goToNextStory} isPaused={isPaused} onManualChange={() => {}} />
            ) : (
                <div className={`absolute inset-0 w-full h-full ${currentStory.backgroundColor}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="relative z-10 flex items-center justify-center h-full text-white p-8">
               {currentStory.text && (
                  <p className="text-center font-bold drop-shadow-lg text-3xl">{currentStory.text}</p>
               )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* UI Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col text-white pointer-events-none">
          {/* Header */}
          <header className="flex items-center justify-between p-3 pt-6 pointer-events-auto">
            <button onClick={() => onViewProfile(currentUser.id)} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-lg">
                {currentUser.avatar}
              </div>
              <div>
                <div className="font-semibold drop-shadow-md">@{currentUser.name}</div>
                <div className="text-xs text-white/80 drop-shadow-sm">{formatTimeAgo(currentStory.createdAt, t)}</div>
              </div>
            </button>
            <div className="flex items-center">
              <button
                onClick={() => onToggleFavorite(currentStory.id)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={favorited ? 'Remove favorite' : 'Add favorite'}
              >
                <Star size={24} className={favorited ? 'fill-current text-yellow-500' : ''}/>
              </button>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="flex-grow" />

          {/* Footer */}
          <footer className="p-4 pointer-events-auto">
            <div className="flex items-center justify-center gap-3">
                {REACTION_EMOJIS.map(emoji => (
                    <button 
                        key={emoji} 
                        onClick={() => onReact(currentStory.id, emoji)}
                        className="px-4 py-2 text-2xl rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all transform hover:scale-110"
                    >
                        <span>{emoji}</span>
                    </button>
                ))}
            </div>
          </footer>
        </div>
      </div>
    </motion.div>
  );
};