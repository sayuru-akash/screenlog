<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<Toaster
	position="bottom-center"
	richColors
	closeButton
	duration={4000}
/>
{@render children()}
