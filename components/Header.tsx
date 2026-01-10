
import React from 'react';

interface HeaderProps {
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClear }) => {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-100">
          Gemini <span className="text-indigo-400">Project Workspace</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors border border-slate-800 hover:border-rose-900/50 rounded-md bg-slate-900/50"
        >
          Reset Project
        </button>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI: gemini-3-pro-preview
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1"></div>
          <span>v1.1.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
