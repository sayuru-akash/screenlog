<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Skeleton } from '$lib/components/ui';
	import { StatusPill } from '$lib/components/custom';
	import { getBackdropUrl, getPosterUrl, formatDate } from '$lib/utils';
	import { userTimezone } from '$lib/stores/preferences';
	import { Check, ChevronDown, ChevronUp, Trash2, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let show: any = $state(null);
	let userShow: any = $state(null);
	let progress: any[] = $state([]);
	let loading = $state(true);
	let selectedSeason = $state(1);
	let expandedEpisode: string | null = $state(null);

	const showId = $derived($page.params.id);

	onMount(async () => {
		await loadShow();
	});

	async function loadShow() {
		loading = true;
		try {
			await refreshData();
		} catch {
			toast.error('Failed to load show');
		} finally {
			loading = false;
		}
	}

	async function refreshData() {
		const [showRes, progRes] = await Promise.all([
			fetch(`/api/shows/${showId}`),
			fetch(`/api/progress?showId=${showId}`)
		]);
		const data = await showRes.json();
		show = data.show;
		userShow = data.userShow;
		const p = await progRes.json();
		progress = p.progress || [];
		if (show?.seasons?.length > 0) {
			const hasSeason = show.seasons.some((s: any) => s.seasonNumber === selectedSeason);
			if (!hasSeason) selectedSeason = show.seasons[0].seasonNumber;
		}
	}

	function isWatched(episodeId: string) {
		return progress.some((p) => p.episodeId === episodeId);
	}

	const currentSeason = $derived(show?.seasons?.find((s: any) => s.seasonNumber === selectedSeason));
	const seasonEpisodes = $derived(currentSeason?.episodes || []);
	const watchedCount = $derived(seasonEpisodes.filter((e: any) => isWatched(e.id)).length);
	const totalEpisodes = $derived(seasonEpisodes.length);
	const totalShowEpisodes = $derived(show?.seasons?.flatMap((s: any) => s.episodes).length || 0);
	const totalWatched = $derived(show?.seasons?.flatMap((s: any) => s.episodes).filter((e: any) => isWatched(e.id)).length || 0);

	async function toggleEpisode(episodeId: string) {
		const watching = isWatched(episodeId);
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: watching ? 'unwatch' : 'watch', episodeId, showId })
			});
			await refreshData();
		} catch {
			toast.error('Failed to update');
		}
	}

	async function markSeasonWatched() {
		if (!currentSeason) return;
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'markSeason', seasonId: currentSeason.id })
			});
			await refreshData();
			toast.success('Season marked as watched');
		} catch {
			toast.error('Failed to update');
		}
	}

	async function markCaughtUp() {
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'markCaughtUp', showId })
			});
			await refreshData();
			toast.success('Marked as caught up');
		} catch {
			toast.error('Failed to update');
		}
	}

	async function resetProgress() {
		try {
			await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'resetShow', showId })
			});
			await refreshData();
			toast.success('Progress reset');
		} catch {
			toast.error('Failed to reset');
		}
	}

	const statusOptions = [
		{ value: 'PLAN_TO_WATCH', label: 'Plan' },
		{ value: 'WATCHING', label: 'Watching' },
		{ value: 'CAUGHT_UP', label: 'Caught Up' },
		{ value: 'COMPLETED', label: 'Completed' },
		{ value: 'PAUSED', label: 'Paused' },
		{ value: 'DROPPED', label: 'Dropped' }
	];

	async function changeStatus(status: string) {
		try {
			await fetch('/api/watchlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'show', tmdbId: show.tmdbId, title: show.title, userStatus: status })
			});
			userShow = { ...userShow, status };
		} catch {
			toast.error('Failed to update status');
		}
	}

	async function removeFromWatchlist() {
		try {
			await fetch('/api/watchlist', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'show', id: showId })
			});
			goto('/home');
			toast.success('Removed from watchlist');
		} catch {
			toast.error('Failed to remove');
		}
	}
</script>

<svelte:head>
	<title>{show?.title || 'Show'} - Screenlog</title>
</svelte:head>

