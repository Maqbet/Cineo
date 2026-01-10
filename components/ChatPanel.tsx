
import React, { useState, useRef, useEffect } from 'react';
import { ProjectFile, ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ChatPanelProps {
  files: ProjectFile[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ files, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamingText]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Fixed: Changed 'parts' to 'text' to match the updated ChatMessage type
    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const projectContext = files.length > 0 
        ? files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n')
        : "No files uploaded yet.";
      
      const systemInstruction = `You are an expert senior software engineer. 
The user has provided a project workspace. 
Context of the project files is below. 
Answer questions accurately, help debug, or suggest improvements based on these files.
If no files are uploaded, guide the user on how to upload them.
Be concise and use Markdown for code blocks.

PROJECT FILES CONTEXT:
${projectContext}`;

      // Fixed: Changed 'm.parts' to 'm.text' for mapping chat history to Gemini API format
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: currentInput }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      let fullResponse = '';
      for await (const chunk of responseStream) {
        // Correct usage of .text property as per guidelines
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setStreamingText(fullResponse);
        }
      }
      
      // Fixed: Changed 'parts' to 'text' to match the updated ChatMessage type
      const botMessage: ChatMessage = {
        role: 'model',
        text: fullResponse || "I couldn't generate a response.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
      setStreamingText('');
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Error: Could not connect to Gemini. Please check your network or API key settings.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[450px] flex flex-col bg-slate-950">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
          Gemini Analyst
        </h3>
        <button 
          onClick={() => setMessages([])}
          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-bold"
        >
          Clear History
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3 opacity-50">
            <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Upload your project files (ZIP or folder) and start a conversation!</p>
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800 shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap break-words prose prose-invert prose-sm max-w-none">
                {/* Fixed: Changed m.parts to m.text */}
                {m.text}
              </div>
            </div>
          </div>
        ))}
        
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-slate-900 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-800 shadow-sm">
              <div className="whitespace-pre-wrap break-words prose prose-invert prose-sm max-w-none">
                {streamingText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-slate-400 rounded-2xl rounded-tl-none px-4 py-4 border border-slate-800 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask anything about your code..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 pr-14 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[60px] max-h-[250px] shadow-inner"
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex justify-between items-center px-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Project Context Active
          </p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
