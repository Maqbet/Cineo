
import React from 'react';
import { ProjectFile } from '../types';

interface CodeEditorProps {
  activeFile: ProjectFile | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ activeFile }) => {
  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/50">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-300">No File Selected</h2>
        <p className="mt-2 max-w-sm">Select a file from the sidebar to view its content or upload a new project.</p>
      </div>
    );
  }

  const lines = activeFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 h-10 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400 uppercase tracking-wider">{activeFile.language}</span>
          <span className="text-xs text-slate-600">/</span>
          <span className="text-xs font-semibold text-slate-300">{activeFile.path}</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{lines.length} lines</span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto code-font flex selection:bg-indigo-500/30">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-950/30 text-right pr-3 py-4 text-slate-600 text-xs select-none border-r border-slate-800/50">
          {lines.map((_, i) => (
            <div key={i} className="h-5 leading-5">{i + 1}</div>
          ))}
        </div>
        {/* Code Content */}
        <div className="flex-1 py-4 px-6 overflow-visible min-w-0">
          <pre className="text-sm leading-5 whitespace-pre">
            <code className="text-slate-300 block">
              {activeFile.content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
