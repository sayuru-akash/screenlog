<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button, Skeleton } from '$lib/components/ui';
	import { StatusPill } from '$lib/components/custom';
	import { getBackdropUrl, getPosterUrl } from '$lib/utils';
	import { Check, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let movie: any = $state(null);
	let userMovie: any = $state(null);
	let loading = $state(true);

	const movieId = $derived($page.params.id);

	onMount(async () => {
		try {
			const res = await fetch(`/api/movies/${movieId}`);
			const data = await res.json();
			movie = data.movie;
			userMovie = data.userMovie;
		} catch {
			toast.error('Failed to load movie');
		} finally {
			loading = false;
		}
	});

	async function addToWatchlist(status: string) {
		try {
			const res = await fetch('/api/watchlist', {
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
					userStatus: status
				})
			});
			if (res.ok) {
				userMovie = { status };
				toast.success('Updated');
			}
		} catch {
			toast.error('Failed to update');
		}
	}

	async function removeFromWatchlist() {
		try {
			await fetch('/api/watchlist', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'movie', id: movieId })
			});
			userMovie = null;
			toast.success('Removed from watchlist');
		} catch {
			toast.error('Failed to remove');
		}
	}
</script>

<svelte:head>
	<title>{movie?.title || 'Movie'} - Screenlog</title>
</svelte:head>

{#if loading}
	<div class="space-y-6">
		<Skeleton class="h-64 w-full rounded-xl" />
		<Skeleton class="h-8 w-48" />
		<Skeleton class="h-4 w-full" />
	</div>
{:else if movie}
	<div class="space-y-8">
		<!-- Hero -->
		<div class="relative overflow-hidden rounded-xl">
			{#if movie.backdropPath}
				<img src={getBackdropUrl(movie.backdropPath, 'w1280')} alt={movie.title} class="h-64 w-full object-cover md:h-80" />
				<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
			{:else}
				<div class="h-48 w-full bg-muted md:h-64"></div>
			{/if}
			<div class="absolute bottom-0 left-0 right-0 p-4 md:p-6">
				<div class="flex gap-4">
					{#if movie.posterPath}
						<img src={getPosterUrl(movie.posterPath, 'w154')} alt={movie.title} class="hidden h-32 rounded-md object-cover shadow-lg md:block" />
					{/if}
					<div class="flex-1">
						<h1 class="text-2xl font-bold md:text-3xl">{movie.title}</h1>
						<div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							{#if movie.releaseDate}<span>{new Date(movie.releaseDate).getFullYear()}</span>{/if}
							{#if movie.runtime}<span>{movie.runtime}m</span>{/if}
							{#if movie.genres?.length > 0}<span>{movie.genres.join(', ')}</span>{/if}
						</div>
						{#if userMovie}
							<div class="mt-3">
								<StatusPill status={userMovie.status} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex flex-wrap gap-2">
			{#if !userMovie}
				<Button onclick={() => addToWatchlist('PLAN_TO_WATCH')}>Add to Watchlist</Button>
			{:else}
				{#if userMovie.status !== 'WATCHED'}
					<Button onclick={() => addToWatchlist('WATCHED')}>
						<Check class="mr-1 h-4 w-4" /> Mark Watched
					</Button>
				{/if}
				{#if userMovie.status !== 'FAVOURITE'}
					<Button variant="secondary" onclick={() => addToWatchlist('FAVOURITE')}>Favourite</Button>
				{/if}
				<Button variant="secondary" onclick={removeFromWatchlist}>
					<Trash2 class="mr-1 h-4 w-4" /> Remove
				</Button>
			{/if}
		</div>

		<!-- Overview -->
		{#if movie.overview}
			<section>
				<h2 class="mb-2 text-lg font-semibold">Overview</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">{movie.overview}</p>
			</section>
		{/if}
	</div>
{:else}
	<div class="py-16 text-center text-muted-foreground">
		<p>Movie not found</p>
	</div>
{/if}
