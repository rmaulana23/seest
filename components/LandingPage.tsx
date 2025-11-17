
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Eye, EyeOff, ArrowLeft, ChevronRight, Mail, CheckCircle } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

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
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      text: words[Math.floor(Math.random() * words.length)],
      top: Math.floor(Math.random() * 100),
      left: Math.floor(Math.random() * 100),
      fontSize: Math.floor(Math.random() * 60) + 12 + 'px',
      opacity: (Math.floor(Math.random() * 15) + 2) / 100,
      rotate: Math.random() > 0.7 ? 0 : -90,
      fontWeight: Math.random() > 0.5 ? 900 : 400,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
       {items.map(item => (
         <div 
            key={item.id}
            className="absolute text-white drop-shadow-lg whitespace-nowrap"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              fontSize: item.fontSize,
              opacity: item.opacity,
              transform: `rotate(${item.rotate}deg) translate(-50%, -50%)`,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: item.fontWeight,
              textShadow: '2px 4px 6px rgba(0,0,0,0.3)'
            }}
         >
           {item.text}
         </div>
       ))}
       <div className="absolute -bottom-20 -left-20 text-[15vw] font-black text-white opacity-5 rotate-0 pointer-events-none">
          SEEST
       </div>
       <div className="absolute top-20 -right-20 text-[15vw] font-black text-white opacity-5 rotate-90 pointer-events-none">
          SOCIAL
       </div>
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
    <div className="h-screen w-screen overflow-hidden bg-brand-600 flex flex-col items-center justify-center text-white font-sans p-6 relative">
      
      <BackgroundTypography />
      
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-50">
         <img src="https://i.imgur.com/e00ntr3.jpg" alt="SEEST Logo" className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20" />
      </div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50 flex gap-2 bg-black/20 p-1 rounded-full backdrop-blur-md border border-white/10">
         <button 
            onClick={() => setLanguage('id')} 
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'id' ? 'bg-white text-brand-600 shadow-md' : 'text-white hover:bg-white/10'}`}
         >
            ID
         </button>
         <button 
            onClick={() => setLanguage('en')} 
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-brand-600 shadow-md' : 'text-white hover:bg-white/10'}`}
         >
            EN
         </button>
      </div>
      
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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

      <div className="w-full max-w-sm z-10 relative backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 drop-shadow-lg">SEEST</h1>
              <p className="text-lg font-light mb-8 tracking-widest uppercase opacity-90">Ephemeral Status</p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setView('login')}
                  className="w-full py-3 bg-white text-brand-600 text-lg font-bold rounded-full hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
                >
                  MASUK
                </button>
                <button 
                  onClick={() => setView('register')}
                  className="w-full py-3 bg-transparent border-2 border-white text-white text-lg font-bold rounded-full hover:bg-white/10 transition-transform active:scale-95"
                >
                  DAFTAR
                </button>
              </div>
              <div className="mt-8 text-[10px] opacity-50">
                  <p>Versi 1.0.0 &bull; 2025</p>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <button onClick={() => { setView('landing'); setError(''); }} className="mb-4 flex items-center gap-2 text-xs font-semibold hover:opacity-80">
                <ArrowLeft size={16} /> KEMBALI
              </button>
              
              <h2 className="text-2xl font-bold mb-1">Selamat Datang</h2>
              <p className="text-white/70 mb-6 text-xs">Masuk untuk melihat cerita temanmu.</p>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password Anda"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                     <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-semibold text-white/70 hover:text-white mt-1 underline decoration-dotted">
                         Lupa Password?
                     </button>
                  </div>
                </div>

                {error && <p className="text-yellow-300 text-xs font-semibold bg-white/10 p-2 rounded-lg text-center">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-white text-brand-600 text-base font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'MEMUAT...' : 'MASUK'} <ChevronRight size={18} />
                </button>
              </form>
              <div className="mt-4 text-center">
                  <span className="text-white/60 text-xs">Belum punya akun? </span>
                  <button onClick={() => { setView('register'); setError(''); }} className="font-bold underline text-xs">Daftar</button>
              </div>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <button onClick={() => { setView('landing'); setError(''); }} className="mb-4 flex items-center gap-2 text-xs font-semibold hover:opacity-80">
                <ArrowLeft size={16} /> KEMBALI
              </button>
              
              <h2 className="text-2xl font-bold mb-1">Buat Akun</h2>
              <p className="text-white/70 mb-6 text-xs">Gabung komunitas SEEST sekarang.</p>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat password aman"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                    />
                     <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-yellow-300 text-xs font-semibold bg-white/10 p-2 rounded-lg text-center">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-white text-brand-600 text-base font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'MEMPROSES...' : 'DAFTAR AKUN'}
                </button>
              </form>
               <div className="mt-4 text-center">
                  <span className="text-white/60 text-xs">Sudah punya akun? </span>
                  <button onClick={() => { setView('login'); setError(''); }} className="font-bold underline text-xs">Masuk</button>
              </div>
            </motion.div>
          )}

          {view === 'forgot' && (
             <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <button onClick={() => { setView('login'); setError(''); }} className="mb-4 flex items-center gap-2 text-xs font-semibold hover:opacity-80">
                <ArrowLeft size={16} /> KEMBALI
              </button>
              
              <h2 className="text-2xl font-bold mb-1">Lupa Password?</h2>
              <p className="text-white/70 mb-6 text-xs">Masukkan email untuk reset password.</p>

              <form onSubmit={handleForgot} className="space-y-3">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>
                 {error && <p className="text-yellow-300 text-xs font-semibold bg-white/10 p-2 rounded-lg text-center">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-white text-brand-600 text-base font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg mt-2 disabled:opacity-70"
                >
                  {isLoading ? 'MENGIRIM...' : 'KIRIM LINK RESET'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
