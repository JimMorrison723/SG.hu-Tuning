/**
 * Format a Date object to a localized date-time string
 *
 * @param date - The Date object to format
 * @returns Formatted date string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString()
}

/**
 * Convert Unix timestamp (seconds) to formatted date string
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatUnixTimestamp(timestamp: number): string {
  return formatDateTime(new Date(timestamp * 1000))
}
