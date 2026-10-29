/**
 * UGX Currency & Number Formatting Utilities
 */

/**
 * Format a number as Ugandan Shillings.
 * @param {number} amount
 * @returns {string} e.g. "UGX 90,000"
 */
export function formatUGX(amount) {
  if (amount == null || isNaN(amount)) return 'UGX 0';
  return `UGX ${Number(amount).toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
}

/**
 * Format a number with thousands separators.
 * @param {number} n
 * @param {number} [decimals=0]
 * @returns {string} e.g. "1,234"
 */
export function formatNumber(n, decimals = 0) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-UG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
