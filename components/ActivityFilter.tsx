import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '../types';
import { ACTIVITIES, ACTIVITY_CONFIG } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';
import { ChevronDown, Filter } from 'lucide-react';

interface ActivityFilterProps {
  activityFilter: Activity | null;
  onFilterActivity: (activity: Activity | null) => void;
  isHeader?: boolean;
}

export const ActivityFilter: React.FC<ActivityFilterProps> = ({ activityFilter, onFilterActivity, isHeader }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleSelect = (activity: Activity | null) => {
      onFilterActivity(activity);
      setIsOpen(false);
  }
  
  const selectedConfig = activityFilter ? ACTIVITY_CONFIG[activityFilter] : null;
  const SelectedIcon = selectedConfig ? selectedConfig.icon : Filter;

  const buttonClasses = isHeader
    ? "p-2.5 text-white hover:bg-white/10 rounded-full transition-colors"
    : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm bg-white text-gray-700 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600";

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={buttonClasses}>
        <SelectedIcon size={20} />
        {!isHeader && <span>{activityFilter ? t(`activity.${activityFilter}` as any) : t('sidebar.filter.title')}</span>}
        {!isHeader && <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-100 dark:border-slate-600 z-30 overflow-hidden"
          >
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
            >
                <Filter size={16} className="text-gray-500" />
                <span>{t('sidebar.filter.all')}</span>
            </button>
            <div className="border-t border-gray-100 dark:border-slate-600 my-1" />
            {ACTIVITIES.map(activity => {
              const config = ACTIVITY_CONFIG[activity];
              return (
                <button
                  key={activity}
                  onClick={() => handleSelect(activity)}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                >
                  <config.icon size={16} />
                  <span>{t(`activity.${activity}` as any)}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};