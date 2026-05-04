<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Skeleton } from '$lib/components/ui';
	import { StatusPill } from '$lib/components/custom';
	import { getBackdropUrl, getPosterUrl, formatDate } from '$lib/utils';
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
				selectedSeason = show.seasons[0].seasonNumber;
			}
		} catch {
			toast.error('Failed to load show');
		} finally {
			loading = false;
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
			if (watching) {
				progress = progress.filter((p) => p.episodeId !== episodeId);
			} else {
				progress = [...progress, { episodeId }];
			}
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
			const newIds = currentSeason.episodes.map((e: any) => e.id).filter((id: string) => !isWatched(id));
			progress = [...progress, ...newIds.map((id: string) => ({ episodeId: id }))];
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
			const allEps = show.seasons.flatMap((s: any) => s.episodes);
			progress = allEps.map((e: any) => ({ episodeId: e.id }));
			userShow = { ...userShow, status: 'CAUGHT_UP' };
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
			progress = [];
			userShow = { ...userShow, status: 'PLAN_TO_WATCH' };
			toast.success('Progress reset');
		} catch {
			toast.error('Failed to reset');
		}
	}

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

		<!-- Actions -->
		<div class="flex flex-wrap gap-2">
			{#if !userShow}
				<Button onclick={() => changeStatus('WATCHING')}>Add to Watchlist</Button>
			{:else}
				<Button variant="secondary" onclick={removeFromWatchlist}>
					<Trash2 class="mr-1 h-4 w-4" /> Remove
				</Button>
				<Button variant="secondary" onclick={markCaughtUp}>Mark Caught Up</Button>
				<Button variant="secondary" onclick={resetProgress}>
					<RotateCcw class="mr-1 h-4 w-4" /> Reset
				</Button>
			{/if}
		</div>

		{#if userShow}
			<!-- Progress -->
			<div class="rounded-xl bg-card p-4 border border-border">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">Progress</span>
					<span class="text-sm text-muted-foreground">{totalWatched} / {totalShowEpisodes}</span>
				</div>
				<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
					<div class="h-full rounded-full bg-primary transition-all" style="width: {totalShowEpisodes ? (totalWatched / totalShowEpisodes) * 100 : 0}%"></div>
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
			<section>
				<div class="mb-4 flex items-center gap-2 overflow-x-auto">
					{#each show.seasons as season}
						<Button
							size="sm"
							variant={selectedSeason === season.seasonNumber ? 'default' : 'secondary'}
							onclick={() => selectedSeason = season.seasonNumber}
						>
							{season.name || `Season ${season.seasonNumber}`}
						</Button>
					{/each}
				</div>

				{#if userShow}
					<div class="mb-3 flex items-center justify-between">
						<span class="text-sm text-muted-foreground">{watchedCount} / {totalEpisodes} watched</span>
						<Button size="sm" variant="ghost" onclick={markSeasonWatched}>Mark Season Watched</Button>
					</div>
				{/if}

				<div class="space-y-2">
					{#each seasonEpisodes as episode (episode.id)}
						<div class="rounded-lg border border-border bg-card">
							<button
								class="flex w-full items-center gap-3 p-3 text-left"
								onclick={() => expandedEpisode = expandedEpisode === episode.id ? null : episode.id}
							>
								{#if userShow}
									<div
										class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-border"
										onclick={(e) => { e.stopPropagation(); toggleEpisode(episode.id); }}
										onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleEpisode(episode.id); } }}
										role="button"
										tabindex="0"
									>
										{#if isWatched(episode.id)}
											<Check class="h-3.5 w-3.5 text-primary" />
										{/if}
									</div>
								{/if}
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium">
										S{episode.seasonNumber}E{episode.episodeNumber} · {episode.name}
									</p>
									<p class="text-xs text-muted-foreground">
										{formatDate(episode.airDate)}
										{#if episode.runtime}· {episode.runtime}m{/if}
									</p>
								</div>
								{#if episode.overview}
									{#if expandedEpisode === episode.id}
										<ChevronUp class="h-4 w-4 shrink-0 text-muted-foreground" />
									{:else}
										<ChevronDown class="h-4 w-4 shrink-0 text-muted-foreground" />
									{/if}
								{/if}
							</button>
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
