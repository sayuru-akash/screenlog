import { writable } from 'svelte/store';

export const userTimezone = writable<string>('Asia/Colombo');
