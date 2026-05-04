<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { Film, Tv, Calendar, TrendingUp } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Screenlog - Track What You Watch</title>
	<meta name="description" content="A modern watch tracker for TV shows, movies, and anime." />
</svelte:head>

<div class="min-h-screen bg-background">
	<section class="relative overflow-hidden px-4 pt-16 pb-20 md:pt-24 md:pb-32">
		<div class="mx-auto max-w-4xl text-center">
			<div class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
				<span>Now in beta</span>
			</div>
			<h1 class="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
				Track everything
				<span class="text-primary">you watch</span>
			</h1>
			<p class="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
				Screenlog helps you organise your watchlist, track episode progress, and never lose track of what to watch next.
			</p>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button size="lg" class="min-w-[180px]" onclick={() => goto('/signup')}>
					Start Tracking
				</Button>
				<Button size="lg" variant="secondary" class="min-w-[180px]" onclick={() => goto('/signin')}>
					Sign In
				</Button>
			</div>
		</div>
	</section>

	<section class="px-4 py-16 md:py-24">
		<div class="mx-auto max-w-6xl">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-xl bg-card p-6 border border-border">
					<Tv class="mb-4 h-8 w-8 text-primary" />
					<h3 class="mb-2 font-semibold">Track Shows</h3>
					<p class="text-sm text-muted-foreground">Follow episode progress for every series you watch.</p>
				</div>
				<div class="rounded-xl bg-card p-6 border border-border">
					<Film class="mb-4 h-8 w-8 text-primary" />
					<h3 class="mb-2 font-semibold">Log Movies</h3>
					<p class="text-sm text-muted-foreground">Keep a record of every film you've seen.</p>
				</div>
				<div class="rounded-xl bg-card p-6 border border-border">
					<Calendar class="mb-4 h-8 w-8 text-primary" />
					<h3 class="mb-2 font-semibold">Upcoming</h3>
					<p class="text-sm text-muted-foreground">See when new episodes air for your tracked shows.</p>
				</div>
				<div class="rounded-xl bg-card p-6 border border-border">
					<TrendingUp class="mb-4 h-8 w-8 text-primary" />
					<h3 class="mb-2 font-semibold">Discover</h3>
					<p class="text-sm text-muted-foreground">Find trending and popular content to add next.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="px-4 py-16 md:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="mb-4 text-3xl font-bold md:text-4xl">Ready to get started?</h2>
			<p class="mb-8 text-muted-foreground">Join Screenlog and take control of your watchlist today.</p>
			<Button size="lg" class="min-w-[200px]" onclick={() => goto('/signup')}>Create Free Account</Button>
		</div>
	</section>

	<footer class="border-t border-border px-4 py-8">
		<div class="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-muted-foreground">
			<p>&copy; Screenlog. All rights reserved.</p>
			<div class="flex items-center gap-6">
				<a href="/terms" class="hover:text-foreground transition-colors">Terms</a>
				<a href="/privacy" class="hover:text-foreground transition-colors">Privacy</a>
			</div>
		</div>
	</footer>
</div>
