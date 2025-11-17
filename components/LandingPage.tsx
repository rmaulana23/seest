
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Eye, EyeOff, ArrowLeft, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (name: string, email: string, password: string) => void;
}

type ViewState = 'landing' | 'login' | 'register' | 'forgot';

const BackgroundTypography = () => {
  const items = useMemo(() => {
    const words = [
      "SEEST", "SOCIAL", "SEEST SOCIAL", "CONNECT", "VIBE", 
      "STORY", "24H", "MOMENT", "CIRCLE", "LIVE", "SHARE", 
      "EPHEMERAL", "NOW", "FRIENDS", "CHAT", "REAL"
    ];
    // Generate a fixed set of random typography elements
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      text: words[Math.floor(Math.random() * words.length)],
      top: Math.floor(Math.random() * 100),
      left: Math.floor(Math.random() * 100),
      // Varying sizes for typography effect
      fontSize: Math.floor(Math.random() * 60) + 12 + 'px',
      // Low opacity for background texture
      opacity: (Math.floor(Math.random() * 15) + 2) / 100,
      // Mostly facing up (-90deg), some horizontal (0deg) for randomness
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
              textShadow: '2px 4px 6px rgba(0,0,0,0.3)' // "Berbayang" effect
            }}
         >
           {item.text}
         </div>
       ))}
       {/* Large anchor text */}
       <div className="absolute -bottom-20 -left-20 text-[15vw] font-black text-white opacity-5 rotate-0 pointer-events-none">
          SEEST
       </div>
       <div className="absolute top-20 -right-20 text-[15vw] font-black text-white opacity-5 rotate-90 pointer-events-none">
          SOCIAL
       </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ users, onLogin, onRegister }) => {
  const [view, setView] = useState<ViewState>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Email atau password salah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Mohon isi semua data.');
      return;
    }

    const existing = users.find(u => u.email === email);
    if (existing) {
      setError('Email sudah terdaftar.');
      return;
    }

    onRegister(name, email, password);
  };
  
  const handleForgot = (e: React.FormEvent) => {
      e.preventDefault();
      // Mock functionality
      alert(`Link reset password telah dikirim ke ${email}`);
      setView('login');
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-brand-600 flex flex-col items-center justify-center text-white font-sans p-6 relative">
      
      <BackgroundTypography />

      <div className="w-full max-w-md z-10 relative backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 drop-shadow-lg">SEEST</h1>
              <p className="text-xl md:text-2xl font-light mb-12 tracking-widest uppercase opacity-90">Ephemeral Status</p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => setView('login')}
                  className="w-full py-4 bg-white text-brand-600 text-xl font-bold rounded-full hover:bg-gray-100 transition-transform active:scale-95 shadow-lg"
                >
                  MASUK
                </button>
                <button 
                  onClick={() => setView('register')}
                  className="w-full py-4 bg-transparent border-2 border-white text-white text-xl font-bold rounded-full hover:bg-white/10 transition-transform active:scale-95"
                >
                  DAFTAR
                </button>
              </div>
              <div className="mt-10 text-xs opacity-50">
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
              <button onClick={() => { setView('landing'); setError(''); }} className="mb-6 flex items-center gap-2 text-sm font-semibold hover:opacity-80">
                <ArrowLeft size={20} /> KEMBALI
              </button>
              
              <h2 className="text-3xl font-bold mb-1">Selamat Datang</h2>
              <p className="text-white/70 mb-8 text-sm">Masuk untuk melihat cerita temanmu.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password Anda"
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                     <button type="button" onClick={() => setView('forgot')} className="text-xs font-semibold text-white/70 hover:text-white mt-2 underline decoration-dotted">
                         Lupa Password?
                     </button>
                  </div>
                </div>

                {error && <p className="text-yellow-300 text-sm font-semibold bg-white/10 p-3 rounded-lg text-center">{error}</p>}

                <button 
                  type="submit"
                  className="w-full py-3 bg-white text-brand-600 text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
                >
                  MASUK <ChevronRight size={20} />
                </button>
              </form>
              <div className="mt-6 text-center">
                  <span className="text-white/60 text-sm">Belum punya akun? </span>
                  <button onClick={() => { setView('register'); setError(''); }} className="font-bold underline">Daftar</button>
              </div>
               {/* Quick Hint for Demo */}
               <div className="mt-6 text-center text-xs text-white/30 bg-black/20 p-2 rounded-lg">
                  <p>Dummy: user@seest.com / password123</p>
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
              <button onClick={() => { setView('landing'); setError(''); }} className="mb-6 flex items-center gap-2 text-sm font-semibold hover:opacity-80">
                <ArrowLeft size={20} /> KEMBALI
              </button>
              
              <h2 className="text-3xl font-bold mb-1">Buat Akun</h2>
              <p className="text-white/70 mb-8 text-sm">Gabung komunitas SEEST sekarang.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat password aman"
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                    />
                     <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-yellow-300 text-sm font-semibold bg-white/10 p-3 rounded-lg text-center">{error}</p>}

                <button 
                  type="submit"
                  className="w-full py-3 bg-white text-brand-600 text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
                >
                  DAFTAR AKUN
                </button>
              </form>
               <div className="mt-6 text-center">
                  <span className="text-white/60 text-sm">Sudah punya akun? </span>
                  <button onClick={() => { setView('login'); setError(''); }} className="font-bold underline">Masuk</button>
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
              <button onClick={() => { setView('login'); setError(''); }} className="mb-6 flex items-center gap-2 text-sm font-semibold hover:opacity-80">
                <ArrowLeft size={20} /> KEMBALI
              </button>
              
              <h2 className="text-3xl font-bold mb-1">Lupa Password?</h2>
              <p className="text-white/70 mb-8 text-sm">Masukkan email untuk reset password.</p>

              <form onSubmit={handleForgot} className="space-y-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-80">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-white text-brand-600 text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg mt-4"
                >
                  KIRIM LINK RESET
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
