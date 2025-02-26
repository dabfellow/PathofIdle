import { CONFIG } from '../config/constants.js';

/**
 * Updates character stats based on base stats, equipment and other modifiers
 * @param {Object} character - The character object
 */
export function updateStats(character) {
    // First, initialize a fresh stats object
    character.stats = {
        strength: character.baseStrength || 0,
        dexterity: character.baseDexterity || 0,
        intelligence: character.baseIntelligence || 0,
        vitality: character.baseVitality || 0,
        luck: character.baseLuck || 0,
        damage: 0,
        defense: 0,
        critChance: 5, // Base 5% crit chance
        attackSpeed: 1.0
    };
    
    // Add stats from equipment
    if (character.inventory && character.inventory.equipped) {
        for (const [slot, item] of Object.entries(character.inventory.equipped)) {
            if (!item || !item.stats) continue;
            
            for (const [statName, statValue] of Object.entries(item.stats)) {
                // If stat already exists, add to it, otherwise create it
                if (character.stats.hasOwnProperty(statName)) {
                    character.stats[statName] += statValue;
                } else {
                    character.stats[statName] = statValue;
                }
            }
        }
    }
    
    // Calculate derived stats
    character.stats.minDamage = Math.floor(1 + character.stats.strength * 0.5);
    character.stats.maxDamage = Math.floor(character.stats.minDamage + character.stats.strength * 0.5);
    character.stats.defense = Math.floor(character.stats.vitality * 0.2);
    
    // Update health based on vitality
    character.maxHealth = calculateHealth(character);
    
    // Make sure health doesn't exceed max health
    if (character.health > character.maxHealth) {
        character.health = character.maxHealth;
    }
    
    return character.stats;
}

/**
 * Calculate character's max health based on vitality
 * @param {Object} character - The character object
 * @returns {number} - The calculated max health
 */
export function calculateHealth(character) {
    const baseHealth = 50;
    const vitalityMultiplier = 5;
    const levelMultiplier = 2;
    
    const vitalityBonus = character.stats.vitality * vitalityMultiplier;
    const levelBonus = (character.level - 1) * levelMultiplier;
    
    return Math.floor(baseHealth + vitalityBonus + levelBonus);
}

/**
 * Calculate enemy health based on level and base health
 * @param {number} level - Enemy level
 * @param {number} baseHealth - Base health value
 * @returns {number} - Calculated health value
 */
export function calculateEnemyHealth(level, baseHealth = 10) {
    const levelMultiplier = 1 + (level * 0.1);
    return Math.max(1, Math.round(baseHealth * levelMultiplier));
}

/**
 * Calculate experience needed for next level
 * @param {number} level - Current level
 * @returns {number} - Experience needed
 */
export function calculateExpForNextLevel(level) {
    return Math.floor(100 * Math.pow(1.1, level - 1));
}

/**
 * Format a number with appropriate suffix (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Calculate equipment stat bonuses
 */
export function calculateEquipmentBonuses(character) {
    const bonuses = {
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        vitality: 0,
        luck: 0
    };

    if (!character.inventory || !character.inventory.equipped) {
        return bonuses;
    }

    // Loop through equipped items and add their stats
    Object.values(character.inventory.equipped).forEach(item => {
        if (!item || !item.stats) return;

        if (item.stats.strength) bonuses.strength += item.stats.strength;
        if (item.stats.dexterity) bonuses.dexterity += item.stats.dexterity;
        if (item.stats.intelligence) bonuses.intelligence += item.stats.intelligence;
        if (item.stats.vitality) bonuses.vitality += item.stats.vitality;
        if (item.stats.luck) bonuses.luck += item.stats.luck;
    });

    return bonuses;
}

/**
 * Calculates damage based on character stats
 */
export function calculateDamage(attacker, defender) {
    // Default values if stats are missing
    const minDamage = attacker.stats?.damageMin || 1;
    const maxDamage = attacker.stats?.damageMax || 3;
    
    // Calculate base damage
    const baseDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    
    // Critical hit calculation
    const critChance = attacker.stats?.critChance || 5;  // 5% base crit chance
    const isCritical = Math.random() * 100 < critChance;
    
    // Critical damage multiplier (default 150%)
    const critMultiplier = attacker.stats?.critMultiplier || 150;
    
    // Calculate raw damage
    let damage = baseDamage;
    if (isCritical) {
        damage = Math.floor(damage * (critMultiplier / 100));
    }
    
    // Damage mitigation (armor/resistance calculations would go here)
    // For now, a simple calculation for demonstration
    const mitigation = defender?.defense || 0;
    const mitigated = Math.max(1, damage - mitigation);
    
    return {
        raw: damage,
        mitigated: mitigated,
        critical: isCritical
    };
}

/**
 * Rounds a number to a specified number of decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded value
 */
export function round(value, decimals = 2) {
    const multiplier = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}
