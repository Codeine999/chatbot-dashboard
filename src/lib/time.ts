export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));

  if (diffSec < 60) return "just now";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}hr${diffHour === 1 ? "" : "s"} ago`;

  const diffDay = Math.round(diffHour / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}
