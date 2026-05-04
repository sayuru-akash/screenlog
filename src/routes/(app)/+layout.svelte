<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Home, Search, CalendarDays, Compass, User, LogOut, Settings, Sun, Moon, Monitor } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import { userTimezone } from '$lib/stores/preferences';
	import { cn, getInitials } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { toast } from 'svelte-sonner';

	let { children, data } = $props();
	let mobileMenuOpen = $state(false);

	const navItems = [
		{ href: '/home', label: 'Home', icon: Home },
		{ href: '/search', label: 'Search', icon: Search },
		{ href: '/calendar', label: 'Calendar', icon: CalendarDays },
		{ href: '/discover', label: 'Discover', icon: Compass },
		{ href: '/profile', label: 'Profile', icon: User }
	];

	// Initialize timezone from server preferences
	$effect(() => {
		if (data.preferences?.timezone) {
			userTimezone.set(data.preferences.timezone);
		}
	});

	async function signOut() {
		try {
			await fetch('/api/auth/sign-out', { method: 'POST' });
			goto('/');
		} catch {
			toast.error('Failed to sign out');
		}
	}

	function closeThemeDropdown(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.theme-dropdown')) mobileMenuOpen = false;
	}

	const user = $derived($page.data.user);
</script>

<svelte:window onclick={closeThemeDropdown} />

<div class="min-h-screen bg-background pb-20 md:pb-0">
	<!-- Desktop top nav -->
	<header class="hidden md:flex items-center justify-between border-b border-border px-6 py-3">
		<a href="/home" class="text-xl font-bold tracking-tight">Screenlog</a>
		<nav class="flex items-center gap-1">
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
						$page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + '/')
							? 'bg-primary/10 text-primary'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					<item.icon class="h-4 w-4" />
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="flex items-center gap-2">
			<div class="relative theme-dropdown">
				<Button variant="ghost" size="icon" onclick={() => mobileMenuOpen = !mobileMenuOpen}>
					{#if $theme === 'dark'}
						<Moon class="h-4 w-4" />
					{:else if $theme === 'light'}
						<Sun class="h-4 w-4" />
					{:else}
						<Monitor class="h-4 w-4" />
					{/if}
				</Button>
				{#if mobileMenuOpen}
					<div class="absolute right-0 top-full mt-2 w-40 rounded-md border border-border bg-popover shadow-lg z-50">
						<button class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent" onclick={() => { theme.set('light'); mobileMenuOpen = false; }}>
							<Sun class="h-4 w-4" /> Light
						</button>
						<button class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent" onclick={() => { theme.set('dark'); mobileMenuOpen = false; }}>
							<Moon class="h-4 w-4" /> Dark
						</button>
						<button class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent" onclick={() => { theme.set('system'); mobileMenuOpen = false; }}>
							<Monitor class="h-4 w-4" /> System
						</button>
					</div>
				{/if}
			</div>
			<a href="/settings" class="rounded-md p-2 text-muted-foreground hover:text-foreground">
				<Settings class="h-4 w-4" />
			</a>
			<button onclick={signOut} class="rounded-md p-2 text-muted-foreground hover:text-foreground">
				<LogOut class="h-4 w-4" />
			</button>
			{#if user}
				<a href="/profile" class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
					{getInitials(user.name || user.email)}
				</a>
			{/if}
		</div>
	</header>

	<!-- Mobile header -->
	<header class="flex md:hidden items-center justify-between border-b border-border px-4 py-3">
		<a href="/home" class="text-lg font-bold tracking-tight">Screenlog</a>
		<div class="flex items-center gap-2">
			<a href="/settings" class="rounded-md p-2 text-muted-foreground hover:text-foreground">
				<Settings class="h-4 w-4" />
			</a>
			{#if user}
				<a href="/profile" class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
					{getInitials(user.name || user.email)}
				</a>
			{/if}
		</div>
	</header>

	<!-- Page content -->
	<main class="mx-auto max-w-6xl px-4 py-6">
		{@render children()}
	</main>

	<!-- Mobile bottom nav -->
	<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur md:hidden">
		<div class="flex items-center justify-around py-2">
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
						$page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + '/')
							? 'text-primary'
							: 'text-muted-foreground'
					)}
				>
					<item.icon class="h-5 w-5" />
					{item.label}
				</a>
			{/each}
		</div>
	</nav>
</div>
