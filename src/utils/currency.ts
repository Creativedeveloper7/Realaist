/**
 * Currency formatting utilities for KES (Kenyan Shillings)
 */

/**
 * Format a number as KES currency
 * @param amount - Amount in KES (not cents)
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string (e.g., "KES 1,000")
 */
export function formatKES(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format a number as KES without currency symbol (just number with commas)
 * @param amount - Amount in KES
 * @returns Formatted number string (e.g., "1,000")
 */
export function formatKESNumber(amount: number): string {
  return new Intl.NumberFormat('en-KE').format(amount);
}

/**
 * Get KES currency symbol
 */
export function getKESSymbol(): string {
  return 'KES';
}

/**
 * Minimum campaign budget in KES
 */
export const MIN_CAMPAIGN_BUDGET = 1000; // 1000 KES minimum

