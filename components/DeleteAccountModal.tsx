
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAccountModalProps {
  onDeleteAccount: () => Promise<{ error?: string } | void>;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onDeleteAccount, onClose }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsDeleting(true);
    const result = await onDeleteAccount();
    if (result && result.error) {
        setError(result.error);
        setIsDeleting(false);
    }
    // If successful, the app state will handle redirection/logout
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
             <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('deleteAccount.warning.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed">{t('deleteAccount.warning.text')}</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
                {error}
            </div>
        )}

        <div className="space-y-3">
            <button 
                onClick={handleConfirm} 
                disabled={isDeleting}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {isDeleting ? 'Deleting...' : (
                    <>
                        <Trash2 size={18} />
                        {t('deleteAccount.confirm')}
                    </>
                )}
            </button>
            <button 
                onClick={onClose} 
                disabled={isDeleting}
                className="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
            >
                {t('deleteAccount.cancel')}
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
