
import React, { useState } from 'react';
import { User } from '../types';
import { translations } from '../services/TranslationService';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const formatPasswordForStorage = (str: string) => {
    return `PASS_${str}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Hardcoded Admin Check (Maqbet / 12345678)
    if (!isRegister && formData.username === 'Maqbet' && formData.password === '12345678') {
      const adminUser: User = {
        id: 'admin_root',
        username: 'Maqbet',
        email: 'Maqbet@gmail.com',
        phone: '+994',
        role: 'admin',
        watchHistory: {}
      };
      localStorage.setItem('cineo_user', JSON.stringify(adminUser));
      onLogin(adminUser);
      return;
    }

    const storagePassword = formatPasswordForStorage(formData.password);
    const allUsers: User[] = JSON.parse(localStorage.getItem('cineo_all_users') || '[]');
    
    if (!isRegister) {
      const found = allUsers.find(u => u.username === formData.username && u.password === storagePassword);
      if (found) {
        localStorage.setItem('cineo_user', JSON.stringify(found));
        onLogin(found);
      } else {
        setError("İstifadəçi adı və ya şifrə yanlışdır!");
      }
    } else {
      const exists = allUsers.some(u => u.username === formData.username);
      if (exists) {
        setError("Bu istifadəçi adı artıq mövcuddur!");
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: storagePassword,
        role: 'user',
        watchHistory: {}
      };
      allUsers.push(newUser);
      localStorage.setItem('cineo_all_users', JSON.stringify(allUsers));
      localStorage.setItem('cineo_user', JSON.stringify(newUser));
      onLogin(newUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 shadow-2xl animate-[scaleIn_0.3s_ease-out] overflow-y-auto max-h-[95vh]">
        <h2 className="heading-font text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">
          {isRegister ? 'JOIN US' : 'WELCOME'}
        </h2>
        <p className="text-slate-500 text-[10px] md:text-xs mb-8 md:mb-12 font-bold uppercase tracking-widest">
          {isRegister ? 'Filmləri qeyd etmək üçün qoşulun' : 'Kolleksiyanıza giriş edin'}
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4 animate-shake">
            <p className="text-[10px] md:text-xs font-black text-rose-500 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">İstifadəçi Adı</label>
            <input 
              type="text" 
              placeholder="Username" 
              required
              className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-600 transition-all text-sm"
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {isRegister && (
            <>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email" 
                  placeholder="name@mail.com" 
                  required
                  className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-600 transition-all text-sm"
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Telefon Nömrəsi</label>
                <input 
                  type="tel" 
                  placeholder="+994 -- --- -- --" 
                  required
                  className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-600 transition-all text-sm"
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Şifrə</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-600 transition-all text-sm"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-3xl font-black text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95 mt-4">
            {isRegister ? 'QEYDİYYATDAN KEÇ' : 'DAXİL OL'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
           <p className="text-slate-600 text-[10px] md:text-xs">
              {isRegister ? 'Artıq hesabınız var?' : 'Hesabınız yoxdur?'}
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(null); setShowForgot(false); }}
                className="ml-2 text-indigo-400 font-black hover:underline"
              >
                {isRegister ? 'Giriş edin' : 'Qeydiyyatdan keçin'}
              </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
