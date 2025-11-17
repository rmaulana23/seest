
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Event } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { CURRENT_USER_ID } from '../constants';

interface FriendsViewProps {
  allUsers: User[];
  currentUser: User;
  onViewProfile: (userId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  liveEvents: Event[];
}

const UserListItem: React.FC<{
  user: User,
  isFollowing: boolean,
  isLive: boolean,
  onViewProfile: (userId: string) => void,
  onFollow: (userId: string) => void,
  onUnfollow: (userId: string) => void,
  t: (key: string) => string,
}> = ({ user, isFollowing, isLive, onViewProfile, onFollow, onUnfollow, t }) => (
  <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-slate-700/50 rounded-lg hover:bg-brand-100 dark:hover:bg-slate-700 transition-colors">
    <button onClick={() => onViewProfile(user.id)} className="flex items-center gap-4 text-left">
      <div className="h-12 w-12 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">
        {user.avatar}
      </div>
      <div>
        <div className="flex items-center gap-2">
            <p className="font-bold text-gray-800 dark:text-gray-100">@{user.username || user.name}</p>
            {isLive && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-100 bg-red-600 rounded-full animate-pulse">{t('events.live')}</span>
            )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">{user.name}</p>
      </div>
    </button>
    
    {isFollowing ? (
      <button onClick={() => onUnfollow(user.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-100 text-brand-800 dark:bg-slate-600 dark:text-brand-200 font-semibold hover:bg-brand-200 dark:hover:bg-slate-500 transition-colors flex-shrink-0">
        <UserCheck size={16} />
        {t('profile.following')}
      </button>
    ) : (
      <button onClick={() => onFollow(user.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-sm flex-shrink-0">
        <UserPlus size={16} />
        {t('profile.follow')}
      </button>
    )}
  </div>
);

export const FriendsView: React.FC<FriendsViewProps> = ({ allUsers, currentUser, onViewProfile, onFollow, onUnfollow, liveEvents }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const otherUsers = useMemo(() => allUsers.filter(u => u.id !== CURRENT_USER_ID && u.id !== 'anonymous'), [allUsers]);

  const mutuals = useMemo(() => {
    return otherUsers.filter(user => 
      currentUser.following.includes(user.id) && user.following.includes(currentUser.id)
    );
  }, [otherUsers, currentUser]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return otherUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, otherUsers]);

  const isSearching = searchTerm.trim().length > 0;
  const usersToShow = isSearching ? searchResults : mutuals;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('friends.title')}</h2>
        <div className="relative">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('friends.search.placeholder')}
            className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-shadow dark:text-gray-200"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 px-2">
          {isSearching ? t('friends.search.resultsTitle') : t('friends.mutuals.title')}
        </h3>
        {usersToShow.length > 0 ? (
          usersToShow.map(user => (
            <UserListItem
              key={user.id}
              user={user}
              isFollowing={currentUser.following.includes(user.id)}
              isLive={liveEvents.some(e => e.creatorId === user.id)}
              onViewProfile={onViewProfile}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              t={t}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
            <p>
              {isSearching ? t('friends.search.empty') : t('friends.mutuals.empty')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};