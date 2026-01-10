
import React, { useState } from 'react';
import { ProjectFile } from '../types';

interface SidebarProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  activeFileId, 
  onSelectFile, 
  onUpload, 
  onRemoveFile,
  isOpen,
  toggleSidebar
}) => {
  const [copied, setCopied] = useState(false);

  const copyContext = () => {
    if (files.length === 0) return;
    
    const context = files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
    navigator.clipboard.writeText(context).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-12'} flex flex-col bg-slate-950 transition-all duration-300 ease-in-out relative group border-r border-slate-800/50`}>
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-slate-800 hover:bg-slate-700 p-1 rounded-full border border-slate-700 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={2}/></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2}/></svg>
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Project Upload</p>
            
            {/* ZIP & Files Upload Button */}
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all font-medium text-xs shadow-lg shadow-indigo-900/20 active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Upload ZIP / Files
              <input 
                type="file" 
                multiple 
                accept=".zip,.js,.ts,.tsx,.html,.css,.json,.md,.py,.c,.cpp"
                className="hidden" 
                onChange={onUpload}
              />
            </label>

            {/* Folder Upload Button */}
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-all font-medium text-xs border border-slate-700 active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Upload Folder
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={onUpload}
                {...({
                  webkitdirectory: "true",
                  directory: "true"
                } as any)}
              />
            </label>

            <div className="flex justify-between items-center mt-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Files ({files.length})</p>
              {files.length > 0 && (
                <button 
                  onClick={copyContext}
                  className={`text-[10px] uppercase tracking-tighter font-bold transition-colors ${copied ? 'text-emerald-400' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                  {copied ? 'Copied Context!' : 'Copy Context'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {files.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-xs">No files uploaded yet.</p>
                <p className="text-[10px] text-slate-600 mt-2 italic leading-tight">Hint: Upload CineTrack Pro ZIP to begin.</p>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {files.map(file => (
                  <li 
                    key={file.id}
                    className={`group relative flex items-center px-4 py-1.5 cursor-pointer text-xs transition-colors ${
                      activeFileId === file.id ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                    onClick={() => onSelectFile(file.id)}
                  >
                    <svg className={`w-3.5 h-3.5 mr-2 shrink-0 ${activeFileId === file.id ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate flex-1">{file.name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded transition-opacity"
                    >
                      <svg className="w-3 h-3 text-slate-500 hover:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {files.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/20">
              <button 
                onClick={copyContext}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Export for Gemini
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
