import { CONFIG } from '../constants.js';
import { weightedRandom } from '../utils.js';
import { LootGenerator } from '../loot/LootGenerator.js';
import { ItemData } from '../Data/js_data_ItemData.js';

export class LootManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.lootGenerator = new LootGenerator();
    }

    generateLootFromEnemy(enemy, playerLevel) {
        try {
            // Calculate drop chance based on enemy type
            const baseDropChance = 0.3; // 30% base chance
            const enemyType = enemy.type || 'NORMAL';
            const dropMultiplier = CONFIG.ENEMY_TYPES[enemyType].dropChanceMultiplier;
            const finalDropChance = baseDropChance * dropMultiplier;

            // Roll for loot
            if (Math.random() > finalDropChance) {
                return null; // No loot dropped
            }

            // Generate item based on enemy level and type
            const itemLevel = Math.max(1, enemy.level);
            const loot = this.lootGenerator.generateItem(itemLevel);

            // Add loot drop notification
            this.addLootNotification(loot);

            return loot;
        } catch (error) {
            console.error('Error generating loot:', error);
            return null;
        }
    }

    addLootToInventory(loot) {
        try {
            const inventory = this.inventoryManager.character.inventory;
            const emptySlot = inventory.items.findIndex(slot => !slot);

            if (emptySlot === -1) {
                this.addLootNotification(null, true); // Inventory full notification
                return false;
            }

            // Add item to inventory
            inventory.items[emptySlot] = loot;
            
            // Update inventory display
            this.inventoryManager.updateInventoryDisplay();

            // Add item drop animation
            const slotElement = document.querySelector(`.inventory-slot[data-slot="${emptySlot}"]`);
            if (slotElement) {
                const itemElement = slotElement.querySelector('.item');
                if (itemElement) {
                    itemElement.classList.add('new-drop');
                    setTimeout(() => itemElement.classList.remove('new-drop'), 600);
                }
            }

            return true;
        } catch (error) {
            console.error('Error adding loot to inventory:', error);
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

    scaleItemStats(item, level) {
        const scalingFactor = 1 + (level - 1) * 0.1; // 10% increase per level
        const stats = item.stats;

        Object.keys(stats).forEach(stat => {
            if (typeof stats[stat] === 'number') {
                stats[stat] = Math.floor(stats[stat] * scalingFactor);
            }
        });

        return item;
    }
}