export interface SearchResult {
	id: string;
	tmdbId: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	year: string | null;
	type: 'show' | 'movie';
	genres: string[];
}

export interface ShowSummary {
	id: string;
	tmdbId: number | null;
	title: string;
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	firstAirDate: string | null;
	status: string | null;
	genres: string[];
	network: string | null;
}

export interface ShowDetail extends ShowSummary {
	seasons: SeasonSummary[];
}

export interface SeasonSummary {
	id: string;
	seasonNumber: number;
	name: string | null;
	overview: string | null;
	posterPath: string | null;
	airDate: string | null;
	episodeCount: number | null;
}

export interface EpisodeSummary {
	id: string;
	seasonId: string;
	seasonNumber: number;
	episodeNumber: number;
	name: string;
	overview: string | null;
	stillPath: string | null;
	airDate: string | null;
	runtime: number | null;
}

export interface MovieSummary {
	id: string;
	tmdbId: number | null;
	title: string;
	overview: string | null;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	genres: string[];
	status: string | null;
}

export interface CalendarItem {
	id: string;
	showId: string;
	showTitle: string;
	posterPath: string | null;
	seasonNumber: number;
	episodeNumber: number;
	episodeTitle: string;
	airDate: string;
	status: string;
}

export interface DiscoverItem {
	id: string;
	tmdbId: number;
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	year: string | null;
	type: 'show' | 'movie';
	genres: string[];
}

export interface WatchNextItem {
	showId: string;
	showTitle: string;
	posterPath: string | null;
	seasonNumber: number;
	episodeNumber: number;
	episodeTitle: string;
	progressPercent: number;
}

export interface ContinueWatchingItem {
	showId: string;
	showTitle: string;
	posterPath: string | null;
	nextSeason: number;
	nextEpisode: number;
	nextEpisodeTitle: string;
	progressPercent: number;
}

export interface ProfileStats {
	showsTracked: number;
	showsCompleted: number;
	episodesWatched: number;
	moviesWatched: number;
	totalWatchTimeMinutes: number;
	topGenres: { name: string; count: number }[];
}
