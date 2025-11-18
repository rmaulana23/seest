
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { X, Save, Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  onChangePassword: (password: string) => Promise<{ error: any | null }>;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onChangePassword, onClose }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
        setError(t('changePassword.error.length'));
        return;
    }

    if (newPassword !== confirmPassword) {
        setError(t('changePassword.error.match'));
        return;
    }

    setIsSubmitting(true);
    const { error } = await onChangePassword(newPassword);
    setIsSubmitting(false);

    if (error) {
        setError(error.message || 'Failed to update password.');
    } else {
        setSuccess(t('changePassword.success'));
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(onClose, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-sm w-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
             <Lock size={20} />
             {t('changePassword.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">{t('changePassword.new')}</label>
                <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 transition-all outline-none dark:text-white" 
                    required
                />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">{t('changePassword.confirm')}</label>
                <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 transition-all outline-none dark:text-white" 
                    required
                />
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                    {isSubmitting ? '...' : (
                        <>
                            <Save size={18} />
                            {t('changePassword.button.save')}
                        </>
                    )}
                </button>
            </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
