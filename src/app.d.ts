// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			auth: import('better-auth').Auth;
			session: import('better-auth').Session | null;
			user: import('better-auth').User | null;
		}
		interface PageData {
			user?: import('better-auth').User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