{#if loading}
	<div class="space-y-6">
		<Skeleton class="h-64 w-full rounded-xl" />
		<Skeleton class="h-8 w-48" />
		<Skeleton class="h-4 w-full" />
	</div>
{:else if show}
	<div class="space-y-8">
		<!-- Hero -->
		<div class="relative overflow-hidden rounded-xl">
			{#if show.backdropPath}
				<img src={getBackdropUrl(show.backdropPath, 'w1280')} alt={show.title} class="h-64 w-full object-cover md:h-80" />
				<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
			{:else}
				<div class="h-48 w-full bg-muted md:h-64"></div>
			{/if}
			<div class="absolute bottom-0 left-0 right-0 p-4 md:p-6">
				<div class="flex gap-4">
					{#if show.posterPath}
						<img src={getPosterUrl(show.posterPath, 'w154')} alt={show.title} class="hidden h-32 rounded-md object-cover shadow-lg md:block" />
					{/if}
					<div class="flex-1">
						<h1 class="text-2xl font-bold md:text-3xl">{show.title}</h1>
						<div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							{#if show.firstAirDate}<span>{new Date(show.firstAirDate).getFullYear()}</span>{/if}
							{#if show.status}<span>{show.status}</span>{/if}
							{#if show.genres?.length > 0}<span>{show.genres.join(', ')}</span>{/if}
						</div>
						{#if userShow}
							<div class="mt-3">
								<StatusPill status={userShow.status} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Tracking -->
		{#if !userShow}
			<Button onclick={() => changeStatus('WATCHING')}>Add to Watchlist</Button>
		{:else}
			<div class="rounded-xl bg-card border border-border p-4 space-y-4">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium">Progress</span>
						<span class="text-sm text-muted-foreground">{totalWatched} / {totalShowEpisodes}</span>
					</div>
					<div class="flex items-center gap-2">
						<Button size="sm" variant="ghost" onclick={markCaughtUp}>Caught Up</Button>
						<Button size="sm" variant="ghost" onclick={resetProgress}>
							<RotateCcw class="mr-1 h-3.5 w-3.5" /> Reset
						</Button>
						<Button size="sm" variant="ghost" class="text-destructive" onclick={removeFromWatchlist}>
							<Trash2 class="mr-1 h-3.5 w-3.5" /> Remove
						</Button>
					</div>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div class="h-full rounded-full bg-primary transition-all" style="width: {totalShowEpisodes ? (totalWatched / totalShowEpisodes) * 100 : 0}%"></div>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each statusOptions as opt}
						<Button
							size="sm"
							variant={userShow.status === opt.value ? 'default' : 'outline'}
							onclick={() => changeStatus(opt.value)}
						>
							{opt.label}
						</Button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Overview -->
		{#if show.overview}
			<section>
				<h2 class="mb-2 text-lg font-semibold">Overview</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">{show.overview}</p>
			</section>
		{/if}

		<!-- Seasons -->
		{#if show.seasons?.length > 0}
			<section class="space-y-4">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<select
							class="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
							bind:value={selectedSeason}
							onchange={() => expandedEpisode = null}
						>
							{#each show.seasons as season}
								<option value={season.seasonNumber}>
									{season.name || `Season ${season.seasonNumber}`}
									{#if season.episodeCount}({season.episodeCount} eps){/if}
								</option>
							{/each}
						</select>
						{#if userShow}
							<span class="text-sm text-muted-foreground">{watchedCount} / {totalEpisodes} watched</span>
						{/if}
					</div>
					{#if userShow}
						<Button size="sm" variant="ghost" onclick={markSeasonWatched}>Mark Season Watched</Button>
					{/if}
				</div>

				<div class="space-y-2">
					{#each seasonEpisodes as episode (episode.id)}
						{@const watched = isWatched(episode.id)}
						<div class="rounded-lg border border-border bg-card">
							<div class="flex items-center gap-2 p-3">
								{#if userShow}
									<Button
										size="icon"
										variant="outline"
										class="h-9 w-9 shrink-0 rounded-md"
										onclick={() => toggleEpisode(episode.id)}
										aria-label={watched ? 'Mark unwatched' : 'Mark watched'}
									>
										{#if watched}
											<Check class="h-4 w-4 text-primary" />
										{/if}
									</Button>
								{/if}
								<button
									class="min-w-0 flex-1 text-left"
									onclick={() => expandedEpisode = expandedEpisode === episode.id ? null : episode.id}
								>
									<p class="text-sm font-medium">
										S{episode.seasonNumber}E{episode.episodeNumber} · {episode.name}
									</p>
									<p class="text-xs text-muted-foreground">
										{formatDate(episode.airDate, $userTimezone)}
										{#if episode.runtime}· {episode.runtime}m{/if}
									</p>
								</button>
								{#if episode.overview}
									<button
										class="shrink-0 p-1 text-muted-foreground hover:text-foreground"
										onclick={() => expandedEpisode = expandedEpisode === episode.id ? null : episode.id}
										aria-label={expandedEpisode === episode.id ? 'Collapse' : 'Expand'}
									>
										{#if expandedEpisode === episode.id}
											<ChevronUp class="h-4 w-4" />
										{:else}
											<ChevronDown class="h-4 w-4" />
										{/if}
									</button>
								{/if}
							</div>
							{#if expandedEpisode === episode.id && episode.overview}
								<div class="px-3 pb-3 pt-0">
									<p class="text-sm text-muted-foreground">{episode.overview}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{:else}
	<div class="py-16 text-center text-muted-foreground">
		<p>Show not found</p>
	</div>
{/if}
