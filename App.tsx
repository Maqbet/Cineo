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

const API_URL = 'api.php';

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

  const handleUpdateStatus = async (movie: TMDBMovie, status: WatchStatus, progress?: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const historyItem: WatchHistoryItem = {
      status,
      media_type: movie.media_type || (movie.title ? 'movie' : 'tv'),
      genres: movie.genre_ids || [],
      addedAt: Date.now(),
      title: movie.title || movie.name || 'Untitled',
      poster: movie.poster_path,
      ...progress
    };

    const updatedUser = { 
      ...currentUser, 
      watchHistory: { ...currentUser.watchHistory, [movie.id]: historyItem } 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('cineo_user', JSON.stringify(updatedUser));

    try {
      await fetch(API_URL + '?action=sync_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          movie: {
            id: movie.id,
            status,
            media_type: historyItem.media_type,
            title: historyItem.title,
            poster: historyItem.poster,
            progress: progress || {}
          }
        })
      });
    } catch (e) {
      console.error("Sync failed:", e);
    }
  };

  return (
    <div className={`min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 ${selectedMovie ? 'overflow-hidden' : ''}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Navbar 
        user={currentUser} lang={lang} 
        onSearch={setSearchQuery} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={() => { setCurrentUser(null); localStorage.removeItem('cineo_user'); }}
        onChangeLang={(l) => { setLang(l); fetchTrending(l); }}
      />

      <main className="relative pt-20 z-10">
        {loading ? (
          <div className="h-[80vh] flex items-center justify-center">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {!searchQuery && trending.length > 0 && (
              <Hero movie={trending[0]} lang={lang} onShowDetails={(id, type) => window.location.hash = `#${id}`} />
            )}
            <div className="px-6 md:px-20 py-10 md:py-24 max-w-[1920px] mx-auto">
              <MovieGrid 
                movies={searchQuery ? searchResults : trending} 
                onMovieClick={(m) => window.location.hash = `#${m.id}`}
                user={currentUser}
              />
            </div>
          </>
        )}
      </main>

      {selectedMovie && (
        <MovieDetails 
          id={selectedMovie.id} type={selectedMovie.type} user={currentUser} lang={lang}
          onClose={() => { window.location.hash = ''; }} 
          onUpdateStatus={handleUpdateStatus}
          onRecommendationClick={(id, type) => window.location.hash = `#${id}`}
        />
      )}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} onLogin={(user) => { setCurrentUser(user); setIsAuthOpen(false); }} />}
      {isProfileOpen && currentUser && (
        <UserProfile 
          user={currentUser} lang={lang} onClose={() => setIsProfileOpen(false)} 
          onLogout={() => { setCurrentUser(null); localStorage.removeItem('cineo_user'); setIsProfileOpen(false); }}
          onMovieClick={(id, type) => window.location.hash = `#${id}`}
          onUpdateAvatar={(url) => {
            const updated = {...currentUser, avatar: url};
            setCurrentUser(updated);
            localStorage.setItem('cineo_user', JSON.stringify(updated));
          }}
        />
      )}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} onUpdateUsers={() => {}} />}
      
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} movies={trending} lang={lang} />
    </div>
  );
};

export default App;