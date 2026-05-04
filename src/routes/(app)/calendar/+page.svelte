<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Skeleton } from '$lib/components/ui';
	import { EmptyState } from '$lib/components/custom';
	import { getPosterUrl, formatDate } from '$lib/utils';
	import { CalendarDays } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let loading = $state(true);
	let groups: Record<string, any[]> = $state({});

	onMount(async () => {
		try {
			const res = await fetch('/api/calendar');
			const data = await res.json();
			groups = data.groups || {};
		} catch {
			toast.error('Failed to load calendar');
		} finally {
			loading = false;
		}
	});

	const groupOrder = [
		{ key: 'today', label: 'Today' },
		{ key: 'tomorrow', label: 'Tomorrow' },
		{ key: 'thisWeek', label: 'This Week' },
		{ key: 'nextWeek', label: 'Next Week' },
		{ key: 'later', label: 'Later' }
	];

	const hasAny = $derived(groupOrder.some((g) => groups[g.key]?.length > 0));
</script>

<svelte:head>
	<title>Calendar - Screenlog</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold">Upcoming</h1>

	{#if loading}
		<div class="space-y-4">
			{#each Array(4) as _}
				<Skeleton class="h-20 w-full rounded-lg" />
			{/each}
		</div>
	{:else if !hasAny}
		<EmptyState
			icon={CalendarDays}
			title="No upcoming episodes"
			description="Add currently airing shows to your watchlist to see what's coming."
			actionLabel="Discover Shows"
			actionHref="/discover"
		/>
	{:else}
		{#each groupOrder as g}
			{#if groups[g.key]?.length > 0}
				<section>
					<h2 class="mb-3 text-lg font-semibold text-primary">{g.label}</h2>
					<div class="space-y-3">
						{#each groups[g.key] as item (item.id)}
							<button
								class="flex w-full items-center gap-4 rounded-xl bg-card p-3 text-left border border-border hover:bg-accent/50 transition-colors"
								onclick={() => goto(`/show/${item.showId}`)}
							>
								<img
									src={getPosterUrl(item.posterPath, 'w92')}
									alt={item.showTitle}
									class="h-16 w-11 shrink-0 rounded-md object-cover"
								/>
								<div class="min-w-0 flex-1">
									<p class="truncate font-medium">{item.showTitle}</p>
									<p class="text-sm text-muted-foreground">
										S{item.seasonNumber}E{item.episodeNumber} · {item.episodeTitle}
									</p>
									<p class="text-xs text-muted-foreground">{formatDate(item.airDate)}</p>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	{/if}
</div>
