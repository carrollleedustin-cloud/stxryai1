export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function generateCacheKey(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}
