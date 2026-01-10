
import React, { useState, useEffect } from 'react';
import { TMDBMovie, CastMember, User, WatchStatus, Language, TMDBSeason } from '../types';
import { TMDB } from '../services/TMDBService';
import { translations } from '../services/TranslationService';

interface MovieDetailsProps {
  id: number;
  type: 'movie' | 'tv';
  user: User | null;
  lang: Language;
  onClose: () => void;
  onUpdateStatus: (movie: TMDBMovie, status: WatchStatus, progress?: any) => void;
  onRecommendationClick: (id: number, type: 'movie' | 'tv') => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ id, type: initialType, user, lang, onClose, onUpdateStatus, onRecommendationClick }) => {
  const t = translations[lang];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedActor, setSelectedActor] = useState<CastMember | null>(null);
  const [actorCredits, setActorCredits] = useState<TMDBMovie[]>([]);
  const [seasonsData, setSeasonsData] = useState<Record<number, TMDBSeason>>({});
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  // Get current watch data from user object to ensure it stays reactive
  const watchData = user?.watchHistory[id];
  const watchedEpisodes = watchData?.watchedEpisodes || {};

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const fetchData = async () => {
      try {
        let res = await TMDB.getDetails(id, initialType, lang);
        
        // Sometimes TMDB returns nothing if the type is wrong
        if (!res || res.success === false || (!res.title && !res.name)) {
          const altType = initialType === 'movie' ? 'tv' : 'movie';
          res = await TMDB.getDetails(id, altType, lang);
        }

        if (isMounted) {
          if (res && res.id) {
            setData(res);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    document.body.style.overflow = 'hidden';
    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [id, initialType, lang]);

  const loadSeason = async (seasonNumber: number) => {
    if (seasonsData[seasonNumber]) {
      setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber);
      return;
    }
    const res = await TMDB.getSeasonDetails(id, seasonNumber, lang);
    setSeasonsData(prev => ({ ...prev, [seasonNumber]: res }));
    setExpandedSeason(seasonNumber);
  };

  const toggleEpisode = (seasonNum: number, episodeNum: number) => {
    if (!data) return;
    const currentList = watchedEpisodes[seasonNum] || [];
    const newList = currentList.includes(episodeNum) 
      ? currentList.filter(e => e !== episodeNum) 
      : [...currentList, episodeNum];
    
    const newWatched = { ...watchedEpisodes, [seasonNum]: newList };
    
    // Crucial: Update status to 'watching' if an episode is marked, unless it's already 'watched'
    const newStatus: WatchStatus = watchData?.status === 'watched' ? 'watched' : 'watching';

    onUpdateStatus(data, newStatus, { 
      currentSeason: seasonNum, 
      currentEpisode: episodeNum,
      watchedEpisodes: newWatched 
    });
  };

  const toggleFullSeason = (season: TMDBSeason) => {
    if (!data) return;
    const sNum = season.season_number;
    const allEpisodeNums = Array.from({length: season.episode_count}, (_, i) => i + 1);
    const isAllWatched = (watchedEpisodes[sNum] || []).length === allEpisodeNums.length;
    const newWatched = { ...watchedEpisodes, [sNum]: isAllWatched ? [] : allEpisodeNums };
    
    const newStatus: WatchStatus = watchData?.status === 'watched' ? 'watched' : 'watching';

    onUpdateStatus(data, newStatus, { 
      currentSeason: sNum, 
      currentEpisode: allEpisodeNums[allEpisodeNums.length - 1],
      watchedEpisodes: newWatched 
    });
  };

  if (loading) return (
    <div className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center animate-pulse">
       <div className="text-3xl md:text-5xl font-black text-indigo-500 tracking-tighter italic">CINEO</div>
    </div>
  );

  if (error || !data) return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
       <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">ERROR 404</h2>
       <button onClick={onClose} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">CLOSE</button>
    </div>
  );

  const results = data.videos?.results || [];
  const trailer = results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
                  results.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
                  results.find((v: any) => v.type === 'Clip' && v.site === 'YouTube') ||
                  results.find((v: any) => v.site === 'YouTube');

  const cast = data.credits?.cast || [];
  const recommendations = data.recommendations?.results || [];
  const isTV = !!data.seasons || !!data.number_of_seasons;
  const currentStatus = watchData?.status || 'none';

  return (
    <div className="fixed inset-0 z-[450] bg-[#020617] flex flex-col md:flex-row overflow-hidden animate-[fadeIn_0.4s_ease-out]">
      
      {/* SIDEBAR POSTER AREA */}
      <div className="relative w-full md:w-[35%] lg:w-[40%] h-[25vh] md:h-full shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-white/5 bg-slate-950">
        <img 
          src={TMDB.getImageUrl(data.poster_path, 'original')} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] scale-110 opacity-30 md:opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#020617]"></div>
        
        <button onClick={onClose} className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all z-50 shadow-2xl">
           <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={3}/></svg>
        </button>

        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-16 pointer-events-none hidden md:flex">
           <div className="relative w-full max-w-[320px] aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/10">
              <img src={TMDB.getImageUrl(data.poster_path, 'w500')} className="w-full h-full object-cover" />
           </div>
        </div>
      </div>

      {/* MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 h-full overflow-y-auto px-5 md:px-16 lg:px-20 py-6 md:py-16 space-y-12 md:space-y-24 scrollbar-hide bg-[#020617]">
        <div className="space-y-4 md:space-y-8">
          <div className="flex flex-wrap gap-2">
             <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
               {isTV ? t.tv : t.movie}
             </span>
             {data.genres?.slice(0, 3).map((g: any) => (
               <span key={g.id} className="px-3 py-1 bg-slate-900 border border-white/5 text-slate-500 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                 {g.name}
               </span>
             ))}
          </div>

          <h1 className="heading-font text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter uppercase break-words drop-shadow-2xl">
            {data.title || data.name}
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 py-4 md:py-10 border-y border-white/5">
             {[
               { label: t.release_date, val: data.release_date || data.first_air_date || 'N/A' },
               { label: 'Rating', val: `${data.vote_average?.toFixed(1)} ★`, color: 'text-yellow-500' },
               { label: 'Format', val: data.runtime ? `${data.runtime} M` : `${data.number_of_seasons} S` },
               { label: t.countries, val: data.origin_country?.[0] || 'GL' }
             ].map((s, i) => (
               <div key={i} className="space-y-0.5">
                  <p className="text-[7px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{s.label}</p>
                  <p className={`text-xs md:text-2xl font-black ${s.color || 'text-white'} tracking-tight`}>{s.val}</p>
               </div>
             ))}
          </div>
        </div>

        {/* COMPACT ACTIONS */}
        <div className="flex flex-col gap-6">
           {trailer && (
             <a 
               href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer"
               className="flex h-12 md:h-16 bg-white hover:bg-indigo-50 transition-all rounded-xl items-center px-4 md:px-6 gap-3 group shadow-xl max-w-xs z-10"
             >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                   <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="text-slate-950 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">{t.trailer}</p>
             </a>
           )}

           <div className="grid grid-cols-3 gap-2 md:max-w-xl z-10">
              {[
                { id: 'planned', label: t.planned, color: 'bg-indigo-600', activeBorder: 'border-white' },
                { id: 'watching', label: t.watching, color: 'bg-emerald-600', activeBorder: 'border-white' },
                { id: 'watched', label: t.watched, color: 'bg-violet-600', activeBorder: 'border-white' }
              ].map(btn => (
                <button 
                  key={btn.id}
                  onClick={() => onUpdateStatus(data, btn.id as WatchStatus)}
                  className={`py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all border-2 active:scale-95 touch-manipulation ${currentStatus === btn.id ? `${btn.color} ${btn.activeBorder} text-white shadow-xl scale-[1.05]` : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}
                >
                  <span className="block truncate px-1">{btn.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* TV SEASON & EPISODE PROGRESS TRACKING */}
        {isTV && currentStatus !== 'none' && data.seasons && (
          <div className="bg-slate-900/30 p-5 md:p-12 rounded-[2.5rem] border border-white/5 space-y-6 md:space-y-10">
             <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="space-y-1">
                   <h4 className="text-[7px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest">SEASON & EPISODE TRACKER</h4>
                   <p className="text-lg md:text-3xl font-black text-white leading-none">{t.season} & {t.episode}</p>
                </div>
                <div className="px-5 py-2 bg-indigo-600 rounded-xl text-[10px] md:text-sm font-black text-white shadow-xl shadow-indigo-600/20">
                   {Object.values(watchedEpisodes).flat().length} / {data.number_of_episodes || '??'}
                </div>
             </div>
             
             <div className="space-y-4">
                {data.seasons.filter((s:any) => s.season_number > 0).map((s:any) => {
                  const watchedInS = watchedEpisodes[s.season_number] || [];
                  const isSFull = watchedInS.length === s.episode_count;
                  return (
                    <div key={s.id} className="bg-slate-950/60 rounded-2xl md:rounded-[2rem] border border-white/5 overflow-hidden shadow-lg">
                       <div className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => loadSeason(s.season_number)}>
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-xs md:text-lg ${isSFull ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-600'}`}>
                                {s.season_number}
                             </div>
                             <div>
                                <p className="text-sm md:text-lg font-black text-white leading-none mb-1">{s.name}</p>
                                <p className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{s.episode_count} Episodes</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <button 
                               onClick={(e) => { e.stopPropagation(); toggleFullSeason(seasonsData[s.season_number] || s); }}
                               className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all shadow-md ${isSFull ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                             >
                               {isSFull ? 'RESET' : 'FULL SEASON'}
                             </button>
                             <svg className={`w-4 h-4 text-slate-800 transition-transform ${expandedSeason === s.season_number ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3}/></svg>
                          </div>
                       </div>
                       {expandedSeason === s.season_number && seasonsData[s.season_number] && (
                         <div className="p-4 md:p-6 pt-0 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 border-t border-white/5 animate-[fadeIn_0.3s_ease-out] bg-[#020617]/40">
                            {(seasonsData[s.season_number].episodes || []).map(ep => {
                               const isEpW = (watchedEpisodes[s.season_number] || []).includes(ep.episode_number);
                               return (
                                 <button 
                                   key={ep.id} onClick={() => toggleEpisode(s.season_number, ep.episode_number)}
                                   className={`aspect-square rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-sm transition-all border-2 ${isEpW ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-white/5 text-slate-700 hover:text-white'}`}
                                 >
                                   {ep.episode_number}
                                 </button>
                               );
                            })}
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {/* OVERVIEW SECTION */}
        <div className="space-y-4 md:space-y-12">
           <h3 className="text-[9px] md:text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">{t.overview}</h3>
           <p className="text-lg md:text-3xl lg:text-5xl text-slate-400 leading-relaxed font-medium tracking-tight">
             {data.overview || "Məlumat tapılmadı."}
           </p>
        </div>

        {/* CAST SECTION */}
        <div className="space-y-6 md:space-y-12">
           <h3 className="text-[9px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t.cast}</h3>
           <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 scrollbar-hide">
             {cast.slice(0, 15).map((actor: any) => (
               <div 
                 key={actor.id} className="shrink-0 w-28 md:w-56 group cursor-pointer"
                 onClick={async () => {
                    setSelectedActor(actor);
                    const res = await TMDB.getPersonCredits(actor.id, lang);
                    setActorCredits(res.cast?.slice(0, 24).sort((a:any,b:any) => b.popularity - a.popularity) || []);
                 }}
               >
                  <div className="aspect-[1/1.5] rounded-2xl md:rounded-[3rem] overflow-hidden mb-3 border border-white/5 group-hover:border-indigo-600 transition-all shadow-xl">
                     <img src={TMDB.getImageUrl(actor.profile_path)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-xs md:text-xl font-black text-white leading-none mb-1 truncate">{actor.name}</p>
                  <p className="text-[7px] md:text-[11px] font-black text-slate-700 uppercase tracking-widest truncate">{actor.character}</p>
               </div>
             ))}
           </div>
        </div>

        {/* SIMILAR CONTENT / RECOMMENDATIONS SECTION */}
        {recommendations.length > 0 && (
          <div className="space-y-6 md:space-y-12 pb-24">
             <div className="flex flex-col gap-2">
                <h3 className="text-[9px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t.similar_content}</h3>
                <p className="text-lg md:text-4xl font-black text-white uppercase tracking-tighter">{t.recommendations}</p>
             </div>
             <div className="flex gap-4 md:gap-10 overflow-x-auto pb-10 scrollbar-hide">
               {recommendations.slice(0, 15).map((rec: any) => (
                 <div 
                   key={rec.id} 
                   className="shrink-0 w-32 md:w-64 group cursor-pointer"
                   onClick={() => onRecommendationClick(rec.id, rec.media_type || (rec.title ? 'movie' : 'tv'))}
                 >
                    <div className="aspect-[2/3] rounded-2xl md:rounded-[3rem] overflow-hidden mb-3 border-2 border-white/5 group-hover:border-indigo-500 transition-all shadow-2xl relative">
                       <img src={TMDB.getImageUrl(rec.poster_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[8px] md:text-[10px] font-black text-indigo-400 border border-white/10">
                          {rec.vote_average?.toFixed(1)} ★
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <p className="text-[10px] md:text-sm font-black text-white leading-none text-center uppercase tracking-widest truncate group-hover:text-indigo-400 transition-colors">
                      {rec.title || rec.name}
                    </p>
                    <p className="text-[7px] md:text-[10px] font-bold text-slate-700 text-center uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(rec.release_date || rec.first_air_date || '').split('-')[0]}
                    </p>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* ACTOR PORTAL MODAL */}
      {selectedActor && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
           <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setSelectedActor(null)}></div>
           <div className="relative w-full max-w-6xl bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-6 md:p-12 border-b border-white/5 flex justify-between items-center bg-slate-950/80">
                 <div className="flex items-center gap-4 md:gap-10">
                    <div className="w-16 h-16 md:w-36 md:h-36 rounded-2xl md:rounded-[3rem] overflow-hidden border-2 border-indigo-600/30">
                       <img src={TMDB.getImageUrl(selectedActor.profile_path)} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">{selectedActor.name}</h2>
                       <p className="text-indigo-500 font-black text-[9px] uppercase tracking-widest mt-2 md:mt-4">FILMOGRAPHY</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedActor(null)} className="w-10 h-10 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all">
                    <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg>
                 </button>
              </div>
              <div className="p-6 md:p-12 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-10 scrollbar-hide bg-[#020617]/50">
                 {actorCredits.map((credit: any) => (
                   <div key={credit.id} className="group cursor-pointer" onClick={() => { setSelectedActor(null); onRecommendationClick(credit.id, credit.media_type || (credit.title ? 'movie' : 'tv')); }}>
                      <div className="aspect-[2/3] rounded-xl md:rounded-[2.5rem] overflow-hidden mb-2 md:mb-5 group-hover:scale-105 transition-transform shadow-xl border border-white/5">
                         <img src={TMDB.getImageUrl(credit.poster_path)} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[8px] md:text-[11px] font-black text-slate-600 text-center uppercase tracking-widest truncate group-hover:text-white">{credit.title || credit.name}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
