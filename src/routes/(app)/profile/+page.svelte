<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Skeleton } from '$lib/components/ui';
	import { getInitials, getPosterUrl, formatRuntime } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let stats: any = $state(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/profile');
			stats = await res.json();
		} catch {
			toast.error('Failed to load profile');
		} finally {
			loading = false;
		}
	});

	const user = $derived($page.data.user);
</script>

<svelte:head>
	<title>Profile - Screenlog</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-8">
	<!-- Identity -->
	<div class="flex items-center gap-4">
		<div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
			{getInitials(user?.name || user?.email)}
		</div>
		<div>
			<h1 class="text-2xl font-bold">{user?.name || 'User'}</h1>
			<p class="text-sm text-muted-foreground">{user?.email}</p>
		</div>
	</div>

	<!-- Stats -->
	{#if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			{#each Array(6) as _}
				<Skeleton class="h-24 rounded-xl" />
			{/each}
		</div>
	{:else if stats}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
			<div class="rounded-xl bg-card p-4 border border-border text-center">
				<p class="text-2xl font-bold">{stats.showsTracked}</p>
				<p class="text-xs text-muted-foreground">Shows Tracked</p>
			</div>
			<div class="rounded-xl bg-card p-4 border border-border text-center">
				<p class="text-2xl font-bold">{stats.showsCompleted}</p>
				<p class="text-xs text-muted-foreground">Completed</p>
			</div>
			<div class="rounded-xl bg-card p-4 border border-border text-center">
				<p class="text-2xl font-bold">{stats.episodesWatched}</p>
				<p class="text-xs text-muted-foreground">Episodes</p>
			</div>
			<div class="rounded-xl bg-card p-4 border border-border text-center">
				<p class="text-2xl font-bold">{stats.moviesWatched}</p>
				<p class="text-xs text-muted-foreground">Movies</p>
			</div>
			<div class="rounded-xl bg-card p-4 border border-border text-center col-span-2 sm:col-span-1">
				<p class="text-2xl font-bold">{formatRuntime(stats.totalWatchTimeMinutes)}</p>
				<p class="text-xs text-muted-foreground">Watch Time</p>
			</div>
		</div>

		{#if stats.topGenres?.length > 0}
			<div class="rounded-xl bg-card p-4 border border-border">
				<h2 class="mb-3 text-sm font-semibold">Top Genres</h2>
				<div class="flex flex-wrap gap-2">
					{#each stats.topGenres as g}
						<span class="rounded-full bg-secondary px-3 py-1 text-xs">{g.name} ({g.count})</span>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
