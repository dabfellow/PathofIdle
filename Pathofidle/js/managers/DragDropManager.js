import { CONFIG } from '../constants.js';

export class DragDropManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.currentDraggedItem = null;
        this.cleanupHandlers = new Set();
    }

    initialize() {
        const inventoryDiv = document.querySelector('.inventory-items');
        const equippedDiv = document.querySelector('.equipped-items');

        [inventoryDiv, equippedDiv].forEach(container => {
            if (container) {
                // Store cleanup functions
                const handlers = {
                    dragstart: this.handleDragStart.bind(this),
                    dragend: this.handleDragEnd.bind(this),
                    dragover: this.handleDragOver.bind(this),
                    dragleave: this.handleDragLeave.bind(this),
                    drop: this.handleDrop.bind(this)
                };

                // Add event listeners
                Object.entries(handlers).forEach(([event, handler]) => {
                    container.addEventListener(event, handler);
                    this.cleanupHandlers.add(() => container.removeEventListener(event, handler));
                });
            }
        });
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        this.currentDraggedItem = null;
    }

    // ... existing drag and drop handler methods ...

    getSlotType(element) {
        if (element.closest('.equipped-items')) return 'equipment';
        if (element.closest('.inventory-items')) return 'inventory';
        return null;
    }
}
