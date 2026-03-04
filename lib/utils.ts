
/**
 * Standardized duration formatting helper.
 * returns "~1 Week" or "~N Weeks"
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeeks(weeks: number): string {
  const rounded = Math.round(weeks);
  if (rounded <= 1) return "Est. ~1 Week";
  return `Est. ~${rounded} Weeks`;
}

/**
 * Standardized weeks to months conversion.
 * Uses 4.3 as the divisor to account for average month length.
 */
export function weeksToMonths(weeks: number): number {
  return Math.ceil(weeks / 4.3);
}
