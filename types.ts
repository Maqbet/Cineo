
export type WatchStatus = 'watching' | 'watched' | 'planned' | 'none';
export type Language = 'az' | 'ru' | 'en';

// Added ProjectFile interface to resolve import errors in Sidebar, CodeEditor, and ChatPanel
export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: 'movie' | 'tv';
  genre_ids: number[];
  budget?: number;
  revenue?: number;
  status?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  origin_country?: string[];
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  still_path: string;
  vote_average: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface WatchHistoryItem {
  status: WatchStatus;
  media_type: 'movie' | 'tv';
  genres: number[];
  countries?: string[];
  runtime?: number;
  addedAt: number;
  title: string;
  poster: string;
  currentSeason?: number;
  currentEpisode?: number;
  watchedEpisodes?: Record<number, number[]>; // seasonNumber -> [episodeNumbers]
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  watchHistory: Record<number, WatchHistoryItem>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}
