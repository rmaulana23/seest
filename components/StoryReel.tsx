
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Post } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { CURRENT_USER_ID } from '../constants';
import { Users } from 'lucide-react';

interface StoryReelProps {
  usersWithStories: User[];
  posts: Post[];
  onViewStory: (userIndex: number) => void;
  onNavigateToFriends?: () => void;
}

export const StoryReel: React.FC<StoryReelProps> = ({ usersWithStories, posts, onViewStory, onNavigateToFriends }) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        container.scrollTo({
          left: container.scrollLeft + e.deltaY,
          behavior: 'smooth',
        });
      };
      container.addEventListener('wheel', onWheel, { passive: false });
      return () => container.removeEventListener('wheel', onWheel);
    }
  }, []);

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 px-2">{t('stories.title')}</h3>
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar"
      >
        {usersWithStories.length === 0 ? (
            <button 
                onClick={onNavigateToFriends}
                className="relative w-48 h-40 rounded-xl overflow-hidden flex-shrink-0 flex flex-col items-center justify-center gap-3 bg-brand-50 dark:bg-slate-700/50 border-2 border-dashed border-brand-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-brand-100 dark:hover:bg-slate-600 transition-colors group"
            >
                <div className="p-3 rounded-full bg-white dark:bg-slate-800 group-hover:scale-110 transition-transform shadow-sm">
                    <Users size={24} className="text-brand-500" />
                </div>
                <div className="text-center px-2">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('stories.empty.action')}</p>
                    <p className="text-xs opacity-70">{t('stories.empty.desc')}</p>
                </div>
            </button>
        ) : (
            usersWithStories.map((user, index) => {
            // Since posts are sorted by date, the first one we find is the latest.
            const latestStory = posts.find(p => p.userId === user.id);
            if (!latestStory) return null;

            return (
                <motion.button
                key={user.id}
                onClick={() => onViewStory(index)}
                className="relative w-28 h-40 rounded-xl overflow-hidden flex-shrink-0 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 shadow-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                {/* Background Media/Color */}
                {latestStory.media?.length > 0 && latestStory.media[0].type === 'image' ? (
                    <img src={latestStory.media[0].url} alt={user.name + "'s story"} className="absolute inset-0 w-full h-full object-cover" />
                ) : latestStory.media?.length > 0 && latestStory.media[0].type === 'video' ? (
                    <video src={latestStory.media[0].url} muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : latestStory.backgroundColor ? (
                    <div className={`absolute inset-0 w-full h-full ${latestStory.backgroundColor}`} />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-slate-200 dark:bg-slate-700" /> // Fallback
                )}
                
                {/* Text for color-only backgrounds */}
                {latestStory.backgroundColor && !latestStory.media.length && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                        <p className="text-center font-bold text-xs leading-tight drop-shadow-md">{latestStory.text}</p>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* User Info Overlay */}
                <div className="relative z-10 flex flex-col justify-end h-full p-2 text-left">
                    <div className="h-9 w-9 mb-1 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 font-bold text-base flex-shrink-0">
                    {user.avatar}
                    </div>
                    <span className="text-xs font-semibold truncate drop-shadow-md">
                    @{user.id === CURRENT_USER_ID ? t('post.user.you') : user.name}
                    </span>
                </div>
                </motion.button>
            )
            })
        )}
      </div>
    </div>
  );
};
