export const CONFIG = {
    INVENTORY_SIZE: 20,
    ITEM_TYPES: {
        WEAPON: 'WEAPON',
        ARMOR: 'ARMOR',
        ACCESSORY: 'ACCESSORY'
    },
    EQUIPMENT_SLOTS: {
        MAIN_HAND: 'mainHand',
        OFF_HAND: 'offHand',
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'boots',  // Updated to match new slot
        GLOVES: 'gloves', // Added new slot
        AMULET: 'amulet', // Added new slot
        RING_LEFT: 'ringLeft', // Added new slot
        RING_RIGHT: 'ringRight' // Added new slot
    },
    RARITY_TYPES: {
        COMMON: { name: 'Common', color: '#ffffff', statMultiplier: 1.0, dropChance: 0.6 },
        MAGIC: { name: 'Magic', color: '#8888ff', statMultiplier: 1.25, dropChance: 0.3 },
        RARE: { name: 'Rare', color: '#ffff77', statMultiplier: 1.5, dropChance: 0.08 },
        UNIQUE: { name: 'Unique', color: '#af6025', statMultiplier: 1.8, dropChance: 0.02 }
    },
    ENEMY_TYPES: {
        NORMAL: { dropChanceMultiplier: 1.0, experienceMultiplier: 1.0 },
        ELITE: { dropChanceMultiplier: 2.0, experienceMultiplier: 2.5 },
        BOSS: { dropChanceMultiplier: 5.0, experienceMultiplier: 5.0 }
    }
};

export const INITIAL_STATE = {
    character: {
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        strength: 50,
        dexterity: 0,
        intelligence: 0,
        availablePoints: 1,
        damage: 0,
        health: 50,
        maxHealth: 50,
        lastAttackTime: 0,
        attackCooldown: 1000,
        inventory: {
            items: [],
            maxSize: CONFIG.INVENTORY_SIZE,
            equipped: {
                mainHand: null,
                offHand: null,
                head: null,
                chest: null,
                legs: null
            }
        }
    },
    currentZone: {
        id: 'zone_001',
        name: 'Forest Edge',
        level: 1,
        enemyLevelRange: [1, 3],
        enemyTypes: ['zombie', 'skeleton', 'slime']
    }
};
