/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 * @throws {Error} If min is greater than max
 */
export function randomInt(min, max) {
    if (min > max) {
        throw new Error('Minimum value cannot be greater than maximum value');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select a random item from an object using weights
 * @param {Object.<string, number>} weightedObject - Object with values as weights
 * @returns {string} Selected key
 * @throws {Error} If weightedObject is empty or contains invalid weights
 */
export function weightedRandom(weightedObject) {
    if (!weightedObject || Object.keys(weightedObject).length === 0) {
        throw new Error('Weighted object cannot be empty');
    }

    // Convert object to array of [key, weight] pairs
    const entries = Object.entries(weightedObject);
    
    // Validate weights
    if (entries.some(([_, weight]) => typeof weight !== 'number' || weight < 0)) {
        throw new Error('All weights must be non-negative numbers');
    }
    
    // Calculate total weight
    const totalWeight = entries.reduce((total, [_, weight]) => total + weight, 0);
    
    if (totalWeight === 0) {
        throw new Error('Total weight cannot be zero');
    }
    
    // Generate random value between 0 and total weight
    const random = Math.random() * totalWeight;
    
    // Find the item based on the random value
    let weightSum = 0;
    for (const [key, weight] of entries) {
        weightSum += weight;
        if (random < weightSum) {
            return key;
        }
    }
    
    // Fallback to the last item
    return entries[entries.length - 1][0];
}