import React, { useMemo } from 'react';
import { LayoutGrid, Settings, Wind, HelpCircle, Users, Star, Calendar, Plus } from 'lucide-react';
import { Page, User as UserType, Event } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface LeftSidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  currentUser: UserType | undefined;
  onNavigateToProfile: () => void;
  liveEvents: Event[];
  onCreatePost: () => void;
}

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, description, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-start gap-2 text-left p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-600 text-white font-semibold shadow-md'
        : 'hover:bg-brand-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'
    }`}
  >
    <div className="mt-1">{icon}</div>
    <div>
      <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{label}</span>
      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>
    </div>
  </button>
);


export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activePage, setPage, currentUser, onNavigateToProfile, liveEvents, onCreatePost }) => {
  const { t } = useTranslation();
  
  const userName = currentUser ? (currentUser.id === 'user-you' ? t('sidebar.profile.you') : currentUser.name) : '...';
  
  const isCurrentUserLive = useMemo(() => {
    if (!currentUser) return false;
    return liveEvents.some(event => event.creatorId === currentUser.id);
  }, [liveEvents, currentUser]);

  return (
    <aside className="w-full md:w-64 lg:w-72 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-brand-200/50 dark:border-slate-700/50 sticky top-28 h-[calc(100vh-8rem)] rounded-2xl flex-col hidden md:flex overflow-y-auto custom-scrollbar">
      {currentUser && (
        <button
          onClick={onNavigateToProfile}
          className={`w-full flex items-center gap-3 mb-6 p-3 rounded-lg text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            activePage === 'profile'
              ? 'bg-brand-200 dark:bg-slate-600/80 ring-2 ring-brand-400 dark:ring-brand-500'
              : isCurrentUserLive 
              ? 'bg-brand-100 dark:bg-brand-900/20 hover:bg-brand-200/70 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800/50'
              : 'bg-brand-50 dark:bg-slate-700 hover:bg-brand-100 dark:hover:bg-slate-600'
          }`}
          aria-label={t('nav.profile')}
        >
          <div className="h-12 w-12 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">
            {currentUser.avatar}
          </div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-100">@{userName}</div>
            {isCurrentUserLive ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">{t('events.live')}</span>
              </div>
            ) : (
               <div className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.profile.active')}</div>
            )}
          </div>
        </button>
      )}
      
      <nav className="space-y-1 flex-grow">
        <NavButton icon={<LayoutGrid size={20} />} label={t('nav.feed')} description={t('nav.feed.desc')} isActive={activePage === 'home'} onClick={() => setPage('home')} />
        <NavButton icon={<Plus size={20} />} label={t('create.newStoryButton')} description={t('create.newStoryButton.desc')} isActive={activePage === 'create'} onClick={onCreatePost} />
        <NavButton icon={<Users size={20} />} label={t('nav.friends')} description={t('nav.friends.desc')} isActive={activePage === 'friends'} onClick={() => setPage('friends')} />
        <NavButton icon={<HelpCircle size={20} />} label={t('nav.ask')} description={t('nav.ask.desc')} isActive={activePage === 'ask'} onClick={() => setPage('ask')} />
        <NavButton icon={<Calendar size={20} />} label={t('nav.events')} description={t('nav.events.desc')} isActive={activePage === 'events'} onClick={() => setPage('events')} />
        <NavButton icon={<Settings size={20} />} label={t('nav.settings')} description={t('nav.settings.desc')} isActive={activePage === 'settings'} onClick={() => setPage('settings')} />
      </nav>
    </aside>
  );
};