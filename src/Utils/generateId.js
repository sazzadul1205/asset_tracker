/**
 * Generate a unique ID
 * @param {number} length - total length of the ID including prefix
 * @param {string} prefix - optional prefix (letters), will always stay at start
 * @param {Object} options - optional settings
 * @param {boolean} options.numbersOnly - if true, generate numbers only
 * @param {boolean} options.lowercase - include lowercase letters (only if numbersOnly is false)
 * @returns {string} unique ID
 */
export const generateId = (length = 6, prefix = "", options = {}) => {
  const { numbersOnly = false, lowercase = true } = options;

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = lowercase && !numbersOnly ? "abcdefghijklmnopqrstuvwxyz" : "";
  const digits = "0123456789";
  const chars = numbersOnly ? digits : upper + lower + digits;

  const randomLength = Math.max(length - prefix.length, 1);
  let randomPart = "";

  for (let i = 0; i < randomLength; i++) {
    const index = Math.floor(Math.random() * chars.length);
    randomPart += chars[index];
  }

  return `${prefix}${randomPart}`;
};