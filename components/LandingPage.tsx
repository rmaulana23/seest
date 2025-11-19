
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Eye, EyeOff, ArrowLeft, CheckCircle, X, Info } from 'lucide-react';
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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/about') {
        setShowAbout(true);
        setShowHelp(false);
        setActiveLegalPage(null);
      } else if (hash === '#/help') {
        setShowHelp(true);
        setShowAbout(false);
        setActiveLegalPage(null);
      } else if (hash === '#/privacy') {
        setActiveLegalPage('privacy');
        setShowAbout(false);
        setShowHelp(false);
      } else if (hash === '#/terms') {
        setActiveLegalPage('terms');
        setShowAbout(false);
        setShowHelp(false);
      } else if (hash === '#/login') {
        setView('login');
        setShowAbout(false);
        setShowHelp(false);
        setActiveLegalPage(null);
      } else if (hash === '#/register') {
        setView('register');
        setShowAbout(false);
        setShowHelp(false);
        setActiveLegalPage(null);
      } else if (hash === '#/forgot') {
        setView('forgot');
        setShowAbout(false);
        setShowHelp(false);
        setActiveLegalPage(null);
      } else {
        setView('landing');
        setShowAbout(false);
        setShowHelp(false);
        setActiveLegalPage(null);
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateHash = (newHash: string) => {
    window.location.hash = newHash;
  };

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
          updateHash('/login');
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
                        onClick={() => { setShowConfirmModal(false); updateHash('/login'); }}
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
               {activeLegalPage === 'privacy' && <PrivacyPolicy onBack={() => updateHash('/')} mode="modal" />}
               {activeLegalPage === 'terms' && <TermsConditions onBack={() => updateHash('/')} mode="modal" />}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
          {showHelp && <HelpModal onClose={() => updateHash('/')} />}
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
                        onClick={() => updateHash('/')} 
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src="https://imgur.com/e00ntr3.jpg" alt="SEEST Logo" className="w-16 h-16 rounded-2xl mb-4 shadow-lg transform rotate-3" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('landing.about.title')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Versi 1.0.0 Beta Experiment</p>
                    </div>
                    
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                        <p>{t('landing.about.description')}</p>
                        <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-800/30">
                            <p className="font-semibold text-brand-700 dark:text-brand-400">{t('landing.about.mission')}</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Top Right Header */}
      <div className="absolute top-0 right-0 p-6 z-20 flex items-center gap-4">
         <button onClick={() => updateHash(showHelp ? '/' : '/help')} className="hidden md:block text-sm font-bold hover:text-white/80 transition-colors tracking-wide">
            {t('landing.help.button')}
         </button>
         <button onClick={() => updateHash(showAbout ? '/' : '/about')} className="hidden md:flex items-center gap-2 text-sm font-bold hover:text-white/80 transition-colors tracking-wide">
            <Info size={16} />
            {t('landing.about.button')}
         </button>
         <div className="hidden md:block h-4 w-px bg-white/30 mx-1"></div>
         <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full p-1">
             <button onClick={() => setLanguage('id')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'id' ? 'bg-white text-brand-600 shadow-md' : 'text-white hover:bg-white/10'}`}>ID</button>
             <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'en' ? 'bg-white text-brand-600 shadow-md' : 'text-white hover:bg-white/10'}`}>EN</button>
         </div>
      </div>
      
      {/* Top Left Logo */}
      <div className="absolute top-0 left-0 p-6 z-20 flex items-center gap-3">
         <img src="https://imgur.com/e00ntr3.jpg" alt="SEEST Logo" className="w-10 h-10 rounded-xl shadow-lg transform -rotate-6" />
         <div>
             <h1 className="text-lg font-extrabold tracking-widest leading-none">SEEST SOCIAL</h1>
             <p className="text-[10px] font-medium opacity-80 tracking-widest">Capture, Post, Gone.</p>
         </div>
      </div>

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
               key="landing"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
               <div className="text-center mb-8">
                   <h2 className="text-5xl font-black mb-2 tracking-tighter drop-shadow-sm">
                     SEEST<br/>SOCIAL
                   </h2>
                   <p className="text-sm font-medium tracking-widest opacity-90">Capture, Post, Gone.</p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={() => updateHash('/login')}
                    className="w-full py-3.5 bg-white text-brand-600 font-bold text-sm tracking-wider rounded-xl shadow-lg hover:bg-gray-50 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    {t('landing.button.login')}
                  </button>
                  <button 
                    onClick={() => updateHash('/register')}
                    className="w-full py-3.5 bg-transparent border-2 border-white text-white font-bold text-sm tracking-wider rounded-xl hover:bg-white/10 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    {t('landing.button.register')}
                  </button>
               </div>
               
               <p className="text-center text-xs font-mono text-white/50 mt-8">
                   Versi 1.0.0 Beta Experiment
               </p>
            </motion.div>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot') && (
             <motion.div 
               key="form"
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative"
            >
               <button onClick={() => updateHash('/')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                   <ArrowLeft size={20} />
               </button>
               
               <div className="text-center mt-4 mb-8">
                   <h2 className="text-2xl font-bold">
                     {view === 'login' ? t('landing.login.title') : view === 'register' ? t('landing.register.title') : t('landing.forgot.title')}
                   </h2>
                   <p className="text-sm opacity-80">
                     {view === 'login' ? t('landing.login.subtitle') : view === 'register' ? t('landing.register.subtitle') : t('landing.forgot.subtitle')}
                   </p>
               </div>

               {error && (
                   <div className="mb-4 p-3 bg-red-500/80 border border-red-400/50 text-white text-sm rounded-xl text-center shadow-sm">
                       {error}
                   </div>
               )}

               <form onSubmit={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handleForgot} className="space-y-4">
                   {view === 'register' && (
                       <div>
                           <label className="block text-xs font-bold mb-1.5 ml-1 opacity-90">{t('landing.label.name')}</label>
                           <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder={t('landing.placeholder.name')}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                required 
                           />
                       </div>
                   )}
                   
                   <div>
                       <label className="block text-xs font-bold mb-1.5 ml-1 opacity-90">{t('landing.label.email')}</label>
                       <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('landing.placeholder.email')}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            required 
                       />
                   </div>

                   {view !== 'forgot' && (
                       <div>
                           <label className="block text-xs font-bold mb-1.5 ml-1 opacity-90">{t('landing.label.password')}</label>
                           <div className="relative">
                               <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t('landing.placeholder.password')}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                    required 
                               />
                               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                               </button>
                           </div>
                       </div>
                   )}
                   
                   {view === 'login' && (
                       <div className="flex justify-end">
                           <button type="button" onClick={() => updateHash('/forgot')} className="text-xs font-semibold hover:underline opacity-90 hover:opacity-100">
                               {t('landing.button.forgot')}
                           </button>
                       </div>
                   )}

                   <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-white text-brand-600 font-bold text-sm tracking-wider rounded-xl shadow-lg hover:bg-gray-50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? t('landing.processing') : (view === 'login' ? t('landing.button.login') : view === 'register' ? t('landing.button.registerAccount') : t('landing.button.reset'))}
                   </button>
               </form>
               
               {view !== 'forgot' && (
                   <div className="mt-6 text-center">
                       <p className="text-xs opacity-80">
                           {view === 'login' ? t('landing.footer.noAccount') : t('landing.footer.hasAccount')}
                           <button 
                               onClick={() => updateHash(view === 'login' ? '/register' : '/login')}
                               className="ml-1 font-bold underline hover:text-white transition-colors"
                           >
                               {view === 'login' ? t('landing.button.register') : t('landing.button.login')}
                           </button>
                       </p>
                   </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Links (Help/About) */}
        <div className="mt-8 flex md:hidden items-center gap-6 z-20">
             <button onClick={() => updateHash(showHelp ? '/' : '/help')} className="text-sm font-bold text-white/90 hover:text-white transition-colors tracking-wide shadow-sm">
                {t('landing.help.button')}
             </button>
             <div className="h-4 w-px bg-white/30"></div>
             <button onClick={() => updateHash(showAbout ? '/' : '/about')} className="text-sm font-bold text-white/90 hover:text-white transition-colors tracking-wide flex items-center gap-2 shadow-sm">
                <Info size={16} />
                {t('landing.about.button')}
             </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-20 md:bottom-4 left-0 right-0 md:right-6 z-20 text-center md:text-right px-4">
           <div className="text-[10px] font-medium text-white/60 flex items-center justify-center md:justify-end gap-2">
               <button onClick={() => updateHash('/privacy')} className="hover:text-white transition-colors">Kebijakan Privasi</button>
               <span>•</span>
               <button onClick={() => updateHash('/terms')} className="hover:text-white transition-colors">Syarat & Ketentuan</button>
           </div>
           <div className="flex items-center justify-center md:justify-end gap-2 mt-1">
               <p className="text-[10px] text-white/40 font-mono">© SEEST SOCIAL 2025</p>
               <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[8px] font-bold text-white/70">BETA EXPERIMENT</span>
           </div>
      </div>

    </div>
  );
};
