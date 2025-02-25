import { ItemData } from '../Data/js_data_ItemData.js';
import { CONFIG } from '../constants.js';

export const ITEM_SLOTS = {
    WEAPON: 'mainHand',
    OFFHAND: 'offHand',
    HEAD: 'head',
    CHEST: 'chest',
    LEGS: 'legs'
};

export const BASE_ITEMS = {
    // Weapons
    DAGGER: {
        name: 'Dagger',
        type: 'weapon',
        slot: ITEM_SLOTS.WEAPON,
        damage: [2, 5],
        speed: 1.5,
        level: 1,
        tags: ['dagger', 'onehand', 'weapon']
    },
    SWORD: {
        name: 'Sword',
        type: 'weapon',
        slot: ITEM_SLOTS.WEAPON,
        damage: [3, 7],
        speed: 1.0,
        level: 1,
        tags: ['sword', 'onehand', 'weapon']
    },
    
    // Armor
    LEATHER_CAP: {
        name: 'Leather Cap',
        type: 'armor',
        slot: ITEM_SLOTS.HEAD,
        armor: 3,
        level: 1,
        tags: ['helmet', 'armor', 'light']
    },
    LEATHER_VEST: {
        name: 'Leather Vest',
        type: 'armor',
        slot: ITEM_SLOTS.CHEST,
        armor: 5,
        level: 1,
        tags: ['chest', 'armor', 'light']
    }
};

export function getBaseItem(type, level) {
    const items = ItemData[type];
    if (!items) return null;

    // Filter items by level requirement if needed
    const availableItems = items.filter(item => !item.levelReq || item.levelReq <= level);
    if (availableItems.length === 0) return null;

    // Random selection from available items
    return { ...availableItems[Math.floor(Math.random() * availableItems.length)] };
}

export function getItemsForLevel(level) {
    const allItems = [];
    
    Object.values(CONFIG.ITEM_TYPES).forEach(type => {
        const typeItems = ItemData[type];
        if (typeItems) {
            const availableItems = typeItems.filter(item => 
                !item.levelReq || item.levelReq <= level
            );
            allItems.push(...availableItems);
        }
    });

    return allItems;
}
