import { CONFIG } from '../constants.js';

export class DragDropManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.currentDraggedItem = null;
        this.cleanupHandlers = new Set();
    }

    initialize() {
        try {
            const inventoryDiv = document.querySelector('.inventory-items');
            const equippedDiv = document.querySelector('.equipped-items');

            if (!inventoryDiv || !equippedDiv) {
                throw new Error('Required containers not found');
            }

            [inventoryDiv, equippedDiv].forEach(container => {
                const handlers = {
                    dragstart: (e) => this.handleDragStart(e),
                    dragend: (e) => this.handleDragEnd(e),
                    dragover: (e) => this.handleDragOver(e),
                    dragleave: (e) => this.handleDragLeave(e),
                    drop: (e) => this.handleDrop(e)
                };

                Object.entries(handlers).forEach(([event, handler]) => {
                    container.addEventListener(event, handler);
                    this.cleanupHandlers.add(() => 
                        container.removeEventListener(event, handler));
                });
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize drag and drop:', error);
            return false;
        }
    }

    handleDragStart(event) {
        const item = event.target.closest('.item');
        if (!item) return;
        
        this.currentDraggedItem = item;
        event.dataTransfer.setData('text/plain', ''); // Required for Firefox
        item.classList.add('dragging');
    }

    handleDragEnd(event) {
        if (this.currentDraggedItem) {
            this.currentDraggedItem.classList.remove('dragging');
            this.currentDraggedItem = null;
        }
    }

    handleDragOver(event) {
        event.preventDefault(); // Allow drop
        const slot = event.target.closest('.inventory-slot, .slot');
        if (slot) {
            slot.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        const slot = event.target.closest('.inventory-slot, .slot');
        if (slot) {
            slot.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const slot = event.target.closest('.inventory-slot, .slot');
        if (!slot || !this.currentDraggedItem) return;

        slot.classList.remove('drag-over');
        
        // Handle the item movement logic here
        // You'll need to implement this based on your inventory system
        console.log('Item dropped', {
            item: this.currentDraggedItem.dataset.itemId,
            targetSlot: slot.dataset.slot,
            slotType: this.getSlotType(slot)
        });
    }

    getSlotType(element) {
        if (element.closest('.equipped-items')) return 'equipment';
        if (element.closest('.inventory-items')) return 'inventory';
        return null;
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        this.currentDraggedItem = null;
    }
}
