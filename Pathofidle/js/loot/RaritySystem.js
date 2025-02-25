export const RARITY = {
    NORMAL: {
        id: 'normal',
        name: 'Normal',
        color: '#c8c8c8',
        dropChance: 1,
        maxAffixes: 0,
        border: '1px solid #c8c8c8',
        glow: 'none'
    },
    MAGIC: {
        id: 'magic',
        name: 'Magic',
        color: '#8888ff',
        dropChance: 0.3,
        maxAffixes: 2,
        border: '1px solid #8888ff',
        glow: '0 0 5px rgba(136, 136, 255, 0.3)'
    },
    RARE: {
        id: 'rare',
        name: 'Rare',
        color: '#ffff77',
        dropChance: 0.1,
        maxAffixes: 6,
        border: '1px solid #ffff77',
        glow: '0 0 5px rgba(255, 255, 119, 0.3)'
    },
    UNIQUE: {
        id: 'unique',
        name: 'Unique',
        color: '#af6025',
        dropChance: 0.02,
        maxAffixes: 0, // Uniques have fixed properties
        border: '1px solid #af6025',
        glow: '0 0 5px rgba(175, 96, 37, 0.3)'
    }
};

export function getRarityClass(rarity) {
    if (!RARITY[rarity]) {
        console.error(`Rarity "${rarity}" not found in RARITY object.`);
        return null;
    }
    return RARITY[rarity].id;
}

export function calculateRarityChances(playerLuck = 1) {
    const chances = new Map();
    let remainingChance = 1;

    Object.entries(RARITY).reverse().forEach(([key, data]) => {
        const chance = Math.min(remainingChance, data.dropChance * playerLuck);
        chances.set(key, chance);
        remainingChance -= chance;
    });

    if (remainingChance < 0) {
        console.error('Remaining chance is less than 0. There might be an error in the calculation.');
    }

    return chances;
}
