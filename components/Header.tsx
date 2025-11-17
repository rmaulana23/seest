import React from 'react';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { User, Activity, Notification } from '../types';
import { ActivityFilter } from './ActivityFilter';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
    currentUser: User | undefined;
    users: User[];
    onOpenMessages: () => void;
    onNavigateToProfile: () => void;
    activityFilter: Activity | null;
    onFilterActivity: (activity: Activity | null) => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
    hasUnreadNotifications: boolean;
    hasUnreadMessages: boolean;
    onNotificationClick?: (notification: Notification) => void;
    onCreatePost: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, users, onOpenMessages, onNavigateToProfile, activityFilter, onFilterActivity, notifications, onMarkAllRead, hasUnreadNotifications, hasUnreadMessages, onNotificationClick, onCreatePost }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed top-0 left-0 right-0 p-4 z-40 bg-gray-100 dark:bg-slate-900">
      <header className="max-w-7xl mx-auto bg-brand-600 text-white rounded-2xl shadow-lg py-3 px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
            <img src="https://i.imgur.com/e00ntr3.jpg" alt="SEEST Logo" className="w-8 h-8 rounded-lg bg-white/10" />
            <h1 className="text-xl font-bold tracking-wider">SEEST</h1>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex-1 hidden md:flex justify-center px-4">
          <div className="w-full max-w-lg relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-white/70" size={20} />
            <input
              type="text"
              placeholder={t('header.search.placeholder') + " users..."}
              className="w-full bg-white/20 dark:bg-slate-900/30 text-white placeholder-white/70 rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right-side Icons */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Mobile Icons */}
            <div className="flex md:hidden items-center gap-1">
              <ActivityFilter activityFilter={activityFilter} onFilterActivity={onFilterActivity} isHeader />
              <NotificationBell isHeader notifications={notifications} users={users} onMarkAllRead={onMarkAllRead} hasUnread={hasUnreadNotifications} onNotificationClick={onNotificationClick} />
               <button onClick={onOpenMessages} className="relative p-2.5 text-white hover:bg-white/10 rounded-full transition-colors">
                <MessageSquare size={20} />
                 {hasUnreadMessages && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-brand-600"></span>
                )}
              </button>
            </div>
            
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <NotificationBell isHeader notifications={notifications} users={users} onMarkAllRead={onMarkAllRead} hasUnread={hasUnreadNotifications} onNotificationClick={onNotificationClick} />
              <button onClick={onOpenMessages} className="relative p-2.5 hover:bg-white/10 rounded-full transition-colors">
                <MessageSquare size={22} />
                 {hasUnreadMessages && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-brand-600"></span>
                )}
              </button>
            </div>

            {/* Shared Profile Icon */}
            {currentUser && (
                <button onClick={onNavigateToProfile} className="flex items-center justify-center w-9 h-9 bg-white/20 border-2 border-white/50 rounded-full hover:bg-white/30 transition-colors">
                <span className="font-bold text-md text-white">{currentUser.avatar}</span>
                </button>
            )}
        </div>
      </header>
    </div>
  );
};