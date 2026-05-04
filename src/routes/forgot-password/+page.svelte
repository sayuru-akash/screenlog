<script lang="ts">
	import { Button, Input, Label } from '$lib/components/ui';
	import { toast } from 'svelte-sonner';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		// Placeholder: Better Auth forgot password flow can be wired here
		await new Promise((r) => setTimeout(r, 800));
		sent = true;
		loading = false;
		toast.success('Reset link sent');
	}
</script>

<svelte:head>
	<title>Forgot Password - Screenlog</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-bold">Reset password</h1>
			<p class="text-sm text-muted-foreground mt-1">We'll send you a reset link</p>
		</div>

		{#if sent}
			<div class="rounded-lg bg-secondary p-4 text-center text-sm">
				If an account exists for {email}, you'll receive a reset link shortly.
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="you@example.com" bind:value={email} required />
				</div>
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Sending...' : 'Send Reset Link'}
				</Button>
			</form>
		{/if}

		<div class="text-center text-sm">
			<a href="/signin" class="text-primary hover:underline">Back to sign in</a>
		</div>
	</div>
</div>
