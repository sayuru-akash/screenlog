<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Skeleton } from '$lib/components/ui';
	import { EmptyState } from '$lib/components/custom';
	import { getPosterUrl, formatRuntime } from '$lib/utils';
	import { userTimezone } from '$lib/stores/preferences';
	import { Tv, Check, Clock, Film, ChevronLeft, ChevronRight, Play } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// --- State ---
	let loading = $state(true);
	let watchlist: any = $state({ shows: [], movies: [] });
	let progress: any[] = $state([]);
	let activeTab = $state<'shows' | 'movies'>('shows');

	// Pagination state per section
	const ITEMS_PER_PAGE = 8;
	let showPages = $state<Record<string, number>>({
		watching: 1,
		completed: 1,
		planToWatch: 1,
		pausedDropped: 1
	});
	let moviePages = $state<Record<string, number>>({
		favourites: 1,
		watched: 1,
		planToWatch: 1,
		dropped: 1
	});

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

	// --- Helpers ---
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
		return [...allEps]
			.sort((a: any, b: any) => {
				if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
				return a.episodeNumber - b.episodeNumber;
			})
			.find((e: any) => !isWatched(e.id)) || null;
	}

	function formatTimeAgo(dateStr: string) {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString('en-US', { timeZone: $userTimezone, month: 'short', day: 'numeric' });
	}

	// --- Derived data ---
	const showsList = $derived(watchlist.shows || []);
	const moviesList = $derived(watchlist.movies || []);

	const continueWatching = $derived(
		showsList
			.filter((s: any) => s.status === 'WATCHING' || s.status === 'CAUGHT_UP')
			.map((s: any) => {
				const next = getNextEpisode(s.showId);
				const prog = getShowProgress(s.showId);
				return { ...s, next, progress: prog };
			})
			.filter((s: any) => s.next)
	);

	const recentActivity = $derived.by(() => {
		const map = new Map<string, any>();
		for (const p of progress) {
			const showId = p.episode?.season?.show?.id;
			if (!showId || map.has(showId)) continue;
			map.set(showId, {
				showId,
				showTitle: p.episode?.season?.show?.title,
				posterPath: p.episode?.season?.show?.posterPath,
				seasonNumber: p.episode?.seasonNumber,
				episodeNumber: p.episode?.episodeNumber,
				episodeName: p.episode?.name,
				watchedAt: p.watchedAt
			});
		}
		return Array.from(map.values()).slice(0, 10);
	});

	// Show sections
	const watchingShows = $derived(showsList.filter((s: any) => s.status === 'WATCHING' || s.status === 'CAUGHT_UP'));
	const completedShows = $derived(showsList.filter((s: any) => s.status === 'COMPLETED'));
	const planToWatchShows = $derived(showsList.filter((s: any) => s.status === 'PLAN_TO_WATCH'));
	const pausedDroppedShows = $derived(showsList.filter((s: any) => s.status === 'PAUSED' || s.status === 'DROPPED'));

	// Movie sections
	const favouriteMovies = $derived(moviesList.filter((m: any) => m.status === 'FAVOURITE'));
	const watchedMovies = $derived(moviesList.filter((m: any) => m.status === 'WATCHED'));
	const planToWatchMovies = $derived(moviesList.filter((m: any) => m.status === 'PLAN_TO_WATCH'));
	const droppedMovies = $derived(moviesList.filter((m: any) => m.status === 'DROPPED'));

	// --- Pagination ---
	function paginate(items: any[], page: number) {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return items.slice(start, start + ITEMS_PER_PAGE);
	}

	function totalPages(items: any[]) {
		return Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
	}

	function goToPage(section: string, page: number, type: 'show' | 'movie') {
		if (type === 'show') {
			showPages = { ...showPages, [section]: page };
		} else {
			moviePages = { ...moviePages, [section]: page };
		}
	}

	// --- Actions ---
	async function markEpisodeWatched(episodeId: string, showId: string) {
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'watch', episodeId, showId })
			});
			await loadData();
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

	function statusLabel(status: string) {
		return status.replace(/_/g, ' ');
	}
</script>

<svelte:head>
	<title>Home - Screenlog</title>
</svelte:head>

