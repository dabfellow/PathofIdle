import { CONFIG } from '../constants.js';

// Item templates organized by item type
export const ItemData = {
    // WEAPONS
    [CONFIG.ITEM_TYPES.WEAPON]: [
        {
            name: "Rusty Sword",
            description: "A corroded blade that has seen better days.",
            icon: "🗡️",
            type: CONFIG.ITEM_TYPES.WEAPON,
            slot: CONFIG.EQUIPMENT_SLOTS.MAIN_HAND,
            stats: {
                damage: 5,
                attackSpeed: 1.0,
                critChance: 5
            },
            baseValue: 10
        },
        {
            name: "Wooden Wand",
            description: "A simple wand carved from oak.",
            icon: "🪄",
            type: CONFIG.ITEM_TYPES.WEAPON,
            slot: CONFIG.EQUIPMENT_SLOTS.MAIN_HAND,
            stats: {
                damage: 3,
                attackSpeed: 1.2,
                intelligence: 2
            },
            baseValue: 12
        },
        {
            name: "Hunter's Bow",
            description: "A flexible bow made from yew.",
            icon: "🏹",
            type: CONFIG.ITEM_TYPES.WEAPON,
            slot: CONFIG.EQUIPMENT_SLOTS.MAIN_HAND,
            stats: {
                damage: 4,
                attackSpeed: 1.3,
                dexterity: 2
            },
            baseValue: 15
        },
        {
            name: "Brutal Axe",
            description: "A heavy axe that deals massive damage.",
            icon: "🪓",
            type: CONFIG.ITEM_TYPES.WEAPON,
            slot: CONFIG.EQUIPMENT_SLOTS.MAIN_HAND,
            stats: {
                damage: 8,
                attackSpeed: 0.8,
                strength: 3
            },
            baseValue: 18
        },
        {
            name: "Spiked Shield",
            description: "A shield with a sharp spike for counter-attacks.",
            icon: "🛡️",
            type: CONFIG.ITEM_TYPES.WEAPON,
            slot: CONFIG.EQUIPMENT_SLOTS.OFF_HAND,
            stats: {
                damage: 2,
                defense: 5,
                blockChance: 10
            },
            baseValue: 15
        }
    ],
    
    // ARMOR
    [CONFIG.ITEM_TYPES.ARMOR]: [
        {
            name: "Leather Cap",
            description: "A basic leather cap offering minimal protection.",
            icon: "🧢",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.HEAD,
            stats: {
                defense: 3,
                dexterity: 1
            },
            baseValue: 8
        },
        {
            name: "Steel Helmet",
            description: "A sturdy metal helmet.",
            icon: "⛑️",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.HEAD,
            stats: {
                defense: 5,
                strength: 1
            },
            baseValue: 12
        },
        {
            name: "Cloth Robe",
            description: "A simple cloth robe favored by spellcasters.",
            icon: "👘",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.CHEST,
            stats: {
                defense: 2,
                intelligence: 2
            },
            baseValue: 10
        },
        {
            name: "Leather Armor",
            description: "Flexible armor made from treated leather.",
            icon: "🥋",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.CHEST,
            stats: {
                defense: 4,
                dexterity: 1
            },
            baseValue: 15
        },
        {
            name: "Chain Mail",
            description: "Interlocking metal rings provide good protection.",
            icon: "🧥",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.CHEST,
            stats: {
                defense: 6,
                strength: 1
            },
            baseValue: 20
        },
        {
            name: "Leather Pants",
            description: "Sturdy pants made of hardened leather.",
            icon: "👖",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.LEGS,
            stats: {
                defense: 3,
                dexterity: 1
            },
            baseValue: 12
        },
        {
            name: "Plated Greaves",
            description: "Heavy metal leg protection.",
            icon: "👢",
            type: CONFIG.ITEM_TYPES.ARMOR,
            slot: CONFIG.EQUIPMENT_SLOTS.LEGS,
            stats: {
                defense: 5,
                strength: 1
            },
            baseValue: 18
        }
    ],
    
    // ACCESSORIES
    [CONFIG.ITEM_TYPES.ACCESSORY]: [
        {
            name: "Lucky Coin",
            description: "A coin that brings good fortune to its owner.",
            icon: "🪙",
            type: CONFIG.ITEM_TYPES.ACCESSORY,
            slot: CONFIG.EQUIPMENT_SLOTS.ACCESSORY,
            stats: {
                critChance: 2,
                dropRateBonus: 5
            },
            baseValue: 25
        },
        {
            name: "Warrior's Emblem",
            description: "An emblem that enhances physical prowess.",
            icon: "🏅",
            type: CONFIG.ITEM_TYPES.ACCESSORY,
            slot: CONFIG.EQUIPMENT_SLOTS.ACCESSORY,
            stats: {
                strength: 3,
                damage: 2
            },
            baseValue: 30
        },
        {
            name: "Warrior's Emblem",
            description: "An emblem that enhances physical prowess.",
            icon: "🏅",
            type: CONFIG.ITEM_TYPES.ACCESSORY,
            slot: CONFIG.EQUIPMENT_SLOTS.ACCESSORY,
            stats: {
                strength: 3,
                damage: 2
            },
            baseValue: 30
        },
        {
            name: "Wizard's Orb",
            description: "A mystical orb that amplifies magical abilities.",
            icon: "🔮",
            type: CONFIG.ITEM_TYPES.ACCESSORY,
            slot: CONFIG.EQUIPMENT_SLOTS.ACCESSORY,
            stats: {
                intelligence: 3,
                manaRegen: 5
            },
            baseValue: 30
        }
    ]
};