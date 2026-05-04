import { TMDB_API_KEY } from '$env/static/private';
import type { SearchResult, ShowSummary, ShowDetail, SeasonSummary, EpisodeSummary, MovieSummary, DiscoverItem } from '$lib/types/content';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function getHeaders() {
	return {
		Authorization: `Bearer ${TMDB_API_KEY}`,
		'Content-Type': 'application/json'
	};
}

function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function searchMulti(query: string): Promise<SearchResult[]> {
	if (!query.trim()) return [];
	const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);

	return data.results
		.filter((r) => r.media_type === 'tv' || r.media_type === 'movie')
		.map((r) => ({
			id: String(r.id),
			tmdbId: r.id,
			title: r.name || r.title || 'Untitled',
			overview: r.overview || '',
			posterPath: r.poster_path || null,
			backdropPath: r.backdrop_path || null,
			year: (r.first_air_date || r.release_date || '').slice(0, 4) || null,
			type: r.media_type === 'tv' ? 'show' : 'movie',
			genres: []
		}));
}

export async function getShowDetails(tmdbId: number): Promise<ShowDetail> {
	const url = `${BASE_URL}/tv/${tmdbId}?language=en-US&append_to_response=credits`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<any>);

	return {
		id: String(data.id),
		tmdbId: data.id,
		title: data.name || 'Untitled',
		overview: data.overview || null,
		posterPath: data.poster_path || null,
		backdropPath: data.backdrop_path || null,
		firstAirDate: data.first_air_date || null,
		status: data.status || null,
		genres: data.genres?.map((g: any) => g.name) || [],
		network: data.networks?.[0]?.name || null,
		seasons:
			data.seasons
				?.filter((s: any) => s.season_number > 0)
				?.map((s: any) => ({
					id: String(s.id),
					seasonNumber: s.season_number,
					name: s.name || null,
					overview: s.overview || null,
					posterPath: s.poster_path || null,
					airDate: s.air_date || null,
					episodeCount: s.episode_count || null
				})) || []
	};
}

export async function getSeasonEpisodes(tmdbId: number, seasonNumber: number): Promise<EpisodeSummary[]> {
	const url = `${BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?language=en-US`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<any>);

	return (
		data.episodes?.map((e: any) => ({
			id: String(e.id),
			seasonId: String(data.id),
			seasonNumber: e.season_number,
			episodeNumber: e.episode_number,
			name: e.name || `Episode ${e.episode_number}`,
			overview: e.overview || null,
			stillPath: e.still_path || null,
			airDate: e.air_date || null,
			runtime: e.runtime || null
		})) || []
	);
}

export async function getMovieDetails(tmdbId: number): Promise<MovieSummary> {
	const url = `${BASE_URL}/movie/${tmdbId}?language=en-US`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<any>);

	return {
		id: String(data.id),
		tmdbId: data.id,
		title: data.title || 'Untitled',
		overview: data.overview || null,
		posterPath: data.poster_path || null,
		backdropPath: data.backdrop_path || null,
		releaseDate: data.release_date || null,
		runtime: data.runtime || null,
		genres: data.genres?.map((g: any) => g.name) || [],
		status: data.status || null
	};
}

export async function getTrendingShows(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/trending/tv/week?language=en-US`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapTvToDiscover);
}

export async function getTrendingMovies(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/trending/movie/week?language=en-US`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapMovieToDiscover);
}

export async function getPopularShows(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/tv/popular?language=en-US&page=1`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapTvToDiscover);
}

export async function getPopularMovies(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/movie/popular?language=en-US&page=1`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapMovieToDiscover);
}

export async function getTopRatedShows(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/tv/top_rated?language=en-US&page=1`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapTvToDiscover);
}

export async function getTopRatedMovies(): Promise<DiscoverItem[]> {
	const url = `${BASE_URL}/movie/top_rated?language=en-US&page=1`;
	const data = await fetch(url, { headers: getHeaders() }).then(handleResponse<{ results: any[] }>);
	return data.results.slice(0, 20).map(mapMovieToDiscover);
}

function mapTvToDiscover(r: any): DiscoverItem {
	return {
		id: String(r.id),
		tmdbId: r.id,
		title: r.name || 'Untitled',
		posterPath: r.poster_path || null,
		backdropPath: r.backdrop_path || null,
		year: (r.first_air_date || '').slice(0, 4) || null,
		type: 'show',
		genres: []
	};
}

function mapMovieToDiscover(r: any): DiscoverItem {
	return {
		id: String(r.id),
		tmdbId: r.id,
		title: r.title || 'Untitled',
		posterPath: r.poster_path || null,
		backdropPath: r.backdrop_path || null,
		year: (r.release_date || '').slice(0, 4) || null,
		type: 'movie',
		genres: []
	};
}
