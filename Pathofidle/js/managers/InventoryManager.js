import { CONFIG } from '../../src/config/constants.js';
// Remove the direct import of DragDropManager to prevent circular dependencies

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
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.itemId = item.id;
        
        // Add any rarity classes
        if (item.rarity) {
            itemElement.classList.add(item.rarity.toLowerCase());
        }
        
        // Add icon
        const iconElement = document.createElement('div');
        iconElement.className = 'item-icon';
        iconElement.textContent = item.icon || '📦';
        itemElement.appendChild(iconElement);
        
        // Add name
        const nameElement = document.createElement('div');
        nameElement.className = 'item-name';
        nameElement.textContent = item.name;
        itemElement.appendChild(nameElement);
        
        // Add tooltip with more details (will be styled via CSS)
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'item-tooltip';
        
        // Create tooltip content
        let tooltipContent = `
            <div class="tooltip-header">
                <span class="tooltip-name">${item.name}</span>
                <span class="tooltip-type">${item.type}</span>
            </div>
            <div class="tooltip-description">${item.description || ''}</div>
        `;
        
        // Add stats if they exist
        if (item.stats) {
            tooltipContent += '<div class="tooltip-stats">';
            for (const [stat, value] of Object.entries(item.stats)) {
                tooltipContent += `<div class="tooltip-stat">${this.formatStatName(stat)}: ${value}</div>`;
            }
            tooltipContent += '</div>';
        }
        
        tooltipElement.innerHTML = tooltipContent;
        itemElement.appendChild(tooltipElement);
        
        return itemElement;
    }

    formatStatName(stat) {
        // Convert camelCase to Title Case with spaces
        return stat
            .replace(/([A-Z])/g, ' $1') // Insert a space before all caps
            .replace(/^./, str => str.toUpperCase()); // Uppercase first letter
    }

    clearInventory() {
        this.character.inventory.items = [];
        this.updateInventoryUI();
        console.log("Inventory cleared");
    }
    
    // Add this method to update equipped items
    updateEquippedItems() {
        console.log('Updating equipped items display');
        
        // Clear all equipment slots first
        document.querySelectorAll('.equip-slot').forEach(slot => {
            // Keep the icon and label, remove any item
            const itemElement = slot.querySelector('.item');
            if (itemElement) {
                itemElement.remove();
            }
            
            // Remove the 'filled' class
            slot.classList.remove('filled');
        });
        
        // Display each equipped item
        if (this.character.inventory && this.character.inventory.equipped) {
            Object.entries(this.character.inventory.equipped).forEach(([slotName, item]) => {
                if (!item) return; // Skip empty slots
                
                // Find the corresponding slot element
                const slotElement = document.querySelector(`.equip-slot[data-slot="${slotName}"]`);
                if (slotElement) {
                    // Create and add the item element
                    const itemElement = this.createItemElement(item);
                    
                    // Remove existing item children (but keep slot icon/label)
                    const existingItem = slotElement.querySelector('.item');
                    if (existingItem) {
                        existingItem.remove();
                    }
                    
                    // Add the new item
                    slotElement.appendChild(itemElement);
                    slotElement.classList.add('filled');
                    
                    console.log(`Added ${item.name} to ${slotName} slot`);
                } else {
                    console.warn(`Could not find element for equipment slot: ${slotName}`);
                }
            });
        }
    }
}
