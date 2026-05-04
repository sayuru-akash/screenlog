<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input, Label } from '$lib/components/ui';
	import { toast } from 'svelte-sonner';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/sign-in/email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Invalid email or password');
			}

			toast.success('Signed in successfully');
			goto('/home');
		} catch (err: any) {
			error = err.message || 'Something went wrong';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - Screenlog</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-bold">Welcome back</h1>
			<p class="text-sm text-muted-foreground mt-1">Sign in to your Screenlog account</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" placeholder="you@example.com" bind:value={email} required />
			</div>
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" placeholder="Enter your password" bind:value={password} required />
			</div>

			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>

		<div class="text-center text-sm">
			<a href="/forgot-password" class="text-primary hover:underline">Forgot password?</a>
		</div>

		<div class="text-center text-sm text-muted-foreground">
			Don't have an account? <a href="/signup" class="text-primary hover:underline">Sign up</a>
		</div>
	</div>
</div>
