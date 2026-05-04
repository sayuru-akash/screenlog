import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null, timezone?: string): string {
	if (!date) return '';
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: timezone || 'UTC'
	});
}

export function formatDateTime(date: Date | string | null, timezone?: string): string {
	if (!date) return '';
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: timezone || 'UTC'
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

export function getAllTimezones(): string[] {
	try {
		// @ts-ignore
		return Intl.supportedValuesOf('timeZone');
	} catch {
		return [
			'Africa/Abidjan', 'Africa/Accra', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
			'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Chicago', 'America/Denver',
			'America/Lima', 'America/Los_Angeles', 'America/Mexico_City', 'America/New_York', 'America/Phoenix',
			'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver', 'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong',
			'Asia/Jakarta', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Manila', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore',
			'Asia/Taipei', 'Asia/Tokyo', 'Asia/Colombo', 'Australia/Brisbane', 'Australia/Melbourne', 'Australia/Perth',
			'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Athens', 'Europe/Berlin', 'Europe/Brussels', 'Europe/Budapest',
			'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Helsinki', 'Europe/Istanbul', 'Europe/Lisbon', 'Europe/London',
			'Europe/Madrid', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Prague', 'Europe/Rome',
			'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich', 'Pacific/Auckland', 'Pacific/Fiji',
			'Pacific/Honolulu'
		];
	}
}
