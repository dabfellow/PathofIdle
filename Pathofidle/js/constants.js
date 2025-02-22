export const CONFIG = {
    INVENTORY_SIZE: 20,
    ITEM_TYPES: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        ACCESSORY: 'accessory'
    },
    EQUIPMENT_SLOTS: {
        MAIN_HAND: 'mainHand',
        OFF_HAND: 'offHand',
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'legs'
    },
    RARITY_TYPES: {
        COMMON: { name: 'Common', color: '#ffffff', statMultiplier: 1.0, dropWeight: 100 },
        UNCOMMON: { name: 'Uncommon', color: '#2ecc71', statMultiplier: 1.2, dropWeight: 60 },
        RARE: { name: 'Rare', color: '#3498db', statMultiplier: 1.5, dropWeight: 30 },
        EPIC: { name: 'Epic', color: '#9b59b6', statMultiplier: 2.0, dropWeight: 10 }
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
    }
};
