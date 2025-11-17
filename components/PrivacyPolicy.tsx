import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl dark:border dark:border-slate-700"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
      >
        <ArrowLeft size={16} />
        {t('common.backToSettings')}
      </button>

      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('privacy.title')}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 !-mt-2">{t('privacy.lastUpdated')}</p>
        
        <p>{t('privacy.p1')}</p>
        <p>{t('privacy.p2')}</p>
        <p>{t('privacy.p3')}</p>
        <p>{t('privacy.p4')}</p>
      </div>
    </motion.div>
  );
};