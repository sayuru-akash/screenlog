<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Privacy Policy - Screenlog</title>
	<meta name="description" content="Privacy Policy for Screenlog." />
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-3xl px-4 py-12">
		<Button variant="ghost" class="mb-8" onclick={() => goto('/')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back
		</Button>
		<h1 class="mb-6 text-3xl font-bold">Privacy Policy</h1>
		<div class="prose prose-sm max-w-none text-muted-foreground">
			<p class="mb-4">Last updated: May 2026</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">1. Information We Collect</h2>
			<p class="mb-4">
				We collect your email address and name for authentication purposes. We also store your watchlist data, episode progress, and preferences to provide the tracking service.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
			<p class="mb-4">
				Your data is used solely to operate Screenlog: displaying your watchlist, tracking progress, and showing upcoming episodes. We do not use your data for advertising.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">3. Third-Party Services</h2>
			<p class="mb-4">
				We fetch metadata from The Movie Database (TMDB) and TVmaze. Your searches and lookups are sent to these services via our servers; your IP is not directly exposed to them.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">4. Data Storage</h2>
			<p class="mb-4">
				Your data is stored in a secure PostgreSQL database. We use industry-standard practices to protect your information.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">5. Cookies</h2>
			<p class="mb-4">
				We use session cookies to keep you logged in. We also store your theme preference locally in your browser.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">6. Your Rights</h2>
			<p class="mb-4">
				You may request deletion of your account and associated data at any time by contacting us.
			</p>
			<h2 class="mb-2 mt-6 text-lg font-semibold text-foreground">7. Changes to This Policy</h2>
			<p class="mb-4">
				We may update this privacy policy occasionally. We will notify you of significant changes via email or through the application.
			</p>
		</div>
	</div>
</div>