<div class="space-y-10">
	{#if loading}
		<div class="space-y-8">
			{#each Array(3) as _, i}
				<div class="space-y-3">
					<Skeleton class="h-7 w-40" />
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each Array(5) as __}
							<Skeleton class="aspect-[2/3] rounded-lg" />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else if showsList.length === 0 && moviesList.length === 0}
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
		<!-- Tabs -->
		<div class="flex items-center gap-4 border-b border-border">
			<button
				class="pb-2 text-sm font-medium transition-colors {activeTab === 'shows' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => activeTab = 'shows'}
				aria-pressed={activeTab === 'shows'}
			>
				<Tv class="mr-1 inline h-4 w-4" />
				TV Shows
				<span class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{showsList.length}</span>
			</button>
			<button
				class="pb-2 text-sm font-medium transition-colors {activeTab === 'movies' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}"
				onclick={() => activeTab = 'movies'}
				aria-pressed={activeTab === 'movies'}
			>
				<Film class="mr-1 inline h-4 w-4" />
				Movies
				<span class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{moviesList.length}</span>
			</button>
		</div>

		{#if activeTab === 'shows'}
			<!-- Continue Watching -->
			{#if continueWatching.length > 0}
				<section aria-label="Continue Watching">
					<h2 class="mb-4 text-lg font-bold">Continue Watching</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each continueWatching as item (item.showId)}
							<div class="flex gap-4 rounded-xl bg-card p-4 border border-border">
								<button class="shrink-0" onclick={() => goto(`/show/${item.showId}`)} aria-label="Go to {item.show.title}">
									<img
										src={getPosterUrl(item.show.posterPath, 'w154')}
										alt={item.show.title}
										class="h-24 w-16 rounded-md object-cover"
										loading="lazy"
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
												aria-hidden="true"
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

			<!-- Recent Activity -->
			{#if recentActivity.length > 0}
				<section aria-label="Recent Activity">
					<h2 class="mb-4 text-lg font-bold">Recent Activity</h2>
					<div class="flex gap-4 overflow-x-auto pb-2">
						{#each recentActivity as item (item.showId)}
							<button
								class="group shrink-0 text-left"
								onclick={() => goto(`/show/${item.showId}`)}
								aria-label="{item.showTitle} S{item.seasonNumber}E{item.episodeNumber}"
							>
								<div class="relative h-32 w-24 overflow-hidden rounded-lg bg-muted sm:h-40 sm:w-28">
									{#if item.posterPath}
										<img
											src={getPosterUrl(item.posterPath, 'w342')}
											alt={item.showTitle}
											class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											loading="lazy"
										/>
									{:else}
										<div class="flex h-full items-center justify-center text-xs text-muted-foreground">No poster</div>
									{/if}
								</div>
								<div class="mt-2 w-24 sm:w-28">
									<p class="truncate text-xs font-medium">{item.showTitle}</p>
									<p class="text-[11px] text-muted-foreground">
										S{item.seasonNumber}E{item.episodeNumber}
									</p>
									<p class="flex items-center gap-1 text-[11px] text-muted-foreground">
										<Clock class="h-3 w-3" />
										{formatTimeAgo(item.watchedAt)}
									</p>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Watching -->
			{@render showSection('watching', 'Watching', watchingShows)}

			<!-- Completed -->
			{@render showSection('completed', 'Completed', completedShows)}

			<!-- Plan to Watch -->
			{@render showSection('planToWatch', 'Plan to Watch', planToWatchShows)}

			<!-- Paused / Dropped -->
			{@render showSection('pausedDropped', 'Paused / Dropped', pausedDroppedShows)}
		{:else}
			<!-- Movies: Favourites -->
			{@render movieSection('favourites', 'Favourites', favouriteMovies)}

			<!-- Movies: Watched -->
			{@render movieSection('watched', 'Watched', watchedMovies)}

			<!-- Movies: Plan to Watch -->
			{@render movieSection('planToWatch', 'Plan to Watch', planToWatchMovies)}

			<!-- Movies: Dropped -->
			{@render movieSection('dropped', 'Dropped', droppedMovies)}
		{/if}
	{/if}
</div>

<!-- Snippets -->

{#snippet showSection(key: string, title: string, items: any[])}
	{#if items.length > 0}
		{@const page = showPages[key] || 1}
		{@const pages = totalPages(items)}
		{@const paged = paginate(items, page)}
		<section aria-label={title}>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold">{title}</h2>
				<span class="text-xs text-muted-foreground">
					{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, items.length)} of {items.length}
				</span>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each paged as item (item.showId)}
					{@const prog = getShowProgress(item.showId)}
					<div class="group">
						<button
							class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted"
							onclick={() => goto(`/show/${item.showId}`)}
							aria-label="{item.show.title}"
						>
							{#if item.show.posterPath}
								<img
									src={getPosterUrl(item.show.posterPath, 'w342')}
									alt={item.show.title}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
								/>
							{:else}
								<div class="flex h-full items-center justify-center text-sm text-muted-foreground">No poster</div>
							{/if}
							{#if prog && prog.total > 0}
								<div class="absolute bottom-0 left-0 right-0 h-1 bg-muted" aria-hidden="true">
									<div
										class="h-full bg-primary transition-all"
										style="width: {(prog.watched / prog.total) * 100}%"
									></div>
								</div>
							{/if}
						</button>
						<div class="mt-2 space-y-0.5">
							<p class="truncate text-sm font-medium">{item.show.title}</p>
							<div class="flex items-center justify-between">
								<span class="text-xs text-muted-foreground">
									{item.show.firstAirDate ? new Date(item.show.firstAirDate).getFullYear() : ''}
									{#if prog && prog.total > 0}
										· {prog.watched}/{prog.total} eps
									{/if}
								</span>
								<span class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
									{statusLabel(item.status)}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
			{#if pages > 1}
				<nav class="mt-4 flex items-center justify-center gap-2" aria-label="Pagination for {title}">
					<Button
						size="sm"
						variant="outline"
						disabled={page <= 1}
						onclick={() => goToPage(key, page - 1, 'show')}
						aria-label="Previous page"
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each Array(pages) as _, i}
						{@const p = i + 1}
						<Button
							size="sm"
							variant={p === page ? 'default' : 'outline'}
							class="h-8 w-8 p-0"
							onclick={() => goToPage(key, p, 'show')}
							aria-label="Page {p}"
							aria-current={p === page ? 'page' : undefined}
						>
							{p}
						</Button>
					{/each}
					<Button
						size="sm"
						variant="outline"
						disabled={page >= pages}
						onclick={() => goToPage(key, page + 1, 'show')}
						aria-label="Next page"
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</nav>
			{/if}
		</section>
	{/if}
{/snippet}

{#snippet movieSection(key: string, title: string, items: any[])}
	{#if items.length > 0}
		{@const page = moviePages[key] || 1}
		{@const pages = totalPages(items)}
		{@const paged = paginate(items, page)}
		<section aria-label={title}>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold">{title}</h2>
				<span class="text-xs text-muted-foreground">
					{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, items.length)} of {items.length}
				</span>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each paged as item (item.movieId)}
					<div class="group">
						<button
							class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted"
							onclick={() => goto(`/movie/${item.movieId}`)}
							aria-label="{item.movie.title}"
						>
							{#if item.movie.posterPath}
								<img
									src={getPosterUrl(item.movie.posterPath, 'w342')}
									alt={item.movie.title}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
								/>
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
										Mark Watched
									</Button>
								{:else}
									<span class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
										{statusLabel(item.status)}
									</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
			{#if pages > 1}
				<nav class="mt-4 flex items-center justify-center gap-2" aria-label="Pagination for {title}">
					<Button
						size="sm"
						variant="outline"
						disabled={page <= 1}
						onclick={() => goToPage(key, page - 1, 'movie')}
						aria-label="Previous page"
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each Array(pages) as _, i}
						{@const p = i + 1}
						<Button
							size="sm"
							variant={p === page ? 'default' : 'outline'}
							class="h-8 w-8 p-0"
							onclick={() => goToPage(key, p, 'movie')}
							aria-label="Page {p}"
							aria-current={p === page ? 'page' : undefined}
						>
							{p}
						</Button>
					{/each}
					<Button
						size="sm"
						variant="outline"
						disabled={page >= pages}
						onclick={() => goToPage(key, page + 1, 'movie')}
						aria-label="Next page"
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</nav>
			{/if}
		</section>
	{/if}
{/snippet}
