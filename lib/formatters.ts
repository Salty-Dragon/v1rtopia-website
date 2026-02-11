// Data Formatting Utilities

/**
 * Format large numbers into compact notation (K for thousands, M for millions)
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format playtime in minutes to hours
 * @param minutes - Playtime in minutes
 * @returns Formatted string
 */
export function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}k hours`;
  }
  return `${hours}h`;
}

/**
 * Format ISO date string to readable date
 * @param isoString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format percentage with decimal places
 * @param num - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with % sign
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format number with commas for thousands
 * @param num - Number to format
 * @returns Formatted string with commas
 */
export function formatWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Create avatar initials from username
 * @param username - Player username
 * @returns 2-letter initials
 */
export function getAvatarInitials(username: string): string {
  const cleanName = username.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanName.length >= 2) {
    return cleanName.substring(0, 2).toUpperCase();
  }
  return cleanName.charAt(0).toUpperCase() + cleanName.charAt(0).toUpperCase();
}
