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
}
