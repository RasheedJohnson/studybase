import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge class names with Tailwind conflict resolution for Reusables and foundation UI. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
