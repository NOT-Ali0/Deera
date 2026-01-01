/**
 * Formats a number as Iraqi Dinar (IQD)
 * @param {number|string} amount - The numeric price
 * @returns {string} Formatted price with commas
 */
export function formatNumber(amount) {
    if (!amount) return "0";
    const val = typeof amount === 'string' ? amount.replace(/[^0-9.]/g, '') : String(amount);
    const num = parseFloat(val);
    if (isNaN(num)) return String(amount);

    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Returns the currency symbol for Iraqi Dinar
 */
export const CURRENCY_SYMBOL = "د.ع";
export const CURRENCY_NAME = "دينار عراقي";
