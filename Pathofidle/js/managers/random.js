/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select an item from a weighted list
 * @param {Object} weights - Object with keys as items and values as weights
 * @returns {string} - The selected key
 */
export function weightedRandom(weights) {
    // Calculate the sum of all weights
    let totalWeight = 0;
    for (const weight of Object.values(weights)) {
        totalWeight += weight;
    }

    // Generate a random number between 0 and totalWeight
    const random = Math.random() * totalWeight;
    
    // Find the item that corresponds to the random number
    let currentWeight = 0;
    for (const [item, weight] of Object.entries(weights)) {
        currentWeight += weight;
        if (random <= currentWeight) {
            return item;
        }
    }
    
    // Fallback to just return the first key
    return Object.keys(weights)[0];
}

/**
 * Get a random element from an array
 * @param {Array} array - The array to select from
 * @returns {*} - A random element from the array
 */
export function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random chance roll (0-100)
 * @param {number} chance - Percent chance of success (0-100)
 * @returns {boolean} - Whether the chance roll succeeded
 */
export function chance(percent) {
    return Math.random() * 100 < percent;
}
