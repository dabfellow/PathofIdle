export const UNIQUE_ITEMS = {
    WANDERLUST: {
        id: 'wanderlust',
        name: "Wanderlust",
        baseType: 'LEATHER_BOOTS',
        level: 1,
        properties: {
            armor: 10,
            movementSpeed: 20,
            health: 15
        },
        flavor: "Never stop moving, never look back.",
        dropRate: 0.01
    },
    TABULA_RASA: {
        id: 'tabula_rasa',
        name: "Tabula Rasa",
        baseType: 'SIMPLE_ROBE',
        level: 1,
        properties: {
            blank: true, // Special property for this unique
            slots: 6
        },
        flavor: "A clean slate upon which to write your destiny.",
        dropRate: 0.005
    }
};

export function createUniqueItem(id) {
    const template = UNIQUE_ITEMS[id];
    if (!template) {
        throw new Error(`Invalid unique item id: ${id}`);
    }

    return {
        ...template,
        rarity: 'UNIQUE',
        type: 'unique',
        identified: false
    };
}
