<script lang="ts">
	import { cn, getPosterUrl } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { Plus, Check } from 'lucide-svelte';

	let {
		posterPath,
		title,
		year,
		type,
		genres = [],
		added = false,
		 onAdd,
		 onClick,
		class: className = ''
	}: {
		posterPath: string | null;
		title: string;
		year: string | null;
		type: 'show' | 'movie';
		genres?: string[];
		added?: boolean;
		 onAdd?: () => void;
		 onClick?: () => void;
		class?: string;
	} = $props();
</script>

<div class={cn('group relative flex flex-col gap-2', className)}>
	<button class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted" onclick={onClick}>
		{#if posterPath}
			<img
				src={getPosterUrl(posterPath, 'w342')}
				alt={title}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
				No poster
			</div>
		{/if}
		{#if onAdd}
			<div class="absolute right-2 top-2">
				<Button
					size="icon"
					variant={added ? 'default' : 'secondary'}
					class="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
					onclick={(e: MouseEvent) => { e.stopPropagation(); onAdd(); }}
				>
					{#if added}
						<Check class="h-4 w-4" />
					{:else}
						<Plus class="h-4 w-4" />
					{/if}
				</Button>
			</div>
		{/if}
	</button>
	<div class="space-y-0.5">
		<p class="truncate text-sm font-medium leading-tight">{title}</p>
		<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
			{#if year}<span>{year}</span>{/if}
			<span class="rounded bg-secondary px-1 py-0.5 text-[10px] uppercase">{type}</span>
		</div>
	</div>
</div>
