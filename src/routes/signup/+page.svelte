<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input, Label } from '$lib/components/ui';
	import { toast } from 'svelte-sonner';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	function detectTimezone(): string {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		} catch {
			return 'Asia/Colombo';
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/sign-up/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Could not create account');
			}

			// Save detected timezone after successful signup
			try {
				const timezone = detectTimezone();
				await fetch('/api/settings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ timezone })
				});
			} catch {
				// Non-critical: timezone can be set later in settings
			}

			toast.success('Account created');
			goto('/home');
		} catch (err: any) {
			error = err.message || 'Something went wrong';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - Screenlog</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-bold">Create your account</h1>
			<p class="text-sm text-muted-foreground mt-1">Start tracking what you watch</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" type="text" placeholder="Your name" bind:value={name} required />
			</div>
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" placeholder="you@example.com" bind:value={email} required />
			</div>
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" placeholder="Create a password" bind:value={password} required minlength={8} />
			</div>

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Creating account...' : 'Sign Up'}
			</Button>
		</form>

		<div class="text-center text-sm text-muted-foreground">
			Already have an account? <a href="/signin" class="text-primary hover:underline">Sign in</a>
		</div>
	</div>
</div>
