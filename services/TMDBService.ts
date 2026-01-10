
const API_KEY = '4401e33b6269364dae594b02f068bd94';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const getTMDBLang = (lang: string) => {
  switch(lang) {
    case 'az': return 'az-AZ';
    case 'ru': return 'ru-RU';
    default: return 'en-US';
  }
};

export const TMDB = {
  getTrending: async (lang: string = 'en') => {
    const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=${getTMDBLang(lang)}`);
    return res.json();
  },
  
  getDetails: async (id: number, type: 'movie' | 'tv' = 'movie', lang: string = 'en') => {
    // include_video_language=en is crucial to find trailers even if they don't exist in the current UI language
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=${getTMDBLang(lang)}&append_to_response=credits,recommendations,videos&include_video_language=en,${getTMDBLang(lang).split('-')[0]}`);
    return res.json();
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number, lang: string = 'en') => {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=${getTMDBLang(lang)}`);
    return res.json();
  },
  
  search: async (query: string, lang: string = 'en') => {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${getTMDBLang(lang)}`);
    return res.json();
  },

  getPersonCredits: async (personId: number, lang: string = 'en') => {
    const res = await fetch(`${BASE_URL}/person/${personId}/combined_credits?api_key=${API_KEY}&language=${getTMDBLang(lang)}`);
    return res.json();
  },

  getImageUrl: (path: string, size: 'original' | 'w500' = 'w500') => {
    return path ? `${IMAGE_BASE}/${size}${path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500&auto=format&fit=crop';
  },

  getGenreName: (id: number): string => {
    const genres: Record<number, string> = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
      10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
      10767: "Talk", 10768: "War & Politics"
    };
    return genres[id] || "Genre";
  }
};
