<script lang="ts">
	import { cn } from '$lib/utils';

	let { status, class: className = '' }: { status: string; class?: string } = $props();

	const colors: Record<string, string> = {
		PLAN_TO_WATCH: 'bg-muted text-muted-foreground',
		WATCHING: 'bg-primary/10 text-primary',
		CAUGHT_UP: 'bg-green-500/10 text-green-500',
		COMPLETED: 'bg-blue-500/10 text-blue-500',
		PAUSED: 'bg-yellow-500/10 text-yellow-500',
		DROPPED: 'bg-destructive/10 text-destructive',
		WATCHED: 'bg-green-500/10 text-green-500',
		FAVOURITE: 'bg-primary/10 text-primary'
	};

	const labels: Record<string, string> = {
		PLAN_TO_WATCH: 'Plan to Watch',
		WATCHING: 'Watching',
		CAUGHT_UP: 'Caught Up',
		COMPLETED: 'Completed',
		PAUSED: 'Paused',
		DROPPED: 'Dropped',
		WATCHED: 'Watched',
		FAVOURITE: 'Favourite'
	};
</script>

<span class={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors[status] || 'bg-muted text-muted-foreground', className)}>
	{labels[status] || status}
</span>
