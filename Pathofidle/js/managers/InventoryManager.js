import { CONFIG } from '../constants.js';
import { DragDropManager } from './DragDropManager.js';

export class InventoryManager {
    constructor(character) {
        this.character = character;
        console.log('InventoryManager initialized with character:', character);

        // Initialize drag and drop manager
        this.dragDropManager = new DragDropManager(this);
        
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

        // Initialize drag and drop functionality
        this.dragDropManager.initialize();
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

        this.character.inventory.items.push(item);
        item.isNewDrop = true;
        this.updateInventoryUI();

        console.log("Item added successfully to slot:", this.character.inventory.items.length - 1);
        return true;
    }

    moveItem(fromIndex, toIndex) {
        const items = this.character.inventory.items;
        if (items[fromIndex] && items[toIndex] === undefined) {
            items[toIndex] = items[fromIndex];
            items[fromIndex] = undefined;
            this.updateInventoryUI();
        }
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
            // Remove draggable attribute from slots
            // slot.setAttribute('draggable', 'true');

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
        // Add draggable attribute to items instead of slots
        itemEl.setAttribute('draggable', 'true');

        const iconEl = document.createElement('div');
        iconEl.classList.add('item-icon');
        iconEl.textContent = item.icon || '📦';
        itemEl.appendChild(iconEl);

        const nameEl = document.createElement('div');
        nameEl.classList.add('item-name');
        nameEl.textContent = item.name;
        nameEl.style.color = CONFIG.RARITY_TYPES[item.rarity].color;
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
}