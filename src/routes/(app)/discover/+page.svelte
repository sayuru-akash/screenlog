<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Skeleton } from '$lib/components/ui';
	import { PosterCard } from '$lib/components/custom';
	import { toast } from 'svelte-sonner';

	let loading = $state(true);
	let sections: Record<string, any[]> = $state({});
	let addedIds = $state<Set<string>>(new Set());

	onMount(async () => {
		try {
			const res = await fetch('/api/discover');
			sections = await res.json();
		} catch {
			toast.error('Failed to load discover');
		} finally {
			loading = false;
		}
	});

	async function navigateToDetail(item: any) {
		try {
			const res = await fetch('/api/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: item.type, tmdbId: item.tmdbId })
			});
			const data = await res.json();
			if (data.id) {
				goto(`/${item.type}/${data.id}`);
			}
		} catch {
			toast.error('Failed to open detail');
		}
	}

	async function addToWatchlist(item: any) {
		try {
			const res = await fetch('/api/watchlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: item.type,
					tmdbId: item.tmdbId,
					title: item.title,
					overview: '',
					posterPath: item.posterPath,
					backdropPath: item.backdropPath,
					firstAirDate: null,
					releaseDate: null,
					genres: item.genres,
					userStatus: item.type === 'show' ? 'WATCHING' : 'PLAN_TO_WATCH'
				})
			});
			if (res.ok) {
				addedIds = new Set([...addedIds, String(item.tmdbId)]);
				toast.success('Added to watchlist');
			}
		} catch {
			toast.error('Failed to add');
		}
	}

	const sectionConfig = [
		{ key: 'trendingShows', title: 'Trending Shows' },
		{ key: 'trendingMovies', title: 'Trending Movies' },
		{ key: 'popularShows', title: 'Popular Shows' },
		{ key: 'popularMovies', title: 'Popular Movies' },
		{ key: 'topRatedShows', title: 'Top Rated Shows' },
		{ key: 'topRatedMovies', title: 'Top Rated Movies' }
	];
</script>

<svelte:head>
	<title>Discover - Screenlog</title>
</svelte:head>

<div class="space-y-10">
	{#if loading}
		{#each Array(3) as _}
			<div class="space-y-3">
				<Skeleton class="h-6 w-40" />
				<div class="flex gap-4 overflow-hidden">
					{#each Array(5) as _}
						<Skeleton class="h-64 w-44 shrink-0 rounded-lg" />
					{/each}
				</div>
			</div>
		{/each}
	{:else}
		{#each sectionConfig as cfg}
			{#if sections[cfg.key]?.length > 0}
				<section>
					<h2 class="mb-4 text-xl font-bold">{cfg.title}</h2>
					<div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
						{#each sections[cfg.key] as item (item.id)}
							<div class="w-36 shrink-0 sm:w-44">
								<PosterCard
									posterPath={item.posterPath}
									title={item.title}
									year={item.year}
									type={item.type}
									added={addedIds.has(String(item.tmdbId))}
									onAdd={() => addToWatchlist(item)}
									onClick={() => navigateToDetail(item)}
								/>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	{/if}
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
