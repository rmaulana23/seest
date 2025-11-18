
import React from 'react';
import { LayoutGrid, Settings, HelpCircle, Users, User } from 'lucide-react';
import { Page } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface BottomNavbarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  onNavigateToProfile: () => void;
}

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-full h-full p-2 transition-opacity duration-200 text-white ${
      isActive
        ? 'font-bold opacity-100'
        : 'opacity-70 hover:opacity-100'
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);


export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activePage, setPage, onNavigateToProfile }) => {
  const { t } = useTranslation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-600 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <nav className="grid grid-cols-5 justify-around items-center h-full">
        <NavButton icon={<LayoutGrid size={24} />} label={t('nav.feed.short')} isActive={activePage === 'home'} onClick={() => setPage('home')} />
        <NavButton icon={<Users size={24} />} label={t('nav.friends.short')} isActive={activePage === 'friends'} onClick={() => setPage('friends')} />
        <NavButton icon={<HelpCircle size={24} />} label={t('nav.ask.short')} isActive={activePage === 'ask'} onClick={() => setPage('ask')} />
        <NavButton icon={<Settings size={24} />} label={t('nav.settings.short')} isActive={activePage === 'settings'} onClick={() => setPage('settings')} />
        <NavButton icon={<User size={24} />} label={t('nav.profile.short')} isActive={activePage === 'profile'} onClick={onNavigateToProfile} />
      </nav>
    </div>
  );
};
