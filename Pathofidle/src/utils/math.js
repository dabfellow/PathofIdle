import { CONFIG } from '../config/constants.js';

/**
 * Updates all derived character stats based on base attributes,
 * equipment, and other modifiers.
 * @param {Object} character - The character object to update
 */
export function updateStats(character) {
    if (!character) {
        console.error('Invalid character object provided to updateStats');
        return;
    }

    // Initialize stats object if it doesn't exist
    if (!character.stats) {
        character.stats = {};
    }

    // Initialize base stats if they don't exist
    if (!character.baseStrength) character.baseStrength = 5;
    if (!character.baseDexterity) character.baseDexterity = 5;
    if (!character.baseIntelligence) character.baseIntelligence = 5;
    if (!character.baseVitality) character.baseVitality = 5;
    if (!character.baseLuck) character.baseLuck = 3;

    // Get equipment bonuses
    const equipmentBonuses = calculateEquipmentBonuses(character);

    // Calculate final stats
    character.stats.strength = Math.floor(character.baseStrength + (equipmentBonuses.strength || 0));
    character.stats.dexterity = Math.floor(character.baseDexterity + (equipmentBonuses.dexterity || 0));
    character.stats.intelligence = Math.floor(character.baseIntelligence + (equipmentBonuses.intelligence || 0));
    character.stats.vitality = Math.floor(character.baseVitality + (equipmentBonuses.vitality || 0));
    character.stats.luck = Math.floor(character.baseLuck + (equipmentBonuses.luck || 0));

    // Calculate derived stats
    character.stats.damageMin = Math.floor(1 + (character.stats.strength * 0.5));
    character.stats.damageMax = Math.floor(3 + (character.stats.strength * 1.0));
    character.stats.critChance = 5 + Math.floor(character.stats.luck * 0.5);
    character.stats.critMultiplier = 150 + Math.floor(character.stats.luck * 2);

    // Calculate health
    character.maxHealth = calculateHealth(character);

    // Add health if it's the first time
    if (!character.health) {
        character.health = character.maxHealth;
    }

    // Add debuggable trace of what we're returning
    console.log('Updated stats:', character.stats);
    
    return character.stats;
}

/**
 * Calculates character max health based on vitality and equipment
 */
export function calculateHealth(character) {
    if (!character) return 100;
    
    const baseHealth = 50;
    const vitalityMultiplier = 10;
    
    // Make sure character.stats exists and has vitality
    const vitality = (character.stats && character.stats.vitality) 
        ? character.stats.vitality 
        : (character.baseVitality || 5);
    
    return baseHealth + (vitality * vitalityMultiplier);
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
