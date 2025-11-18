
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { ArrowLeft, X } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  mode?: 'settings' | 'modal';
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, mode = 'settings' }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: mode === 'settings' ? 50 : 0, y: mode === 'modal' ? 20 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: mode === 'settings' ? -50 : 0, y: mode === 'modal' ? 20 : 0 }}
      className={`max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:border dark:border-slate-700 ${mode === 'modal' ? 'h-[80vh] overflow-y-auto custom-scrollbar' : 'p-6 sm:p-8'}`}
    >
      {mode === 'settings' ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 mb-6 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <ArrowLeft size={16} />
            {t('common.backToSettings')}
          </button>
      ) : (
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 p-4 border-b border-gray-100 dark:border-slate-700 flex justify-end">
             <button onClick={onBack} className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                <X size={20} />
             </button>
          </div>
      )}

      <div className={`space-y-6 text-gray-600 dark:text-gray-300 ${mode === 'modal' ? 'p-6' : ''}`}>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('privacy.title')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('privacy.lastUpdated')}</p>
        </div>
        
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('privacy.intro.title')}</h3>
            <p>{t('privacy.intro.body')}</p>
        </section>
        
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('privacy.collect.title')}</h3>
            <p>{t('privacy.collect.body')}</p>
        </section>
        
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('privacy.use.title')}</h3>
            <p>{t('privacy.use.body')}</p>
        </section>
        
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('privacy.ephemeral.title')}</h3>
            <p>{t('privacy.ephemeral.body')}</p>
        </section>
        
        <section>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{t('privacy.rights.title')}</h3>
            <p>{t('privacy.rights.body')}</p>
        </section>
      </div>
    </motion.div>
  );
};
