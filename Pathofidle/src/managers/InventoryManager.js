import { CONFIG } from '../config/constants.js';

export class InventoryManager {
    constructor(character) {
        this.character = character;
        this.dragDropManager = null; // Will be set by GameManager
        console.log('InventoryManager initialized with character:', character);
        
        if (!this.character.inventory) {
            this.character.inventory = {
                items: [],
                maxSize: CONFIG.INVENTORY_SIZE,
                equipped: {
                    mainHand: null,
                    offHand: null,
                    head: null,
                    chest: null,
                    legs: null
                }
            };
        } else {
            this.character.inventory.maxSize = CONFIG.INVENTORY_SIZE;
        }
    }

    // Method to set the DragDropManager reference
    setDragDropManager(dragDropManager) {
        this.dragDropManager = dragDropManager;
    }

    addItem(item) {
        console.log("Attempting to add item to inventory:", item);

        if (!this.character.inventory.items) {
            this.character.inventory.items = [];
        }

        if (this.character.inventory.items.length >= this.character.inventory.maxSize) {
            console.log("Inventory is full!");
            return false;
        }

        // Find first empty slot (or use push if no undefined entries)
        const emptyIndex = this.character.inventory.items.findIndex(slot => slot === undefined);
        if (emptyIndex >= 0) {
            this.character.inventory.items[emptyIndex] = item;
        } else {
            this.character.inventory.items.push(item);
        }
        
        item.isNewDrop = true;
        this.updateInventoryUI();

        console.log("Item added successfully");
        return true;
    }

    moveItem(fromIndex, toIndex) {
        const items = this.character.inventory.items;
        if (fromIndex >= 0 && fromIndex < items.length && items[fromIndex]) {
            // Store the item being moved
            const item = items[fromIndex];
            
            // Handle destination slot
            if (toIndex >= 0 && toIndex < this.character.inventory.maxSize) {
                // Remove from original position
                items[fromIndex] = undefined;
                
                // Place in new position
                items[toIndex] = item;
                this.updateInventoryUI();
                return true;
            }
        }
        return false;
    }

    updateInventoryUI() {
        console.log("Updating inventory UI");

        const inventoryContainer = document.querySelector('.inventory-items');
        if (!inventoryContainer) {
            console.error("Could not find inventory container");
            return;
        }

        // Clear existing content
        inventoryContainer.innerHTML = '';

        // Create inventory slots
        for (let i = 0; i < this.character.inventory.maxSize; i++) {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            slot.dataset.index = i;

            const item = this.character.inventory.items[i];
            if (item) {
                const itemEl = this.createItemElement(item);
                slot.classList.add('filled');
                slot.appendChild(itemEl);

                if (item.isNewDrop) {
                    itemEl.classList.add('new-drop');
                    setTimeout(() => {
                        itemEl.classList.remove('new-drop');
                        item.isNewDrop = false;
                    }, 2000);
                }
            }

            inventoryContainer.appendChild(slot);
        }
    }

    createItemElement(item) {
        const itemEl = document.createElement('div');
        itemEl.classList.add('item', item.rarity.toLowerCase());
        itemEl.dataset.itemId = item.id;
        itemEl.setAttribute('draggable', 'true');

        const iconEl = document.createElement('div');
        iconEl.classList.add('item-icon');
        iconEl.textContent = item.icon || '📦';
        itemEl.appendChild(iconEl);

        const nameEl = document.createElement('div');
        nameEl.classList.add('item-name');
        nameEl.textContent = item.name;
        if (CONFIG.RARITY_TYPES[item.rarity]) {
            nameEl.style.color = CONFIG.RARITY_TYPES[item.rarity].color;
        }
        itemEl.appendChild(nameEl);

        const statsEl = document.createElement('div');
        statsEl.classList.add('item-stats');
        statsEl.innerHTML = `
            Level ${item.level} ${item.type}<br>
            ${item.description || ''}<br>
        `;

        if (item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                statsEl.innerHTML += `${this.formatStatName(stat)}: +${value}<br>`;
            }
        }

        itemEl.appendChild(statsEl);

        return itemEl;
    }

    formatStatName(stat) {
        return stat.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    clearInventory() {
        this.character.inventory.items = [];
        this.updateInventoryUI();
        console.log("Inventory cleared");
    }
    
    // Add this method to update equipped items
    updateEquippedItems() {
        // Implementation for updating equipped items UI
        console.log("Updating equipped items UI");
        // Add the code here when needed
    }
}