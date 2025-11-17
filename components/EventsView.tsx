import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { Calendar, PlusCircle, Mic, Users } from 'lucide-react';
import { Event, User } from '../types';

interface EventsViewProps {
  events: Event[];
  users: User[];
  onJoinEvent: (eventId: number) => void;
  onCreateEvent: (type: 'stand-up' | 'podcast') => void;
  currentUser: User | undefined;
}

const EventCard: React.FC<{ event: Event; users: User[]; onJoinEvent: (id: number) => void }> = ({ event, users, onJoinEvent }) => {
    const { t } = useTranslation();
    const speakers = event.speakers.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-start gap-5"
        >
            {event.coverImage && (
                <img src={event.coverImage} alt={event.title} className="w-full sm:w-28 sm:h-28 h-40 object-cover rounded-lg flex-shrink-0 bg-slate-100 dark:bg-slate-700" />
            )}
            <div className="flex-grow flex flex-col sm:flex-row items-start justify-between w-full gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold text-red-100 bg-brand-600 rounded-full animate-pulse">{t('events.live')}</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{event.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Mic size={16} className="text-brand-600" />
                            <span className="font-semibold">{t('events.speakers')}:</span>
                            <div className="flex -space-x-2">
                                {speakers.slice(0, 4).map(s => (
                                    <div key={s.id} className="h-6 w-6 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 font-bold text-[10px]" title={s.name}>
                                        {s.avatar}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-brand-600" />
                            <span className="font-semibold">{event.listeners.length} {t('events.listeners')}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onJoinEvent(event.id)}
                    className="w-full sm:w-auto mt-2 sm:mt-0 sm:self-center flex-shrink-0 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    {t('events.join')}
                </button>
            </div>
        </motion.div>
    )
}

const TrendingEventCard: React.FC<{ event: Event; users: User[]; onJoinEvent: (id: number) => void }> = ({ event, users, onJoinEvent }) => {
    const { t } = useTranslation();
    const speakers = event.speakers.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

    return (
        <button
            onClick={() => onJoinEvent(event.id)}
            className="relative w-full h-48 rounded-2xl overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 transition-transform duration-200 ease-in-out hover:-translate-y-1"
        >
            {event.coverImage ? (
                <img src={event.coverImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-500 to-brand-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
            <div className="absolute top-3 left-3 px-2 py-0.5 text-xs font-bold text-red-100 bg-brand-600 rounded-full animate-pulse">{t('events.live')}</div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold bg-black/30 px-2 py-1 rounded-full">
                        <Users size={14} />
                        <span>{event.listeners.length} {t('events.listeners')}</span>
                    </div>
                    <div className="flex -space-x-2">
                        {speakers.slice(0, 3).map(s => (
                            <div key={s.id} className="h-7 w-7 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 font-bold text-[10px]" title={s.name}>
                                {s.avatar}
                            </div>
                        ))}
                    </div>
                </div>
                <h4 className="font-bold text-lg truncate drop-shadow-md">{event.title}</h4>
            </div>
        </button>
    );
}

export const EventsView: React.FC<EventsViewProps> = ({ events, users, onJoinEvent, onCreateEvent, currentUser }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'stand-up' | 'podcast'>('stand-up');

  const trendingEvents = useMemo(() => {
    return [...events].sort((a, b) => b.listeners.length - a.listeners.length).slice(0, 3);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => event.type === activeTab);
  }, [events, activeTab]);

  const hasActiveEvent = useMemo(() => {
    if (!currentUser) return false;
    return events.some(e => e.creatorId === currentUser.id);
  }, [events, currentUser]);

  const TabButton = ({ type, label }: { type: 'stand-up' | 'podcast', label: string }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors w-full
        ${activeTab === type 
          ? 'bg-brand-600 text-white shadow-md' 
          : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-slate-600'
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('events.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('events.description')}</p>
        </div>
        <button 
            onClick={() => onCreateEvent(activeTab)}
            disabled={hasActiveEvent}
            title={hasActiveEvent ? t('events.create.disabled') : t('events.button.create')}
            className="flex-shrink-0 flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <PlusCircle size={18}/>
            {t('events.button.create')}
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('events.trending.title')}</h3>
        {trendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingEvents.map(event => (
                    <TrendingEventCard key={event.id} event={event} users={users} onJoinEvent={onJoinEvent} />
                ))}
            </div>
        ) : (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 px-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <p>{t('events.trending.empty')}</p>
            </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('events.browse.title')}</h3>
        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl mb-6">
            <TabButton type="stand-up" label={t('events.standup.title')} />
            <TabButton type="podcast" label={t('events.podcast.title')} />
        </div>
      
        {filteredEvents.length > 0 ? (
            <div className="space-y-4">
                {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} users={users} onJoinEvent={onJoinEvent} />
                ))}
            </div>
        ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:border dark:border-slate-700">
                <Calendar className="mx-auto h-16 w-16 text-brand-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('events.empty.title')}</h3>
                <p>{t('events.empty.description')}</p>
            </div>
        )}
      </div>
    </motion.div>
  );
};