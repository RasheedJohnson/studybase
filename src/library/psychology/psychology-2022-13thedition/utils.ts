import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge class names; later classes win when Tailwind utilities conflict. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
