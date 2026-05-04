<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input } from '$lib/components/ui';
	import { Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let step = $state(1);
	let interests: string[] = $state([]);
	let query = $state('');
	let searchResults: any[] = $state([]);
	let added: any[] = $state([]);
	let loading = $state(false);

	const genres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

	function toggleInterest(g: string) {
		if (interests.includes(g)) {
			interests = interests.filter((i) => i !== g);
		} else {
			interests = [...interests, g];
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function search() {
		clearTimeout(debounceTimer);
		if (!query.trim()) { searchResults = []; return; }
		debounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
				const data = await res.json();
				searchResults = data.results || [];
			} finally { loading = false; }
		}, 350);
	}

	async function addItem(item: any) {
		try {
			const res = await fetch('/api/watchlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: item.type,
					tmdbId: item.tmdbId,
					title: item.title,
					posterPath: item.posterPath,
					backdropPath: item.backdropPath,
					firstAirDate: item.year ? `${item.year}-01-01` : null,
					releaseDate: item.year ? `${item.year}-01-01` : null,
					genres: item.genres,
					userStatus: item.type === 'show' ? 'WATCHING' : 'PLAN_TO_WATCH'
				})
			});
			if (res.ok) {
				added = [...added, item.id];
				toast.success('Added');
			}
		} catch {}
	}

	function finish() {
		goto('/home');
	}
</script>

<svelte:head>
	<title>Onboarding - Screenlog</title>
</svelte:head>

<div class="mx-auto max-w-lg py-10">
	{#if step === 1}
		<div class="space-y-6 text-center">
			<h1 class="text-3xl font-bold">Welcome to Screenlog</h1>
			<p class="text-muted-foreground">Your personal watch tracker for shows, movies, and anime.</p>
			<Button size="lg" class="w-full" onclick={() => step = 2}>Get Started</Button>
		</div>
	{:else if step === 2}
		<div class="space-y-6">
			<h2 class="text-xl font-bold">What do you watch?</h2>
			<div class="flex flex-wrap gap-2">
				{#each genres as g}
					<button
						class="rounded-full px-4 py-2 text-sm font-medium transition-colors border {interests.includes(g) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border'}"
						onclick={() => toggleInterest(g)}
					>
						{g}
					</button>
				{/each}
			</div>
			<Button class="w-full" onclick={() => step = 3}>Continue</Button>
		</div>
	{:else if step === 3}
		<div class="space-y-6">
			<h2 class="text-xl font-bold">Add your first titles</h2>
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input class="pl-10" placeholder="Search..." bind:value={query} oninput={search} />
			</div>
			<div class="space-y-3">
				{#each searchResults.slice(0, 6) as item}
					<div class="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
						{#if item.posterPath}
							<img src={`https://image.tmdb.org/t/p/w92${item.posterPath}`} alt={item.title} class="h-16 w-11 rounded object-cover" />
						{:else}
							<div class="h-16 w-11 rounded bg-muted"></div>
						{/if}
						<div class="flex-1 min-w-0">
							<p class="truncate font-medium text-sm">{item.title}</p>
							<p class="text-xs text-muted-foreground">{item.year} · {item.type}</p>
						</div>
						<Button size="sm" variant={added.includes(item.id) ? 'default' : 'secondary'} onclick={() => addItem(item)}>
							{added.includes(item.id) ? 'Added' : 'Add'}
						</Button>
					</div>
				{/each}
			</div>
			<div class="flex gap-3">
				<Button variant="secondary" class="flex-1" onclick={finish}>Skip for now</Button>
				<Button class="flex-1" onclick={finish} disabled={added.length === 0}>Continue ({added.length})</Button>
			</div>
		</div>
	{/if}
</div>
