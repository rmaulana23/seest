

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Eye, EyeOff, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsConditions } from './TermsConditions';
import { HelpModal } from './HelpModal';

interface LandingPageProps {
  users: User[];
  onLogin: (email: string, pass: string) => Promise<any>;
  onRegister: (name: string, email: string, password: string) => Promise<any>;
  onResetPassword: (email: string) => Promise<any>;
}

type ViewState = 'landing' | 'login' | 'register' | 'forgot';

const BackgroundTypography = () => {
  const items = useMemo(() => {
    const words = [
      "SEEST", "SOCIAL", "SEEST SOCIAL", "CONNECT", "VIBE", 
      "STORY", "24H", "MOMENT", "CIRCLE", "LIVE", "SHARE", 
      "EPHEMERAL", "NOW", "FRIENDS", "CHAT", "REAL"
    ];
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      text: words[Math.floor(Math.random() * words.length)],
      top: Math.floor(Math.random() * 100),
      left: Math.floor(Math.random() * 100),
      fontSize: Math.floor(Math.random() * 100) + 20 + 'px',
      opacity: (Math.floor(Math.random() * 30) + 10) / 100, // 0.10 to 0.40
      rotate: Math.random() > 0.5 ? 0 : -90,
      fontWeight: Math.random() > 0.5 ? 900 : 700,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
       {items.map(item => (
         <div 
            key={item.id}
            className="absolute text-white drop-shadow-sm whitespace-nowrap uppercase mix-blend-overlay"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              fontSize: item.fontSize,
              opacity: item.opacity,
              transform: `rotate(${item.rotate}deg) translate(-50%, -50%)`,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: item.fontWeight,
            }}
         >
           {item.text}
         </div>
       ))}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ users, onLogin, onRegister, onResetPassword }) => {
  const { t, language, setLanguage } = useTranslation();
  const [view, setView] = useState<ViewState>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState<'privacy' | 'terms' | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error } = await onLogin(email, password);
    setIsLoading(false);
    if (error) {
      setError(error.message || t('auth.error.generic'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Mohon isi semua data.');
      return;
    }
    
    setIsLoading(true);
    const { error } = await onRegister(name, email, password);
    setIsLoading(false);
    
    if (error) {
      setError(error.message || t('auth.error.generic'));
    } else {
      // Set flag for new user tutorial
      localStorage.setItem('seest_new_user', 'true');
      setShowConfirmModal(true);
    }
  };
  
  const handleForgot = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
      const { error } = await onResetPassword(email);
      setIsLoading(false);
      if(error) {
          setError(error.message);
      } else {
          alert(t('auth.forgotPassword.success'));
          setView('login');
      }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-700 text-white font-sans relative overflow-hidden">
      
      {/* Background Word Cloud & Overlay */}
      <BackgroundTypography />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 opacity-80 z-0"></div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
                    className="bg-white text-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                >
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t('auth.signUp.success.title')}</h3>
                    <p className="text-gray-600 mb-6">{t('auth.signUp.success.message')}</p>
                    <button 
                        onClick={() => { setShowConfirmModal(false); setView('login'); }}
                        className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                    >
                        {t('auth.signUp.success.button')}
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legal Pages Modal */}
      <AnimatePresence>
        {activeLegalPage && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
             <div className="w-full max-w-2xl text-gray-800">
               {activeLegalPage === 'privacy' && <PrivacyPolicy onBack={() => setActiveLegalPage(null)} mode="modal" />}
               {activeLegalPage === 'terms' && <TermsConditions onBack={() => setActiveLegalPage(null)} mode="modal" />}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
          {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
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
                    className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-white/20"
                >
                     <button 
                        onClick={() => setShowAbout(false)} 
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <img src="https://i.imgur.com/e00ntr3.jpg" alt="Logo" className="w-12 h-12 rounded-lg" />
                        </div>
                        <h2 className="text-2xl font-bold">{t('landing.about.title')}</h2>
                        <span className="text-xs font-mono text-gray-500 mt-1">v1.0.0 • Beta</span>
                    </div>
                    
                    <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        <p>{t('landing.about.description')}</p>
                        <div className="p-4 bg-brand-50 dark:bg-slate-700/50 rounded-xl border border-brand-100 dark:border-slate-600">
                            <p className="font-medium italic text-brand-800 dark:text-brand-200">"{t('landing.about.mission')}"</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Logo Top Left */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
         <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center justify-center shadow-lg">
            <img src="https://i.imgur.com/e00ntr3.jpg" alt="Logo" className="w-8 h-8 rounded-lg" />
         </div>
         <div className="flex flex-col leading-none drop-shadow-md">
             <span className="font-black text-xl tracking-tighter">SEEST SOCIAL</span>
             <span className="text-[10px] font-medium tracking-widest opacity-80">CAPTURE. SHARE. GONE.</span>
         </div>
      </div>

      {/* Top Right: About & Language */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
             <button 
                onClick={() => setShowHelp(true)} 
                className="text-xs font-bold text-white/80 hover:text-white transition-colors tracking-wider uppercase drop-shadow-md"
            >
                {t('landing.help.button')}
            </button>
            <button 
                onClick={() => setShowAbout(true)} 
                className="text-xs font-bold text-white/80 hover:text-white transition-colors tracking-wider uppercase drop-shadow-md"
            >
                {t('landing.about.button')}
            </button>
            <div className="flex gap-2">
                <button 
                onClick={() => setLanguage('id')} 
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all border border-white/30 flex items-center justify-center ${language === 'id' ? 'bg-white text-brand-600 shadow-lg' : 'bg-black/10 text-white hover:bg-white/10'}`}
                >
                ID
                </button>
                <button 
                onClick={() => setLanguage('en')} 
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all border border-white/30 flex items-center justify-center ${language === 'en' ? 'bg-white text-brand-600 shadow-lg' : 'bg-black/10 text-white hover:bg-white/10'}`}
                >
                EN
                </button>
            </div>
      </div>

      {/* Main Card Centered */}
      <div className="relative z-20 w-full max-w-md p-6">
          <motion.div 
            layout
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative"
          >
             <AnimatePresence mode="wait">
                {view === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center text-center py-6"
                    >
                        <h1 className="text-6xl font-black tracking-tighter mb-0 leading-none drop-shadow-lg">SEEST</h1>
                        <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none drop-shadow-lg">SOCIAL</h1>
                        <p className="text-sm font-bold tracking-[0.3em] uppercase opacity-90 mb-12 drop-shadow-md">Ephemeral Status</p>
                        
                        <div className="w-full space-y-4">
                            <button 
                                onClick={() => setView('login')} 
                                className="w-full py-4 bg-white text-brand-700 font-black text-lg tracking-wide rounded-full hover:scale-105 transition-all shadow-xl"
                            >
                                {t('landing.button.login')}
                            </button>
                            <button 
                                onClick={() => setView('register')} 
                                className="w-full py-4 bg-transparent border-2 border-white text-white font-black text-lg tracking-wide rounded-full hover:bg-white/10 hover:scale-105 transition-all shadow-md"
                            >
                                {t('landing.button.register')}
                            </button>
                        </div>
                        <p className="mt-6 text-[10px] text-white/50 font-mono tracking-widest">Versi 1.0.0 Beta</p>
                    </motion.div>
                )}

                {/* Other views reuse previous logic but styled for center card */}
                {view === 'login' && (
                    <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                         <button onClick={() => { setView('landing'); setError(''); }} className="mb-6 flex items-center gap-2 text-xs font-bold hover:opacity-80 text-white/80 uppercase tracking-wider">
                            <ArrowLeft size={14} /> {t('landing.button.back')}
                        </button>
                        <h2 className="text-3xl font-black mb-2 text-center">{t('landing.login.title')}</h2>
                        <p className="text-white/80 mb-8 text-center text-sm">{t('landing.login.subtitle')}</p>
                        
                        <form onSubmit={handleLogin} className="space-y-4">
                             {/* Inputs */}
                             <div className="space-y-1">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('landing.placeholder.email')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                             </div>
                             <div className="space-y-1 relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('landing.placeholder.password')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"><Eye size={20} /></button>
                             </div>
                             <div className="flex justify-end"><button type="button" onClick={() => setView('forgot')} className="text-xs font-medium text-white/80 hover:text-white hover:underline">{t('landing.button.forgot')}</button></div>
                             
                             <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-brand-700 font-black text-lg rounded-full hover:scale-105 transition-transform shadow-lg mt-4 disabled:opacity-70 disabled:scale-100">
                                {isLoading ? t('landing.loading') : t('landing.button.login')}
                             </button>
                             {error && <p className="text-red-100 text-xs text-center bg-red-900/60 p-3 rounded-xl border border-red-500/30 mt-2 backdrop-blur-sm">{error}</p>}
                        </form>
                    </motion.div>
                )}

                {view === 'register' && (
                    <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => { setView('landing'); setError(''); }} className="mb-6 flex items-center gap-2 text-xs font-bold hover:opacity-80 text-white/80 uppercase tracking-wider">
                            <ArrowLeft size={14} /> {t('landing.button.back')}
                        </button>
                        <h2 className="text-3xl font-black mb-2 text-center">{t('landing.register.title')}</h2>
                        <p className="text-white/80 mb-8 text-center text-sm">{t('landing.register.subtitle')}</p>
                        
                         <form onSubmit={handleRegister} className="space-y-4">
                             <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('landing.placeholder.name')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('landing.placeholder.email')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                             <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('landing.placeholder.password')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"><Eye size={20} /></button>
                             </div>
                             <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-brand-700 font-black text-lg rounded-full hover:scale-105 transition-transform shadow-lg mt-4 disabled:opacity-70 disabled:scale-100">
                                {isLoading ? t('landing.processing') : t('landing.button.registerAccount')}
                             </button>
                             {error && <p className="text-red-100 text-xs text-center bg-red-900/60 p-3 rounded-xl border border-red-500/30 mt-2 backdrop-blur-sm">{error}</p>}
                        </form>
                    </motion.div>
                )}
                
                 {view === 'forgot' && (
                    <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => { setView('login'); setError(''); }} className="mb-6 flex items-center gap-2 text-xs font-bold hover:opacity-80 text-white/80 uppercase tracking-wider">
                            <ArrowLeft size={14} /> {t('landing.button.back')}
                        </button>
                        <h2 className="text-3xl font-black mb-2 text-center">{t('landing.forgot.title')}</h2>
                         <form onSubmit={handleForgot} className="space-y-6 mt-6">
                             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('landing.placeholder.email')} className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all backdrop-blur-sm" />
                             <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-brand-700 font-black text-lg rounded-full hover:scale-105 transition-transform shadow-lg disabled:opacity-70 disabled:scale-100">
                                {isLoading ? t('landing.sending') : t('landing.button.reset')}
                             </button>
                             {error && <p className="text-red-100 text-xs text-center bg-red-900/60 p-3 rounded-xl border border-red-500/30 mt-2 backdrop-blur-sm">{error}</p>}
                        </form>
                    </motion.div>
                 )}
             </AnimatePresence>
          </motion.div>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-1 opacity-80">
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-wide uppercase text-white/90">
              <button onClick={() => setActiveLegalPage('privacy')} className="hover:text-white hover:underline transition-all drop-shadow-md">
                  {t('settings.legal.privacy')}
              </button>
              <span>•</span>
              <button onClick={() => setActiveLegalPage('terms')} className="hover:text-white hover:underline transition-all drop-shadow-md">
                   {t('settings.legal.terms')}
              </button>
          </div>
          <div className="flex items-center gap-2">
              <p className="text-[10px] font-light text-white/70 drop-shadow-md">© SEEST SOCIAL 2025</p>
              <span className="px-1.5 py-0.5 bg-white/20 border border-white/20 rounded text-[8px] font-bold tracking-wider uppercase shadow-sm text-white backdrop-blur-sm">Beta</span>
          </div>
      </div>

    </div>
  );
};
