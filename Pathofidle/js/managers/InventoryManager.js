import { CONFIG } from '../constants.js';

export class InventoryManager {
    constructor(character) {
        this.character = character;
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
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.itemId = item.id;
        itemElement.draggable = true;

        // Create item icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'item-icon';
      iconDiv.innerHTML = item.icon || '?';
      itemElement.appendChild(iconDiv);
    
      // Create item name
      const nameDiv = document.createElement('div');
       nameDiv.className = 'item-name';
      nameDiv.textContent = item.name;
      itemElement.appendChild(nameDiv);
        
     // Create item stats
       const statsDiv = document.createElement('div');
      statsDiv.className = 'item-stats';
    
      // Add appropriate stats based on item type
      if (item.damage) {
          statsDiv.textContent += `Damage: ${item.damage} `;
      }
      if (item.health) {
           statsDiv.textContent += `Health: ${item.health} `;
       }
    
        itemElement.appendChild(statsDiv);
       return itemElement;
    }
}
