
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onUpdateUsers: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onUpdateUsers }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('cineo_all_users') || '[]');
    setUsers(allUsers);
  }, []);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const allUsers: User[] = JSON.parse(localStorage.getItem('cineo_all_users') || '[]');
    const idx = allUsers.findIndex(u => u.id === editingUser.id);
    if (idx !== -1) {
      allUsers[idx] = editingUser;
      localStorage.setItem('cineo_all_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      setEditingUser(null);
      onUpdateUsers();
      
      const currentUser = JSON.parse(localStorage.getItem('cineo_user') || '{}');
      if (currentUser.id === editingUser.id) {
        localStorage.setItem('cineo_user', JSON.stringify(editingUser));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[650] bg-slate-950 flex flex-col animate-[fadeIn_0.3s_ease-out] pt-16 md:pt-20">
      <div className="h-20 md:h-24 px-6 md:px-10 border-b border-white/5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
         <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
               <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h2 className="heading-font text-xl md:text-3xl font-black text-white tracking-tighter truncate">Cineo Dashboard</h2>
         </div>
         <button onClick={onClose} className="p-3 md:p-4 hover:bg-slate-800 rounded-2xl md:rounded-3xl transition-all">
           <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </div>

      <div className="flex-1 p-4 md:p-10 overflow-y-auto bg-slate-950 scrollbar-hide">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
          <div className="bg-slate-900 border border-white/5 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-[9px] md:text-[11px] uppercase font-black text-slate-500 tracking-widest border-b border-slate-800 bg-slate-950/30">
                  <th className="px-6 md:px-10 py-4 md:py-6">İstifadəçi</th>
                  <th className="px-4 md:px-6 py-4 md:py-6">Əlaqə</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 text-right">İdarəetmə</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="group hover:bg-indigo-600/5 transition-colors">
                    <td className="px-6 md:px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.username[0].toUpperCase()}
                          </div>
                          <div className="truncate">
                             <p className="font-black text-white text-base md:text-lg leading-none mb-1 truncate">{u.username}</p>
                             <p className="text-[9px] md:text-[11px] font-bold text-slate-600 uppercase truncate">{u.role}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 md:px-6 py-6">
                       <p className="text-white font-black text-sm leading-none mb-1">{u.phone || 'N/A'}</p>
                       <p className="text-[10px] text-slate-500 font-bold">{u.email}</p>
                    </td>
                    <td className="px-4 md:px-6 py-6 text-right">
                      <button onClick={() => setEditingUser(u)} className="text-[9px] md:text-xs font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-indigo-500/20 whitespace-nowrap uppercase tracking-widest">REDAKTƏ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setEditingUser(null)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl animate-[scaleIn_0.3s_ease-out]">
            <form onSubmit={handleSaveEdit} className="p-8 md:p-14 space-y-6 md:space-y-10">
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">User Settings</h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Username</label>
                   <input value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Phone</label>
                   <input value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-4">Password (Format: PASS_value)</label>
                  <input value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono text-xs" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 py-4 rounded-2xl text-white font-black text-[10px] uppercase">LƏĞV ET</button>
                <button type="submit" className="flex-1 bg-indigo-600 py-4 rounded-2xl text-white font-black text-[10px] uppercase">YADDA SAXLA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
