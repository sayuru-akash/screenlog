<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { AlertTriangle, Home, ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{$page.status || 'Error'} - Screenlog</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
		<AlertTriangle class="h-10 w-10 text-destructive" />
	</div>
	<h1 class="mb-2 text-6xl font-bold tracking-tight">{$page.status || 500}</h1>
	<p class="mb-8 max-w-md text-lg text-muted-foreground">
		{$page.error?.message || 'Something went wrong. Please try again later.'}
	</p>
	<div class="flex flex-col gap-3 sm:flex-row">
		<Button onclick={() => goto('/home')}>
			<Home class="mr-2 h-4 w-4" />
			Go Home
		</Button>
		<Button variant="secondary" onclick={() => history.back()}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Go Back
		</Button>
	</div>
</div>
