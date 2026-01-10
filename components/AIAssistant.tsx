
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TMDBMovie, ChatMessage, Language } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  movies: TMDBMovie[];
  lang: Language;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, movies, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: lang === 'az' ? 'Salam! Mən sizin şəxsi film köməkçinizəm. Bu gün hansı janrda film axtarırsınız?' : 
            lang === 'ru' ? 'Привет! Я ваш личный помощник по фильмам. Какой жанр вы ищете сегодня?' : 
            'Hello! I am your personal movie assistant. What genre are you looking for today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const movieContext = movies.length > 0 
        ? movies.slice(0, 10).map(m => `${m.title || m.name} (${(m.release_date || m.first_air_date || '').split('-')[0]}) - Rating: ${m.vote_average}`).join('\n')
        : "Showing general recommendations.";
      
      const systemInstruction = `You are a professional film critic and assistant in the CineTrack Pro app. Talk in ${lang === 'az' ? 'Azerbaijani' : lang === 'ru' ? 'Russian' : 'English'}. Be friendly and concise. CONTEXT: ${movieContext}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.concat({ role: 'user', text: userText }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: { systemInstruction }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Sorry, I couldn't respond." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-950 border-l border-white/5 h-full flex flex-col shadow-2xl animate-[slideRight_0.4s_ease-out]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/20">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Cineo Intelligence</h3>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active • v4.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-xl ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-white/5 px-6 py-4 rounded-[2rem] rounded-tl-none flex gap-2 items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-slate-900/50">
          <div className="relative group">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask anything about movies..."
              className="w-full bg-slate-950 border border-white/5 rounded-[2rem] px-8 py-5 pr-16 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none min-h-[70px] max-h-40 text-white shadow-inner"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-4 bottom-4 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3}/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
