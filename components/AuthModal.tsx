import React, { useState } from 'react';
import { User } from '../types';

const API_URL = 'api.php';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const action = isRegister ? 'register' : 'login';
    try {
      const res = await fetch(`${API_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      
      if (result.success) {
        if (isRegister) {
          setIsRegister(false);
          setError("Qeydiyyat uğurludur! İndi daxil olun.");
        } else {
          onLogin(result.user);
        }
      } else {
        setError(result.error || "Xəta baş verdi");
      }
    } catch (err) {
      setError("Serverlə əlaqə kəsildi");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 md:p-14 shadow-2xl overflow-y-auto max-h-[95vh]">
        <h2 className="heading-font text-3xl font-black text-white mb-6 uppercase tracking-tighter text-center">
          {isRegister ? 'Qeydiyyat' : 'Xoş Gəldiniz'}
        </h2>
        
        {error && <div className="mb-6 p-4 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold uppercase text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="İstifadəçi Adı" required
            className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-indigo-600 outline-none"
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          {isRegister && (
            <>
              <input type="email" placeholder="Email" required className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-indigo-600 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="tel" placeholder="Telefon (+994)" required className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-indigo-600 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </>
          )}
          <input type="password" placeholder="Şifrə" required className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl px-6 py-4 text-white focus:border-indigo-600 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button className="w-full bg-indigo-600 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-white shadow-xl hover:bg-indigo-500 transition-colors">
            {isRegister ? 'Qeydiyyat' : 'Daxil Ol'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-400 font-bold text-xs uppercase underline">
            {isRegister ? 'Giriş Edin' : 'Yeni Hesab Yaradın'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;