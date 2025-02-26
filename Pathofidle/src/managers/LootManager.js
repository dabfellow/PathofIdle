import { CONFIG } from '../config/constants.js';
import { ItemData } from '../data/items.js';  // Updated path
import { randomInt, weightedRandom } from '../utils/random.js';  // Updated path

export class LootManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.dropChanceModifier = 1.0;
        console.log('LootManager initialized');
    }

    generateLootFromEnemy(enemy, playerLevel) {
        const baseDropChance = 0.8; // 80% chance for testing
        console.log(`Rolling for loot drop (chance: ${baseDropChance * this.dropChanceModifier})`);
        
        if (Math.random() < baseDropChance * this.dropChanceModifier) {
            console.log("Loot roll succeeded! Generating item...");
            return this.generateItem(enemy.level || playerLevel);
        }
        
        console.log("No loot dropped this time");
        return null;
    }

    generateItem(level) {
        try {
            // Determine item type
            const itemType = weightedRandom({
                WEAPON: 0.4,    // 40% chance
                ARMOR: 0.4,     // 40% chance
                ACCESSORY: 0.2  // 20% chance
            });
            console.log(`Item type selected: ${itemType}`);
            
            // Determine item rarity
            const rarities = Object.keys(CONFIG.RARITY_TYPES);
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            console.log(`Item rarity selected: ${rarity}`);
            
            // Get base item template
            const templates = ItemData[itemType];
            if (!templates || templates.length === 0) {
                console.error(`No templates found for item type: ${itemType}`);
                return this.generateFallbackItem(level);
            }
            
            const template = templates[Math.floor(Math.random() * templates.length)];
            console.log(`Selected template: ${template.name}`);
            
            const item = this.createItemFromTemplate(template, level, rarity);
            console.log(`Generated item: ${item.name} (${item.rarityName})`);
            
            return item;
        } catch (error) {
            console.error("Error generating item:", error);
            return this.generateFallbackItem(level);
        }
    }

    generateFallbackItem(level) {
        console.log("Using fallback item generation");
        return {
            id: Date.now() + '-fallback',
            name: "Strange Orb",
            description: "A mysterious orb that shouldn't exist.",
            icon: "🔮",
            type: CONFIG.ITEM_TYPES.ACCESSORY,
            rarity: "COMMON",
            rarityName: "Common",
            level: level,
            stats: {
                luck: 1
            }
        };
    }

    createItemFromTemplate(template, level, rarity) {
        const rarityData = CONFIG.RARITY_TYPES[rarity];
        const item = JSON.parse(JSON.stringify(template));
        
        item.id = Date.now() + '-' + Math.floor(Math.random() * 1000);
        item.level = level;
        item.rarity = rarity;
        item.rarityName = rarityData.name;
        
        this.scaleItemStats(item, level, rarityData.statMultiplier);
        
        return item;
    }

    scaleItemStats(item, level, rarityMultiplier) {
        const scalingFactor = Math.pow(1.1, level - 1);
        
        if (item.stats) {
            Object.keys(item.stats).forEach(statKey => {
                if (typeof item.stats[statKey] === 'number') {
                    item.stats[statKey] = Math.round(
                        item.stats[statKey] * scalingFactor * rarityMultiplier
                    );
                }
            });
        }
    }

    /**
     * Add the item to player's inventory and show notification
     */
    addLootToInventory(item) {
        console.log("Attempting to add loot to inventory:", item);
        
        // Actually add the item to inventory
        const success = this.inventoryManager.addItem(item);
        
        if (success) {
            this.showLootNotification(item);
            return true;
        } else {
            // Show inventory full message directly since the method is missing
            const logEntries = document.querySelector('.log-entries');
            if (logEntries) {
                const lootEntry = document.createElement('div');
                lootEntry.classList.add('log-entry', 'warning');
                lootEntry.textContent = `Inventory full! ${item.name} could not be picked up.`;
                logEntries.appendChild(lootEntry);
                logEntries.scrollTop = logEntries.scrollHeight;
            }
            return false;
        }
    }

    addLootNotification(item, inventoryFull = false) {
        const logEntries = document.querySelector('.log-entries');
        if (!logEntries) return;

        const notification = document.createElement('div');
        
        if (inventoryFull) {
            notification.className = 'log-entry warning';
            notification.textContent = 'Inventory is full! Item was lost.';
        } else {
            notification.className = `log-entry item-drop ${item.rarity.toLowerCase()}`;
            notification.textContent = `Found: ${item.name} (${item.rarity})`;
        }

        logEntries.appendChild(notification);
        logEntries.scrollTop = logEntries.scrollHeight;
    }

    showLootNotification(item) {
        try {
            const rarityData = CONFIG.RARITY_TYPES[item.rarity];
            const logEntries = document.querySelector('.log-entries');
            
            console.log("Showing loot notification");
            
            if (logEntries) {
                const lootEntry = document.createElement('div');
                lootEntry.classList.add('log-entry', 'item-drop');
                lootEntry.style.color = rarityData.color;
                lootEntry.textContent = `Found: ${rarityData.name} ${item.name} (Level ${item.level})`;
                logEntries.appendChild(lootEntry);
                logEntries.scrollTop = logEntries.scrollHeight;
            } else {
                console.error("Could not find .log-entries element");
            }
        } catch (error) {
            console.error("Error showing loot notification:", error);
        }
    }
}
