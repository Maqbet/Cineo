
import React, { useState, useEffect, useCallback } from 'react';
import { TMDBMovie, User, WatchStatus, Language, WatchHistoryItem } from './types';
import { TMDB } from './services/TMDBService';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('az');
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<{id: number, type: 'movie' | 'tv'} | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const mediaMapRef = React.useRef<Record<number, 'movie' | 'tv'>>({});

  const fetchTrending = useCallback(async (l: Language) => {
    try {
      setLoading(true);
      const data = await TMDB.getTrending(l);
      if (data && data.results) {
        setTrending(data.results);
        data.results.forEach((m: TMDBMovie) => {
          mediaMapRef.current[m.id] = m.media_type || (m.title ? 'movie' : 'tv');
        });
      }
    } catch (err) {
      console.error("Trending error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('cineo_user');
    const savedLang = (localStorage.getItem('cineo_lang') as Language) || 'az';
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    setLang(savedLang);
    fetchTrending(savedLang);

    const handleHash = () => {
      const hash = window.location.hash.substring(1);
      if (hash && !isNaN(parseInt(hash))) {
        const id = parseInt(hash);
        // Detect type from ref if possible
        const detectedType = mediaMapRef.current[id] || (window.location.search.includes('type=tv') ? 'tv' : 'movie');
        setSelectedMovie({ id, type: detectedType });
      } else {
        setSelectedMovie(null);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [fetchTrending]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const data = await TMDB.search(searchQuery, lang);
          if (data && data.results) {
            setSearchResults(data.results);
            data.results.forEach((m: TMDBMovie) => {
              mediaMapRef.current[m.id] = m.media_type || (m.title ? 'movie' : 'tv');
            });
          }
        } catch (e) {
          console.error("Search error:", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, lang]);

  const handleUpdateStatus = (movie: TMDBMovie, status: WatchStatus, progress?: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const existing = currentUser.watchHistory[movie.id];
    const historyItem: WatchHistoryItem = {
      status,
      media_type: movie.media_type || (movie.title ? 'movie' : 'tv'),
      genres: movie.genre_ids || [],
      countries: movie.origin_country || [],
      addedAt: existing?.addedAt || Date.now(),
      title: movie.title || movie.name || 'Untitled',
      poster: movie.poster_path,
      ...progress
    };

    const updatedUser = { ...currentUser, watchHistory: { ...currentUser.watchHistory, [movie.id]: historyItem } };
    setCurrentUser(updatedUser);
    localStorage.setItem('cineo_user', JSON.stringify(updatedUser));
    
    const allUsers: User[] = JSON.parse(localStorage.getItem('cineo_all_users') || '[]');
    const idx = allUsers.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      localStorage.setItem('cineo_all_users', JSON.stringify(allUsers));
    }
  };

  const openMovieDetails = (id: number, type: 'movie' | 'tv') => {
    mediaMapRef.current[id] = type;
    window.location.hash = `#${id}`;
  };

  return (
    <div className={`min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 ${selectedMovie ? 'overflow-hidden' : ''}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Navbar 
        user={currentUser} 
        lang={lang} 
        onSearch={setSearchQuery} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={() => { setCurrentUser(null); localStorage.removeItem('cineo_user'); }}
        onChangeLang={(l) => { setLang(l); localStorage.setItem('cineo_lang', l); fetchTrending(l); }}
      />

      <main className="relative pt-20 z-10">
        {loading ? (
          <div className="h-[80vh] flex items-center justify-center">
             <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {!searchQuery && trending.length > 0 && (
              <Hero movie={trending[0]} lang={lang} onShowDetails={openMovieDetails} />
            )}
            
            <div className="px-6 md:px-20 py-10 md:py-24 max-w-[1920px] mx-auto">
              <div className="mb-8 md:mb-16 space-y-2">
                <p className="text-indigo-500 font-black text-[9px] md:text-xs uppercase tracking-[0.5em] mb-2">Cinematic Universe</p>
                <h2 className="heading-font text-3xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                  {searchQuery ? `Search: ${searchQuery}` : (lang === 'az' ? 'Trendlər' : lang === 'ru' ? 'Тренды' : 'Discovery')}
                </h2>
              </div>
              <MovieGrid 
                movies={searchQuery ? searchResults : trending} 
                onMovieClick={(m) => openMovieDetails(m.id, m.media_type || (m.title ? 'movie' : 'tv'))}
                user={currentUser}
              />
            </div>
          </>
        )}
      </main>

      {/* AI Assistant Button */}
      <button 
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-600 to-violet-700 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all z-[750] border border-white/20 group"
      >
        <svg className="w-7 h-7 md:w-12 md:h-12 text-white group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} movies={trending} lang={lang} />

      {selectedMovie && (
        <MovieDetails 
          key={selectedMovie.id}
          id={selectedMovie.id} 
          type={selectedMovie.type}
          user={currentUser}
          lang={lang}
          onClose={() => { window.location.hash = ''; }} 
          onUpdateStatus={handleUpdateStatus}
          onRecommendationClick={openMovieDetails}
        />
      )}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onLogin={(user) => { setCurrentUser(user); setIsAuthOpen(false); }} />}
      {isAdminOpen && currentUser?.role === 'admin' && <AdminPanel onClose={() => setIsAdminOpen(false)} onUpdateUsers={() => {}} />}
      {isProfileOpen && currentUser && (
        <UserProfile 
          user={currentUser} lang={lang} onClose={() => setIsProfileOpen(false)} 
          onLogout={() => { setCurrentUser(null); localStorage.removeItem('cineo_user'); setIsProfileOpen(false); }}
          onMovieClick={openMovieDetails}
          onUpdateAvatar={(url) => {
            const updated = {...currentUser, avatar: url};
            setCurrentUser(updated);
            localStorage.setItem('cineo_user', JSON.stringify(updated));
          }}
        />
      )}
    </div>
  );
};

export default App;
