
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, ChevronRight, Shield, User, Circle, HelpCircle, PlayCircle, Settings } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [activeTopic, setActiveTopic] = useState<string>('register');

  const categories = [
    {
        title: t('help.category.gettingStarted'),
        items: [
            { id: 'register', label: t('help.topic.register.title'), icon: User },
            { id: 'reset', label: t('help.topic.reset.title'), icon: Settings },
        ]
    },
    {
        title: t('help.category.features'),
        items: [
            { id: 'stories', label: t('help.topic.stories.title'), icon: PlayCircle },
            { id: 'circle', label: t('help.topic.circle.title'), icon: Circle },
            { id: 'ask', label: t('help.topic.ask.title'), icon: HelpCircle },
            { id: 'profile', label: t('help.topic.profile.title'), icon: User },
        ]
    },
    {
        title: t('help.category.account'),
        items: [
            { id: 'delete', label: t('help.topic.delete.title'), icon: Shield },
        ]
    }
  ];

  const getContent = (id: string) => {
      switch(id) {
          case 'register': return { title: t('help.topic.register.title'), body: t('help.topic.register.body') };
          case 'reset': return { title: t('help.topic.reset.title'), body: t('help.topic.reset.body') };
          case 'delete': return { title: t('help.topic.delete.title'), body: t('help.topic.delete.body') };
          case 'stories': return { title: t('help.topic.stories.title'), body: t('help.topic.stories.body') };
          case 'circle': return { title: t('help.topic.circle.title'), body: t('help.topic.circle.body') };
          case 'ask': return { title: t('help.topic.ask.title'), body: t('help.topic.ask.body') };
          case 'profile': return { title: t('help.topic.profile.title'), body: t('help.topic.profile.body') };
          default: return { title: '', body: '' };
      }
  }

  const activeContent = getContent(activeTopic);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-800 w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar (Topics) */}
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-brand-600 text-white p-2 rounded-lg">
                        <Book size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('help.title')}</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('help.subtitle')}</p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {categories.map((cat, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{cat.title}</h3>
                        <div className="space-y-1">
                            {cat.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTopic(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        activeTopic === item.id 
                                        ? 'bg-brand-100 text-brand-700 dark:bg-slate-700 dark:text-brand-300' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <item.icon size={16} />
                                    <span className="flex-grow text-left">{item.label}</span>
                                    {activeTopic === item.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors z-10"
            >
                <X size={20} />
            </button>

            <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <motion.div
                    key={activeTopic}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{activeContent.title}</h2>
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                        {activeContent.body}
                    </div>
                </motion.div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
