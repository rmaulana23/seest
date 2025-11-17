import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { Wrench } from 'lucide-react';

export const ComingSoonView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto flex items-center justify-center h-full"
    >
        <div className="text-center text-gray-500 dark:text-gray-400 p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
            <Wrench className="mx-auto h-16 w-16 text-brand-500 mb-6"/>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('comingSoon.title')}</h2>
            <p>{t('comingSoon.description')}</p>
        </div>
    </motion.div>
  );
};
