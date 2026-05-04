<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, Input, Label } from '$lib/components/ui';
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon, Monitor, Trash2, LogOut } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let region = $state('');
	let language = $state('');
	let saving = $state(false);
	let deleteConfirm = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings');
			const data = await res.json();
			if (data.preferences) {
				region = data.preferences.region || '';
				language = data.preferences.language || '';
			}
		} catch {}
	});

	async function saveSettings() {
		saving = true;
		try {
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ region, language })
			});
			toast.success('Settings saved');
		} catch {
			toast.error('Failed to save');
		} finally {
			saving = false;
		}
	}

	async function signOut() {
		await fetch('/api/auth/sign-out', { method: 'POST' });
		goto('/');
	}

	async function deleteAccount() {
		// Placeholder - would need proper implementation
		toast.info('Contact support to delete your account');
		deleteConfirm = false;
	}
</script>

<svelte:head>
	<title>Settings - Screenlog</title>
</svelte:head>

<div class="mx-auto max-w-xl space-y-8">
	<h1 class="text-2xl font-bold">Settings</h1>

	<!-- Theme -->
	<section class="rounded-xl bg-card p-5 border border-border space-y-4">
		<h2 class="font-semibold">Appearance</h2>
		<div class="flex gap-2">
			<Button
				variant={$theme === 'light' ? 'default' : 'secondary'}
				class="flex-1 gap-2"
				onclick={() => theme.set('light')}
			>
				<Sun class="h-4 w-4" /> Light
			</Button>
			<Button
				variant={$theme === 'dark' ? 'default' : 'secondary'}
				class="flex-1 gap-2"
				onclick={() => theme.set('dark')}
			>
				<Moon class="h-4 w-4" /> Dark
			</Button>
			<Button
				variant={$theme === 'system' ? 'default' : 'secondary'}
				class="flex-1 gap-2"
				onclick={() => theme.set('system')}
			>
				<Monitor class="h-4 w-4" /> System
			</Button>
		</div>
	</section>

	<!-- Region/Language -->
	<section class="rounded-xl bg-card p-5 border border-border space-y-4">
		<h2 class="font-semibold">Preferences</h2>
		<div class="space-y-3">
			<div class="space-y-2">
				<Label for="region">Region</Label>
				<Input id="region" bind:value={region} placeholder="e.g. US, UK" />
			</div>
			<div class="space-y-2">
				<Label for="language">Language</Label>
				<Input id="language" bind:value={language} placeholder="e.g. en" />
			</div>
		</div>
		<Button class="w-full" onclick={saveSettings} disabled={saving}>
			{saving ? 'Saving...' : 'Save Preferences'}
		</Button>
	</section>

	<!-- Account -->
	<section class="rounded-xl bg-card p-5 border border-border space-y-4">
		<h2 class="font-semibold">Account</h2>
		<Button variant="secondary" class="w-full gap-2" onclick={signOut}>
			<LogOut class="h-4 w-4" /> Sign Out
		</Button>
		{#if !deleteConfirm}
			<Button variant="destructive" class="w-full gap-2" onclick={() => deleteConfirm = true}>
				<Trash2 class="h-4 w-4" /> Delete Account
			</Button>
		{:else}
			<div class="space-y-2">
				<p class="text-sm text-destructive">This action cannot be undone.</p>
				<div class="flex gap-2">
					<Button variant="destructive" class="flex-1" onclick={deleteAccount}>Confirm Delete</Button>
					<Button variant="secondary" class="flex-1" onclick={() => deleteConfirm = false}>Cancel</Button>
				</div>
			</div>
		{/if}
	</section>
</div>
