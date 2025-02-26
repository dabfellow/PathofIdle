/**
 * Calculate damage based on character stats
 * @param {Object} character - The character object
 * @returns {number} - Calculated damage
 */
export function calculateDamage(character) {
    // Base damage calculation
    let damage = 5 + Math.floor(character.strength / 10);
    
    // Include equipped weapon damage
    if (character.inventory?.equipped?.mainHand?.stats?.damage) {
        damage += character.inventory.equipped.mainHand.stats.damage;
    }
    
    return damage;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select a random item from an object using weights
 * @param {Object} weightedObject - Object with values as weights
 * @returns {string} Selected key
 */
export function weightedRandom(weightedObject) {
    // Convert object to array of [key, weight] pairs
    const entries = Object.entries(weightedObject);
    
    // Calculate total weight
    const totalWeight = entries.reduce((total, [_, weight]) => total + weight, 0);
    
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
    
    // Fallback to the last item if something goes wrong
    return entries[entries.length - 1][0];
}

/**
 * Calculate health based on character stats
 * @param {Object} character - The character object
 * @returns {number} - Calculated maximum health
 */
export function calculateHealth(character) {
    // Base health calculation
    let health = 50 + (character.level - 1) * 10;
    
    // Add strength bonus
    health += character.strength * 2;
    
    // Add armor bonus if equipped
    const armorSlots = ['head', 'chest', 'legs'];
    if (character.inventory && character.inventory.equipped) {
        armorSlots.forEach(slot => {
            if (character.inventory.equipped[slot]) {
                health += character.inventory.equipped[slot].health || 0;
            }
        });
    }
    
    return Math.floor(health);
}

/**
 * Update all derived character stats
 * @param {Object} character - The character object
 * @returns {boolean} - Success indicator
 */
export function updateStats(character) {
    character.damage = calculateDamage(character);
    character.maxHealth = calculateHealth(character);
    character.health = Math.min(character.health, character.maxHealth);
    character.strength = Math.floor(character.strength);
    character.dexterity = Math.floor(character.dexterity);
    character.intelligence = Math.floor(character.intelligence);
    character.experienceToNextLevel = Math.floor(character.experienceToNextLevel);
    return true;
}