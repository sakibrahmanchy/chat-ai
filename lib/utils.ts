import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTimeString(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = date.getTime() - new Date().getTime();
  const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));
  const diffInHours = Math.round(diff / (1000 * 60 * 60));
  const diffInMinutes = Math.round(diff / (1000 * 60));

  if (Math.abs(diffInDays) >= 1) {
    return formatter.format(diffInDays, 'day');
  } else if (Math.abs(diffInHours) >= 1) {
    return formatter.format(diffInHours, 'hour');
  } else if (Math.abs(diffInMinutes) >= 1) {
    return formatter.format(diffInMinutes, 'minute');
  } else {
    return 'just now';
  }
}
