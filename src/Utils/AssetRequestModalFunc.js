// Remove assigned assets from list

/**
 * Remove assigned assets from list
 * @param {Array} data - Array of asset objects
 * @returns {Array} Filtered assets
 */
export function RemoveAssigned(data) {
  return data.filter((item) => !item.assigned_to);
}

/**
 * Get all assets assigned to a specific email
 * @param {Array} data - Array of asset objects
 * @param {string} email - Email to filter by
 * @returns {Array} Filtered assets
 */
export function getAssetsByEmail(data, email) {
  if (!Array.isArray(data) || !email) return [];
  return data.filter(
    (asset) => asset.assigned_to?.toLowerCase() === email.toLowerCase()
  );
}
