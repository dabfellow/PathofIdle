import { CONFIG } from '../constants.js';

export class InventoryManager {
    constructor(character) {
        this.character = character;
        console.log('InventoryManager initialized with character:', character);

        // Initialize inventory if it doesn't exist
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
            // Ensure the inventory's maxSize is correctly set from the configuration
            this.character.inventory.maxSize = CONFIG.INVENTORY_SIZE;
        }

        this.cleanupHandlers = new Set();
    }

    initialize() {
        try {
            this.setupEventListeners();
            this.updateInventoryDisplay();
            return true;
        } catch (error) {
            console.error('Failed to initialize InventoryManager:', error);
            return false;
        }
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
    }

    setupEventListeners() {
        const inventoryContainer = document.querySelector('.inventory-items');
        if (!inventoryContainer) {
            throw new Error('Inventory container not found');
        }

        const clickHandler = this.handleInventoryClick.bind(this);
        inventoryContainer.addEventListener('click', clickHandler);
        this.cleanupHandlers.add(() => 
            inventoryContainer.removeEventListener('click', clickHandler));
    }

    // ... existing inventory methods with error handling ...

    updateInventoryDisplay() {
        try {
            const inventoryDiv = document.querySelector('.inventory-items');
            if (!inventoryDiv) throw new Error('Inventory container not found');

            inventoryDiv.innerHTML = '';
            
            for (let i = 0; i < CONFIG.INVENTORY_SIZE; i++) {
                const slot = this.createInventorySlot(i);
                inventoryDiv.appendChild(slot);
            }

            this.updateEquippedItems();
        } catch (error) {
            console.error('Error updating inventory display:', error);
        }
    }

    createInventorySlot(index) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = index;
        slot.dataset.type = 'inventory';

        // Add item if present
        const item = this.character.inventory.items[index];
        if (item) {
            const itemElement = this.createItemElement(item);
            slot.appendChild(itemElement);
            slot.classList.add('occupied');
        }
        return slot;
    }

    updateEquippedItems() {
        try {
            // Get all equipment slots
            const slots = document.querySelectorAll('.equipped-items .slot');
            if (!slots || slots.length === 0) {
                console.warn('No equipment slots found in the DOM');
                return;
            }
            
            // Loop through each slot and update it
            slots.forEach(slot => {
                // Clear the slot first
                slot.innerHTML = '';
                
                // Get the slot type (head, chest, etc.)
                const slotType = slot.dataset.slot;
                if (!slotType) {
                    console.warn('Slot missing data-slot attribute:', slot);
                    return;
                }
                
                // Check if an item is equipped in this slot
                const equippedItem = this.character.inventory.equipped[slotType];
                
                if (equippedItem) {
                    // Create and add the item element
                    const itemElement = this.createItemElement(equippedItem);
                    slot.appendChild(itemElement);
                } else {
                    // Add empty slot placeholder
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'empty-slot';
                    emptySlot.textContent = slotType.charAt(0).toUpperCase() + slotType.slice(1); // Capitalize first letter
                    slot.appendChild(emptySlot);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error updating equipped items:', error);
            return false;
        }
    }

    createItemElement(item) {
        const itemEl = document.createElement('div');
        itemEl.classList.add('item', item.rarity.toLowerCase());
        itemEl.dataset.itemId = item.id;
        
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

    /**
     * Add an item to the first available inventory slot
     * @param {Object} item - The item to add
     * @returns {boolean} - True if item was added successfully, false if inventory is full
     */
    addItem(item) {
        console.log("Attempting to add item to inventory:", item);
        
        // Ensure items array exists
        if (!this.character.inventory.items) {
            this.character.inventory.items = [];
        }
        
        // Check if inventory is full
        if (this.character.inventory.items.length >= this.character.inventory.maxSize) {
            console.log("Inventory is full!");
            return false;
        }
        
        // Add item to inventory array
        this.character.inventory.items.push(item);
        
        // Mark the item as a new drop for animation purposes
        item.isNewDrop = true;
        
        // Update the inventory UI
        this.updateInventoryUI();
        
        console.log("Item added successfully to slot:", this.character.inventory.items.length - 1);
        return true;
    }

    updateInventoryUI() {
        console.log("Updating inventory UI");
        
        const inventoryContainer = document.querySelector('.inventory-items');
        if (!inventoryContainer) {
            console.error("Could not find inventory container");
            return;
        }
        
        inventoryContainer.innerHTML = '';
        
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

    clearInventory() {
        this.character.inventory.items = [];
        this.updateInventoryUI();
        console.log("Inventory cleared");
    }
}
