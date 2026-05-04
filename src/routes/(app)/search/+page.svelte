<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { Button, Input, Skeleton } from '$lib/components/ui';
	import { PosterCard } from '$lib/components/custom';
	import { Search, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let query = $state('');
	let results: any[] = $state([]);
	let loading = $state(false);
	let filter: 'all' | 'show' | 'movie' = $state('all');
	let addedIds = $state<Set<string>>(new Set());
	let navigating = $state<string | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout>;

	function search() {
		clearTimeout(debounceTimer);
		if (!query.trim()) {
			results = [];
			return;
		}
		debounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
				const data = await res.json();
				results = data.results || [];
			} catch {
				toast.error('Search failed');
			} finally {
				loading = false;
			}
		}, 350);
	}

	const filtered = $derived(
		filter === 'all' ? results : results.filter((r) => r.type === filter)
	);

	async function navigateToDetail(item: any) {
		navigating = item.id;
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
		} finally {
			navigating = null;
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
					overview: item.overview,
					posterPath: item.posterPath,
					backdropPath: item.backdropPath,
					firstAirDate: null,
					releaseDate: null,
					genres: item.genres,
					userStatus: item.type === 'show' ? 'WATCHING' : 'PLAN_TO_WATCH'
				})
			});
			if (res.ok) {
				addedIds = new Set([...addedIds, item.id]);
				toast.success('Added to watchlist');
			}
		} catch {
			toast.error('Failed to add');
		}
	}

	onDestroy(() => clearTimeout(debounceTimer));
</script>

<svelte:head>
	<title>Search - Screenlog</title>
</svelte:head>

<div class="space-y-6">
	<div class="relative">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			class="pl-10 pr-10"
			placeholder="Search shows and movies..."
			bind:value={query}
			oninput={search}
		/>
		{#if query}
			<button class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onclick={() => { query = ''; results = []; }}>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<div class="flex gap-2">
		{#each [{ key: 'all', label: 'All' }, { key: 'show', label: 'Shows' }, { key: 'movie', label: 'Movies' }] as f}
			<Button
				size="sm"
				variant={filter === f.key ? 'default' : 'secondary'}
				onclick={() => filter = f.key as any}
			>
				{f.label}
			</Button>
		{/each}
	</div>

	{#if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each Array(10) as _}
				<Skeleton class="aspect-[2/3] rounded-lg" />
			{/each}
		</div>
	{:else if filtered.length > 0}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each filtered as item (item.id)}
				<PosterCard
					posterPath={item.posterPath}
					title={item.title}
					year={item.year}
					type={item.type}
					added={addedIds.has(item.id)}
					onAdd={() => addToWatchlist(item)}
					onClick={() => navigateToDetail(item)}
				/>
			{/each}
		</div>
	{:else if query}
		<div class="py-16 text-center text-muted-foreground">
			<p>No results found for "{query}"</p>
			<p class="text-sm mt-1">Try another title</p>
		</div>
	{:else}
		<div class="py-16 text-center text-muted-foreground">
			<p>Search for shows and movies to add to your watchlist</p>
		</div>
	{/if}
</div>
