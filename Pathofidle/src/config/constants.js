export const CONFIG = {
    // Game Configuration
    GAME_TITLE: "Path of Idle",
    VERSION: "0.1.0",
    
    // Game Settings
    BASE_TICK_RATE: 60, // frames per second
    AUTOSAVE_INTERVAL: 60000, // milliseconds
    
    // Player Settings
    INITIAL_HEALTH: 100,
    INITIAL_MANA: 50,
    INVENTORY_SIZE: 20,
    
    // Item Types
    ITEM_TYPES: {
        WEAPON: 'WEAPON',
        ARMOR: 'ARMOR',
        ACCESSORY: 'ACCESSORY',
        CONSUMABLE: 'CONSUMABLE',
        MATERIAL: 'MATERIAL',
        QUEST: 'QUEST'
    },
    
    // Item Rarities
    ITEM_RARITIES: {
        COMMON: 'COMMON',
        MAGIC: 'MAGIC',
        RARE: 'RARE',
        UNIQUE: 'UNIQUE',
        LEGENDARY: 'LEGENDARY'
    },
    
    // Equipment Slots
    EQUIPMENT_SLOTS: {
        MAIN_HAND: 'mainHand',
        OFF_HAND: 'offHand',
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'legs',
        BOOTS: 'boots',
        GLOVES: 'gloves',
        BELT: 'belt',
        AMULET: 'amulet',
        RING_LEFT: 'ringLeft',
        RING_RIGHT: 'ringRight',
        ACCESSORY: 'accessory'
    },
    
    // Combat Settings
    BASE_ATTACK_COOLDOWN: 2.0, // seconds
    BASE_ENEMY_COOLDOWN: 2.5, // seconds
    XP_MULTIPLIER: 1.0,
    LOOT_MULTIPLIER: 1.0,
    
    // Zones
    ZONES: [
        { 
            id: 0, 
            name: 'Forest Edge', 
            minLevel: 1, 
            maxLevel: 5,
            enemies: ['goblin', 'wolf', 'skeleton'],
            background: 'forest.jpg'
        },
        { 
            id: 1, 
            name: 'Dark Cave', 
            minLevel: 4, 
            maxLevel: 10,
            enemies: ['goblin', 'skeleton', 'wolf', 'ogre'],
            background: 'cave.jpg'
        },
        { 
            id: 2, 
            name: 'Haunted Manor', 
            minLevel: 8, 
            maxLevel: 15,
            enemies: ['skeleton', 'ghost', 'ogre'],
            background: 'manor.jpg'
        }
    ]
};

export const INITIAL_STATE = {
    character: {
        name: 'Hero',
        level: 1,
        experience: 0,
        health: CONFIG.INITIAL_HEALTH,
        maxHealth: CONFIG.INITIAL_HEALTH,
        mana: CONFIG.INITIAL_MANA,
        maxMana: CONFIG.INITIAL_MANA,
        gold: 0,
        baseStrength: 5,
        baseDexterity: 5,
        baseIntelligence: 5,
        baseVitality: 10,
        baseLuck: 3,
        availablePoints: 0,
        inventory: {
            items: [],
            maxSize: CONFIG.INVENTORY_SIZE,
            equipped: {}
        },
        zone: 0,
        stats: {} // Will be calculated
    },
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        particlesEnabled: true
    },
    gameStats: {
        enemiesKilled: 0,
        goldCollected: 0,
        itemsFound: 0,
        timePlayedSeconds: 0
    }
};
