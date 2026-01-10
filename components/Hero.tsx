
import React from 'react';
import { TMDBMovie, Language } from '../types';
import { TMDB } from '../services/TMDBService';

interface HeroProps {
  movie: TMDBMovie;
  lang: Language;
  onShowDetails: (id: number, type: 'movie' | 'tv') => void;
}

const Hero: React.FC<HeroProps> = ({ movie, lang, onShowDetails }) => {
  const type = movie.title ? 'movie' : 'tv';
  
  return (
    <div className="relative h-[75vh] md:h-[95vh] w-full overflow-hidden group">
      <div className="absolute inset-0">
        <img 
          src={TMDB.getImageUrl(movie.backdrop_path, 'original')} 
          alt={movie.title || movie.name} 
          className="w-full h-full object-cover scale-105 transition-transform duration-[20s] group-hover:scale-110 opacity-70 md:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent hidden md:block"></div>
      </div>

      <div className="absolute bottom-16 md:bottom-36 left-6 md:left-24 right-6 max-w-5xl space-y-4 md:space-y-12 animate-[fadeInUp_1s_ease-out]">
        <div className="flex items-center gap-2 md:gap-6">
          <span className="px-4 md:px-10 py-1.5 md:py-3 bg-indigo-600 rounded-full text-[8px] md:text-[11px] font-black tracking-[0.3em] uppercase text-white shadow-2xl">
            {lang === 'az' ? 'HƏFTƏNİN SEÇİMİ' : lang === 'ru' ? 'ВЫБОР НЕДЕЛИ' : 'TOP FEATURE'}
          </span>
          <div className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-3xl border border-white/20 px-3 md:px-6 py-1.5 md:py-3 rounded-full">
            <span className="text-yellow-500 font-black text-xs md:text-lg">★</span>
            <span className="text-white font-black text-xs md:text-lg">{movie.vote_average?.toFixed(1)}</span>
          </div>
        </div>
        
        <h1 className="heading-font text-3xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
          {movie.title || movie.name}
        </h1>
        
        <p className="text-slate-300 text-sm md:text-2xl line-clamp-3 md:line-clamp-2 max-w-3xl leading-relaxed font-medium tracking-tight opacity-90">
          {movie.overview}
        </p>

        <div className="flex items-center gap-4 md:gap-8 pt-4 md:pt-10">
          <button 
            onClick={() => onShowDetails(movie.id, type)}
            className="group px-8 md:px-16 h-14 md:h-24 bg-white text-black rounded-xl md:rounded-[2.5rem] font-black text-[9px] md:text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 md:gap-6 shadow-2xl active:scale-95 z-20"
          >
            {lang === 'az' ? 'İNDİ BAX' : lang === 'ru' ? 'СМОТРЕТЬ' : 'WATCH NOW'}
            <div className="w-7 h-7 md:w-12 md:h-12 bg-black/5 rounded-lg md:rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
               <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3} /></svg>
            </div>
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-64 bg-gradient-to-t from-[#020617] to-transparent"></div>
    </div>
  );
};

export default Hero;
