
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../services/TranslationService';
import { TMDB } from '../services/TMDBService';

interface UserProfileProps {
  user: User;
  lang: Language;
  onClose: () => void;
  onLogout: () => void;
  onUpdateAvatar: (url: string) => void;
  onMovieClick: (id: number, type: 'movie' | 'tv') => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, lang, onClose, onLogout, onUpdateAvatar, onMovieClick }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'stats' | 'watching' | 'planned' | 'watched' | 'security'>('stats');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const historyArr = Object.values(user.watchHistory);
  const watchedCount = historyArr.filter(h => h.status === 'watched').length;
  const watchingCount = historyArr.filter(h => h.status === 'watching').length;
  const plannedCount = historyArr.filter(h => h.status === 'planned').length;
  
  const genreStats: Record<number, number> = {};
  historyArr.filter(h => h.status === 'watched').forEach(h => {
    h.genres.forEach(g => { genreStats[g] = (genreStats[g] || 0) + 1; });
  });

  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop'
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    
    const allUsers: User[] = JSON.parse(localStorage.getItem('cineo_all_users') || '[]');
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      const updatedUser = { ...user, password: `PASS_${newPassword}` };
      allUsers[idx] = updatedUser;
      localStorage.setItem('cineo_all_users', JSON.stringify(allUsers));
      localStorage.setItem('cineo_user', JSON.stringify(updatedUser));
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center md:p-6">
      <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative w-full h-full md:h-auto md:max-w-6xl bg-slate-900 border md:border-slate-800 md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-[fadeIn_0.3s_ease-out]">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-[300px] p-6 md:p-10 bg-slate-950/50 flex md:flex-col items-center gap-4 md:gap-0 border-b md:border-b-0 md:border-r border-slate-800 shrink-0 overflow-x-auto md:overflow-visible scrollbar-hide">
          <div className="w-14 h-14 md:w-36 md:h-36 rounded-3xl overflow-hidden border-2 md:border-4 border-indigo-600 shrink-0 shadow-2xl">
              <img src={user.avatar || avatars[0]} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 md:mt-8 md:text-center min-w-0">
            <h2 className="text-xl md:text-3xl font-black text-white truncate uppercase tracking-tighter leading-none mb-1">{user.username}</h2>
            <p className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{user.role}</p>
          </div>

          <nav className="hidden md:flex flex-col w-full gap-2 mt-12">
             {[
               { id: 'stats', label: t.stats, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10' },
               { id: 'watching', label: t.watching, icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263' },
               { id: 'planned', label: t.planned, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0' },
               { id: 'watched', label: t.watched, icon: 'M5 13l4 4L19 7' },
               { id: 'security', label: t.security, icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
             ].map(item => (
               <button 
                 key={item.id}
                 onClick={() => setActiveTab(item.id as any)}
                 className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d={item.icon} strokeWidth={2.5} /></svg>
                 {item.label}
               </button>
             ))}
             <button onClick={onLogout} className="mt-8 flex items-center justify-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-all border-2 border-rose-500/10">
               {t.logout}
             </button>
          </nav>

          {/* MOBILE NAV TABS */}
          <div className="flex md:hidden gap-3 ml-4 py-2">
             {['stats', 'watching', 'planned', 'watched', 'security'].map((tab) => (
               <button 
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
               >
                 {tab === 'stats' ? 'STATS' : tab === 'watching' ? 'WATCHING' : tab === 'planned' ? 'LATER' : tab === 'watched' ? 'DONE' : 'SEC'}
               </button>
             ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-6 md:p-14 overflow-y-auto bg-slate-900 scrollbar-hide">
           <div className="flex justify-between items-center mb-10 md:mb-16">
              <div className="space-y-1">
                <p className="text-indigo-400 font-black text-[9px] md:text-[11px] uppercase tracking-[0.4em] mb-2 leading-none">DASHBOARD</p>
                <h3 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                  {activeTab === 'stats' ? t.stats : activeTab === 'security' ? t.security : translations[lang][activeTab as keyof typeof translations['en']]}
                </h3>
              </div>
              <button onClick={onClose} className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-500 hover:text-white hover:rotate-90 transition-all">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg>
              </button>
           </div>

           {activeTab === 'stats' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                {[
                  { label: t.watched, val: watchedCount, bg: 'bg-indigo-600 shadow-xl shadow-indigo-600/20' },
                  { label: t.watching, val: watchingCount, bg: 'bg-slate-800/50 border-2 border-white/5' },
                  { label: t.planned, val: plannedCount, bg: 'bg-slate-800/50 border-2 border-white/5' }
                ].map((s, i) => (
                  <div key={i} className={`p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] ${s.bg}`}>
                    <p className="text-[8px] md:text-[11px] font-black uppercase tracking-widest opacity-60 mb-2 leading-none">{s.label}</p>
                    <p className="text-4xl md:text-7xl font-black leading-none">{s.val}</p>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'security' && (
             <div className="max-w-md mx-auto py-10">
                <form onSubmit={handlePasswordChange} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest ml-4">{t.new_password}</label>
                      <input 
                        type="password" required minLength={6}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl md:rounded-3xl px-8 py-5 text-white focus:border-indigo-600 outline-none transition-all"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      />
                   </div>
                   <button className="w-full bg-indigo-600 text-white py-5 md:py-6 rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                      {t.save_changes}
                   </button>
                   {passwordSuccess && <p className="text-emerald-500 text-center font-black text-[11px] uppercase tracking-widest animate-pulse">Şifrə uğurla dəyişdirildi!</p>}
                </form>
             </div>
           )}

           {(activeTab === 'watching' || activeTab === 'planned' || activeTab === 'watched') && (
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
                {Object.entries(user.watchHistory)
                  .filter(([_, h]) => h.status === activeTab)
                  .map(([id, h]) => (
                    <div 
                      key={id} onClick={() => onMovieClick(parseInt(id), h.media_type)}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="aspect-[2/3] rounded-3xl md:rounded-[3.5rem] overflow-hidden border-2 border-white/5 group-hover:border-indigo-500 transition-all shadow-2xl relative mb-4">
                         <img src={TMDB.getImageUrl(h.poster)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         
                         {/* ENHANCED PROGRESS INDICATOR */}
                         {h.media_type === 'tv' && h.currentSeason && (
                           <div className="absolute top-3 left-3 flex flex-col gap-1">
                              <div className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-lg text-[8px] md:text-[10px] font-black text-white shadow-xl uppercase border border-white/10">
                                S{h.currentSeason} E{h.currentEpisode}
                              </div>
                              <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[7px] font-black text-indigo-300 border border-white/5 uppercase">
                                {t.continue_watching}
                              </div>
                           </div>
                         )}
                         
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <button className="w-full bg-white text-black py-3 rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                               {t.watch_now}
                            </button>
                         </div>
                      </div>
                      <p className="text-[10px] md:text-sm font-black text-white truncate text-center uppercase tracking-widest leading-none px-2">{h.title}</p>
                      <p className="text-[8px] md:text-[10px] font-black text-slate-700 text-center uppercase mt-2 tracking-widest">
                        {h.media_type}
                      </p>
                    </div>
                  ))}
                {historyArr.filter(h => h.status === activeTab).length === 0 && (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center border-4 border-dashed border-slate-800 rounded-[3rem] opacity-50">
                    <svg className="w-12 h-12 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2}/></svg>
                    <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Hələ heç nə əlavə olunmayıb</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
