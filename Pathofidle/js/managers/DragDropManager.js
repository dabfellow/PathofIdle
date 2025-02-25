import { CONFIG } from '../constants.js';

export class DragDropManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.draggedItem = null;
        this.draggedElement = null;
        this.sourceContainer = null;
        this.sourceIndex = null;
        this.cleanupHandlers = new Set();
    }

    initialize() {
        try {
            this.setupEventListeners();
            return true;
        } catch (error) {
            console.error('Failed to initialize DragDropManager:', error);
            return false;
        }
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
    }

    setupEventListeners() {
        // Get all containers that can hold draggable items
        const inventoryContainer = document.querySelector('.inventory-items');
        const equipmentSlots = document.querySelectorAll('.equipped-items .slot');
        
        if (!inventoryContainer) {
            console.error("Inventory container not found");
            return;
        }

        // Setup drag events for inventory items
        inventoryContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        inventoryContainer.addEventListener('dragover', this.handleDragOver.bind(this));
        inventoryContainer.addEventListener('dragleave', this.handleDragLeave.bind(this));
        inventoryContainer.addEventListener('drop', this.handleDrop.bind(this));
        inventoryContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        this.cleanupHandlers.add(() => {
            inventoryContainer.removeEventListener('dragstart', this.handleDragStart.bind(this));
            inventoryContainer.removeEventListener('dragover', this.handleDragOver.bind(this));
            inventoryContainer.removeEventListener('dragleave', this.handleDragLeave.bind(this));
            inventoryContainer.removeEventListener('drop', this.handleDrop.bind(this));
            inventoryContainer.removeEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Setup drag events for equipment slots
        equipmentSlots.forEach(slot => {
            slot.addEventListener('dragstart', this.handleDragStart.bind(this));
            slot.addEventListener('dragover', this.handleDragOver.bind(this));
            slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
            slot.addEventListener('drop', this.handleDrop.bind(this));
            slot.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            this.cleanupHandlers.add(() => {
                slot.removeEventListener('dragstart', this.handleDragStart.bind(this));
                slot.removeEventListener('dragover', this.handleDragOver.bind(this));
                slot.removeEventListener('dragleave', this.handleDragLeave.bind(this));
                slot.removeEventListener('drop', this.handleDrop.bind(this));
                slot.removeEventListener('dragend', this.handleDragEnd.bind(this));
            });
        });

        console.log('Drag and drop event listeners set up');
    }

    handleDragStart(event) {
        try {
            // Find the item being dragged
            const itemElement = event.target.closest('.item');
            if (!itemElement) return;
            
            const slotElement = itemElement.closest('.inventory-slot, .slot');
            if (!slotElement) return;
            
            // Store information about the drag operation
            this.draggedElement = itemElement;
            this.sourceContainer = slotElement.parentElement;
            this.sourceIndex = slotElement.dataset.slot || slotElement.dataset.index;
            
            // Set drag effect and add a visual class
            event.dataTransfer.effectAllowed = 'move';
            itemElement.classList.add('dragging');
            
            // Try to find the actual item data
            const itemId = itemElement.dataset.itemId;
            if (slotElement.classList.contains('inventory-slot')) {
                this.draggedItem = this.inventoryManager.character.inventory.items[this.sourceIndex];
            } else if (slotElement.classList.contains('slot')) {
                const slotType = slotElement.dataset.slot;
                this.draggedItem = this.inventoryManager.character.inventory.equipped[slotType];
            }
            
            console.log('Drag started:', this.draggedItem);
        } catch (error) {
            console.error('Error in drag start:', error);
        }
    }

    handleDragOver(event) {
        // Prevent default to allow drop
        event.preventDefault();
        
        const targetSlot = event.target.closest('.inventory-slot, .slot');
        if (!targetSlot) return;
        
        // Check if this is a valid drop target
        if (this.isValidDropTarget(targetSlot)) {
            targetSlot.classList.add('drag-over');
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }

    handleDragLeave(event) {
        const targetSlot = event.target.closest('.inventory-slot, .slot');
        if (targetSlot) {
            targetSlot.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        
        try {
            const targetSlot = event.target.closest('.inventory-slot, .slot');
            if (!targetSlot) return;
            
            targetSlot.classList.remove('drag-over');
            
            if (!this.draggedItem || !this.isValidDropTarget(targetSlot)) return;
            
            // Handle the item movement
            if (targetSlot.classList.contains('inventory-slot')) {
                // Moving to inventory slot
                const targetIndex = targetSlot.dataset.index || targetSlot.dataset.slot;
                
                if (this.sourceContainer.classList.contains('inventory-items')) {
                    // Inventory to inventory
                    this.inventoryManager.moveItemInInventory(this.sourceIndex, targetIndex);
                } else {
                    // Equipment to inventory
                    const sourceSlotType = this.sourceContainer.querySelector(`[data-slot="${this.sourceIndex}"]`)?.dataset.slot;
                    if (sourceSlotType) {
                        this.inventoryManager.unequipItem(sourceSlotType, targetIndex);
                    }
                }
            } else if (targetSlot.classList.contains('slot')) {
                // Moving to equipment slot
                const targetSlotType = targetSlot.dataset.slot;
                
                if (this.sourceContainer.classList.contains('inventory-items')) {
                    // Inventory to equipment
                    this.inventoryManager.equipItem(this.sourceIndex, targetSlotType);
                } else {
                    // Equipment to equipment (if allowed)
                    const sourceSlotType = this.sourceContainer.querySelector(`[data-slot="${this.sourceIndex}"]`)?.dataset.slot;
                    if (sourceSlotType && sourceSlotType !== targetSlotType) {
                        this.inventoryManager.swapEquippedItems(sourceSlotType, targetSlotType);
                    }
                }
            }
            
            // Update displays
            this.inventoryManager.updateInventoryDisplay();
            this.inventoryManager.updateEquippedItems();
            
        } catch (error) {
            console.error('Error in drop handler:', error);
        }
    }

    handleDragEnd(event) {
        // Clean up any visual effects
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        document.querySelectorAll('.drag-over').forEach(element => {
            element.classList.remove('drag-over');
        });
        
        this.draggedItem = null;
        this.draggedElement = null;
        this.sourceContainer = null;
        this.sourceIndex = null;
    }

    isValidDropTarget(targetSlot) {
        if (!this.draggedItem) return false;
        
        // Check if target is already occupied
        if (targetSlot.querySelector('.item') && !targetSlot.classList.contains('slot')) {
            return false;
        }
        
        // If dropping onto equipment slot, check item type compatibility
        if (targetSlot.classList.contains('slot')) {
            const targetSlotType = targetSlot.dataset.slot;
            return this.isItemCompatibleWithSlot(this.draggedItem, targetSlotType);
        }
        
        return true;
    }

    isItemCompatibleWithSlot(item, slotType) {
        // Check if the item can be equipped in this slot
        if (!item || !item.slot) return false;
        
        return item.slot === slotType;
    }
}

// Add this to your main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Get all items and slots
    const items = document.querySelectorAll('.item');
    const slots = document.querySelectorAll('.inventory-slot, .equipped-items .slot');

    // Add drag functionality to items
    items.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.itemId || '');
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    // Add drop functionality to slots
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            
            const itemId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.querySelector(`[data-item-id="${itemId}"]`);
            
            if (!draggedItem) return;

            // Check if slot already has an item
            const existingItem = slot.querySelector('.item');
            
            if (existingItem) {
                // Swap items
                const originalSlot = draggedItem.parentElement;
                originalSlot.appendChild(existingItem);
                slot.appendChild(draggedItem);
            } else {
                // Move item to empty slot
                slot.appendChild(draggedItem);
            }

            // Here you would typically update your game state
            updateGameState(draggedItem, slot);
        });
    });
});

// Function to update game state after item move
function updateGameState(item, newSlot) {
    // Get slot type (inventory or equipment)
    const isEquipmentSlot = newSlot.closest('.equipped-items') !== null;
    const itemId = item.dataset.itemId;
    
    if (isEquipmentSlot) {
        // Handle equipping item
        console.log(`Equipped item ${itemId}`);
        // Add your equipment logic here
    } else {
        // Handle moving to inventory
        console.log(`Moved item ${itemId} to inventory`);
        // Add your inventory logic here
    }
}
