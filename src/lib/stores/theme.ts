import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'system' | 'dark' | 'light';

function createThemeStore() {
	const getInitial = (): Theme => {
		if (!browser) return 'system';
		return (localStorage.getItem('screenlog-theme') as Theme) || 'system';
	};

	const { subscribe, set } = writable<Theme>(getInitial());

	function applyTheme(theme: Theme) {
		if (!browser) return;
		const root = document.documentElement;
		const isDark =
			theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		if (isDark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		localStorage.setItem('screenlog-theme', theme);
	}

	return {
		subscribe,
		set: (theme: Theme) => {
			applyTheme(theme);
			set(theme);
		},
		init: () => {
			applyTheme(getInitial());
		}
	};
}

export const theme = createThemeStore();
