<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Skeleton } from '$lib/components/ui';
	import { EmptyState } from '$lib/components/custom';
	import { getPosterUrl, formatRuntime } from '$lib/utils';
	import { Tv, Check, Clock } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let loading = $state(true);
	let watchlist: any = $state({ shows: [], movies: [] });
	let progress: any[] = $state([]);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [wlRes, progRes] = await Promise.all([
				fetch('/api/watchlist'),
				fetch('/api/progress')
			]);
			watchlist = await wlRes.json();
			const progData = await progRes.json();
			progress = progData.progress || [];
		} catch (e) {
			toast.error('Failed to load watchlist');
		} finally {
			loading = false;
		}
	}

	function isWatched(episodeId: string) {
		return progress.some((p) => p.episodeId === episodeId);
	}

	function getShowProgress(showId: string) {
		const show = watchlist.shows.find((s: any) => s.showId === showId);
		if (!show) return null;
		const eps = show.show.seasons?.flatMap((s: any) => s.episodes) || [];
		const watched = eps.filter((e: any) => isWatched(e.id)).length;
		return { total: eps.length, watched };
	}

	function getNextEpisode(showId: string) {
		const show = watchlist.shows.find((s: any) => s.showId === showId);
		if (!show) return null;
		const allEps = show.show.seasons?.flatMap((s: any) => s.episodes) || [];
		allEps.sort((a: any, b: any) => {
			if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
			return a.episodeNumber - b.episodeNumber;
		});
		return allEps.find((e: any) => !isWatched(e.id)) || null;
	}

	const continueWatching = $derived(
		watchlist.shows
			?.filter((s: any) => s.status === 'WATCHING' || s.status === 'CAUGHT_UP')
			?.map((s: any) => {
				const next = getNextEpisode(s.showId);
				const prog = getShowProgress(s.showId);
				return { ...s, next, progress: prog };
			})
			?.filter((s: any) => s.next) || []
	);

	const moviesList = $derived(watchlist.movies || []);
	const recentlyWatched = $derived(
		progress
			?.slice(0, 10)
			?.map((p: any) => ({
				episodeId: p.episodeId,
				showId: p.episode?.season?.show?.id,
				showTitle: p.episode?.season?.show?.title,
				posterPath: p.episode?.season?.show?.posterPath,
				seasonNumber: p.episode?.seasonNumber,
				episodeNumber: p.episode?.episodeNumber,
				episodeName: p.episode?.name,
				watchedAt: p.watchedAt
			}))
			?.filter((r: any) => r.showId) || []
	);

	async function markEpisodeWatched(episodeId: string, showId: string) {
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'watch', episodeId, showId })
			});
			progress = [...progress, { episodeId }];
			toast.success('Marked as watched');
		} catch {
			toast.error('Failed to update');
		}
	}

	async function markMovieWatched(movie: any) {
		try {
			await fetch('/api/watchlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: 'movie',
					tmdbId: movie.tmdbId,
					title: movie.title,
					overview: movie.overview,
					posterPath: movie.posterPath,
					backdropPath: movie.backdropPath,
					releaseDate: movie.releaseDate,
					genres: movie.genres,
					runtime: movie.runtime,
					userStatus: 'WATCHED'
				})
			});
			await loadData();
			toast.success('Marked as watched');
		} catch {
			toast.error('Failed to update');
		}
	}
</script>

<svelte:head>
	<title>Home - Screenlog</title>
</svelte:head>

<div class="space-y-8">
	{#if loading}
		<div class="space-y-4">
			<Skeleton class="h-8 w-48" />
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each Array(5) as _}
					<Skeleton class="aspect-[2/3] rounded-lg" />
				{/each}
			</div>
		</div>
	{:else if watchlist.shows.length === 0 && watchlist.movies.length === 0}
		<EmptyState
			icon={Tv}
			title="Start tracking your first show"
			description="Search for your favourite series and movies and we'll show you what to watch next."
			actionLabel="Search Content"
			actionHref="/search"
			secondaryActionLabel="Explore Trending"
			secondaryActionHref="/discover"
		/>
	{:else}
		{#if continueWatching.length > 0}
			<section>
				<h2 class="mb-4 text-xl font-bold">Continue Watching</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each continueWatching as item (item.showId)}
						<div class="flex gap-4 rounded-xl bg-card p-4 border border-border">
							<button class="shrink-0" onclick={() => goto(`/show/${item.showId}`)}>
								<img
									src={getPosterUrl(item.show.posterPath, 'w154')}
									alt={item.show.title}
									class="h-24 w-16 rounded-md object-cover"
								/>
							</button>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium">{item.show.title}</p>
								{#if item.next}
									<p class="text-sm text-muted-foreground">
										S{item.next.seasonNumber}E{item.next.episodeNumber} · {item.next.name}
									</p>
								{/if}
								{#if item.progress}
									<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
										<div
											class="h-full rounded-full bg-primary transition-all"
											style="width: {item.progress.total ? (item.progress.watched / item.progress.total) * 100 : 0}%"
										></div>
									</div>
								{/if}
								<div class="mt-3 flex gap-2">
									{#if item.next}
										<Button size="sm" onclick={() => markEpisodeWatched(item.next.id, item.showId)}>
											<Check class="mr-1 h-3 w-3" />
											Mark Watched
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if recentlyWatched.length > 0}
			<section>
				<h2 class="mb-4 text-xl font-bold">Recently Watched</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{#each recentlyWatched as item (item.episodeId)}
						<button class="group text-left" onclick={() => goto(`/show/${item.showId}`)}>
							<div class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
								{#if item.posterPath}
									<img src={getPosterUrl(item.posterPath, 'w342')} alt={item.showTitle} class="h-full w-full object-cover" loading="lazy" />
								{:else}
									<div class="flex h-full items-center justify-center text-sm text-muted-foreground">No poster</div>
								{/if}
								<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
									<p class="text-xs font-medium text-white">S{item.seasonNumber}E{item.episodeNumber}</p>
									<p class="truncate text-xs text-white/80">{item.episodeName}</p>
								</div>
							</div>
							<div class="mt-2">
								<p class="truncate text-sm font-medium">{item.showTitle}</p>
								<p class="text-xs text-muted-foreground flex items-center gap-1">
									<Clock class="h-3 w-3" />
									{new Date(item.watchedAt).toLocaleDateString()}
								</p>
							</div>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		{#if moviesList.length > 0}
			<section>
				<h2 class="mb-4 text-xl font-bold">Movies Watchlist</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{#each moviesList as item (item.movieId)}
						<div class="group">
							<button class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted" onclick={() => goto(`/movie/${item.movieId}`)}>
								{#if item.movie.posterPath}
									<img src={getPosterUrl(item.movie.posterPath, 'w342')} alt={item.movie.title} class="h-full w-full object-cover" loading="lazy" />
								{:else}
									<div class="flex h-full items-center justify-center text-sm text-muted-foreground">No poster</div>
								{/if}
							</button>
							<div class="mt-2 space-y-0.5">
								<p class="truncate text-sm font-medium">{item.movie.title}</p>
								<div class="flex items-center justify-between">
									<span class="text-xs text-muted-foreground">
										{item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : ''}
										{formatRuntime(item.movie.runtime)}
									</span>
									{#if item.status === 'PLAN_TO_WATCH'}
										<Button size="sm" variant="ghost" class="h-6 px-2 text-xs" onclick={() => markMovieWatched(item.movie)}>
											Watched
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
