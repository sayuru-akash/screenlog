import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
	if (!date) return '';
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

export function formatRuntime(minutes: number | null): string {
	if (!minutes) return '';
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}

export function getInitials(name: string | null | undefined): string {
	if (!name) return 'U';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function getPosterUrl(path: string | null | undefined, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return `https://image.tmdb.org/t/p/${size}${path}`;
}
