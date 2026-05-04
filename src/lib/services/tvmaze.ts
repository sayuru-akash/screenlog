const BASE_URL = 'https://api.tvmaze.com';

function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) throw new Error(`TVmaze error: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function searchShows(query: string) {
	if (!query.trim()) return [];
	const url = `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`;
	const data = await fetch(url).then(handleResponse<any[]>);
	return data.map((item) => ({
		id: item.show.id,
		name: item.show.name,
		premiered: item.show.premiered,
		image: item.show.image
	}));
}

export async function getShowEpisodes(tvMazeId: number) {
	const url = `${BASE_URL}/shows/${tvMazeId}/episodes`;
	return fetch(url).then(handleResponse<any[]>);
}
