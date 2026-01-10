
import React from 'react';
import { TMDBMovie, User } from '../types';
import { TMDB } from '../services/TMDBService';

interface MovieGridProps {
  movies: TMDBMovie[];
  onMovieClick: (movie: TMDBMovie) => void;
  user: User | null;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, onMovieClick, user }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-10">
      {movies.map(movie => (
        <div 
          key={movie.id} 
          className="group relative movie-card bg-[#0f172a]/20 backdrop-blur-xl border border-white/5 rounded-3xl md:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 hover:-translate-y-2 md:hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.3)] hover:border-indigo-500/30"
          onClick={() => onMovieClick(movie)}
        >
          <div className="aspect-[2/3] overflow-hidden relative">
            <img 
              src={TMDB.getImageUrl(movie.poster_path)} 
              alt={movie.title || movie.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            />
            
            <div className="absolute top-3 left-3 md:top-5 md:left-5 z-10">
              <span className="px-2 md:px-4 py-1 md:py-2 rounded-xl text-[7px] md:text-[9px] font-black tracking-widest uppercase backdrop-blur-2xl border border-white/10 bg-black/40 text-white">
                {movie.title ? 'Movie' : 'TV'}
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
          
          <div className="p-4 md:p-8 space-y-1 md:space-y-3 relative z-10 bg-gradient-to-b from-transparent to-[#020617]/80">
            <div className="flex justify-between items-start">
               <h3 className="font-black text-white text-xs md:text-lg tracking-tight truncate pr-2 group-hover:text-indigo-400 transition-colors uppercase">{movie.title || movie.name}</h3>
               <span className="text-[10px] md:text-sm font-black text-indigo-400">{movie.vote_average?.toFixed(1)}</span>
            </div>
            <div className="flex gap-2 text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
              <span>{(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate hidden sm:inline">{movie.origin_country?.[0] || 'GL'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;
