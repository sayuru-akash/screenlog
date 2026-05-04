<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon,
		title,
		description,
		actionLabel,
		actionHref,
		secondaryActionLabel,
		secondaryActionHref
	}: {
		icon?: any;
		title: string;
		description: string;
		actionLabel?: string;
		actionHref?: string;
		secondaryActionLabel?: string;
		secondaryActionHref?: string;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
	{#if Icon}
		<div class="mb-4 rounded-full bg-secondary p-4">
			<Icon class="h-6 w-6 text-muted-foreground" />
		</div>
	{/if}
	<h3 class="text-lg font-semibold">{title}</h3>
	<p class="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
	<div class="mt-6 flex items-center gap-3">
		{#if actionLabel && actionHref}
			<a href={actionHref} class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
				{actionLabel}
			</a>
		{/if}
		{#if secondaryActionLabel && secondaryActionHref}
			<a href={secondaryActionHref} class="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
				{secondaryActionLabel}
			</a>
		{/if}
	</div>
</div>
