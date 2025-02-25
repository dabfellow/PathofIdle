export const CURRENCY_TYPES = {
    IDENTIFY_SCROLL: {
        id: 'identify_scroll',
        name: 'Scroll of Identify',
        description: 'Reveals the properties of a magic, rare, or unique item',
        rarity: 'NORMAL',
        stackSize: 40,
        icon: '📜'
    },
    ENHANCEMENT_ORB: {
        id: 'enhancement_orb',
        name: 'Orb of Enhancement',
        description: 'Improves the quality of an item',
        rarity: 'MAGIC',
        stackSize: 20,
        icon: '🔮'
    },
    REFORGE_ORB: {
        id: 'reforge_orb',
        name: 'Orb of Reforging',
        description: 'Rerolls the properties of a rare item',
        rarity: 'RARE',
        stackSize: 10,
        icon: '⚡'
    }
};

export function createCurrencyItem(type) {
    if (!CURRENCY_TYPES[type]) {
        throw new Error(`Invalid currency type: ${type}`);
    }
    return {
        ...CURRENCY_TYPES[type],
        type: 'currency',
        stack: 1
    };
}
