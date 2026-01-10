
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../services/TranslationService';

interface NavbarProps {
  user: User | null;
  lang: Language;
  onSearch: (q: string) => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onChangeLang: (l: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, lang, onSearch, onOpenAuth, onOpenAdmin, onOpenProfile, onLogout, onChangeLang }) => {
  const t = translations[lang];
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass z-[60] px-4 md:px-12 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => window.location.href = '/'}>
        <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
          <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="heading-font text-lg md:text-2xl font-black tracking-tighter text-white">CINEO</span>
      </div>

      <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
        <input 
          type="text"
          placeholder={t.search}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-500 text-white"
          onChange={(e) => onSearch(e.target.value)}
        />
        <svg className="absolute right-4 top-3.5 w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user?.role === 'admin' && (
          <button 
            onClick={onOpenAdmin} 
            className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-indigo-400 group"
            title={t.admin_panel}
          >
            <svg className="w-5 h-5 md:mr-2 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">{t.admin_panel}</span>
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-[9px] font-black uppercase text-slate-300 hover:bg-slate-700 transition-colors shadow-lg"
          >
            {lang}
          </button>
          {isLangOpen && (
            <div className="absolute top-12 right-0 w-24 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              {(['az', 'ru', 'en'] as Language[]).map(l => (
                <button 
                  key={l}
                  onClick={() => { onChangeLang(l); setIsLangOpen(false); }}
                  className={`w-full px-4 py-2.5 text-[10px] font-black text-left uppercase transition-colors ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  {l === 'az' ? 'AZ' : l === 'ru' ? 'RU' : 'EN'}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div 
            onClick={onOpenProfile}
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-indigo-600 border-2 border-slate-800 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all shadow-xl"
          >
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-lg font-black text-white">{user.username[0].toUpperCase()}</div>
            )}
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="px-4 md:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] md:text-[10px] font-black transition-all shadow-lg active:scale-95 border border-indigo-500/20"
          >
            {t.login_reg}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
