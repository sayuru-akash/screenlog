<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Terms of Service - Screenlog</title>
	<meta name="description" content="Terms of Service for Screenlog." />
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-3xl px-4 py-12">
		<Button variant="ghost" class="mb-8" onclick={() => goto('/')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back
		</Button>
		<h1 class="mb-6 text-3xl font-bold">Terms of Service</h1>
		<div class="prose prose-sm max-w-none text-muted-foreground">
			<p class="mb-4">Last updated: May 2026</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
			<p class="mb-4">
				By accessing or using Screenlog, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">2. Use of the Service</h2>
			<p class="mb-4">
				Screenlog is a personal watch-tracking tool. You may use it to track TV shows, movies, and anime for your own personal, non-commercial use.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">3. User Accounts</h2>
			<p class="mb-4">
				You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">4. Content and Data</h2>
			<p class="mb-4">
				We do not claim ownership of your personal watchlist data. You grant us a limited license to store and process this data solely to provide the service.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">5. Termination</h2>
			<p class="mb-4">
				We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">6. Disclaimer</h2>
			<p class="mb-4">
				The service is provided "as is" without warranties of any kind. We do not guarantee accuracy of third-party metadata (e.g., from TMDB or TVmaze).
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">7. Changes to Terms</h2>
			<p class="mb-4">
				We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the revised terms.
			</p>
		</div>
	</div>
</div>
