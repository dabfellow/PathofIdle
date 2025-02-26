export class DragDropManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.draggedItem = null;
        this.draggedElement = null;
        this.draggedItemData = null;
        this.sourceContainer = null;
        this.sourceIndex = null;
        this.cleanupHandlers = new Set();
    }

    initialize() {
        try {
            this.setupEventListeners();
            console.log('DragDropManager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize DragDropManager:', error);
            return false;
        }
    }

    setupEventListeners() {
        // Clean up any existing handlers first
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        
        // Set up drag start event listener
        const handleDragStart = this.handleDragStart.bind(this);
        document.addEventListener('dragstart', handleDragStart);
        this.cleanupHandlers.add(() => document.removeEventListener('dragstart', handleDragStart));
        
        // Set up drag over event listener
        const handleDragOver = this.handleDragOver.bind(this);
        document.addEventListener('dragover', handleDragOver);
        this.cleanupHandlers.add(() => document.removeEventListener('dragover', handleDragOver));
        
        // Set up drop event listener
        const handleDrop = this.handleDrop.bind(this);
        document.addEventListener('drop', handleDrop);
        this.cleanupHandlers.add(() => document.removeEventListener('drop', handleDrop));
        
        // Set up drag end event listener
        const handleDragEnd = this.handleDragEnd.bind(this);
        document.addEventListener('dragend', handleDragEnd);
        this.cleanupHandlers.add(() => document.removeEventListener('dragend', handleDragEnd));
        
        // Add dragenter and dragleave for equipment slot highlighting
        const handleDragEnter = this.handleDragEnter.bind(this);
        document.addEventListener('dragenter', handleDragEnter);
        this.cleanupHandlers.add(() => document.removeEventListener('dragenter', handleDragEnter));
        
        const handleDragLeave = this.handleDragLeave.bind(this);
        document.addEventListener('dragleave', handleDragLeave);
        this.cleanupHandlers.add(() => document.removeEventListener('dragleave', handleDragLeave));
        
        console.log("DragDropManager: Event listeners set up");
    }

    handleDragStart(event) {
        const itemElement = event.target.closest('.item');
        if (!itemElement) return;
        
        // Store the dragged element
        this.draggedElement = itemElement;
        
        // Find parent slot
        const inventorySlot = itemElement.closest('.inventory-slot');
        if (inventorySlot) {
            this.sourceContainer = 'inventory';
            this.sourceIndex = parseInt(inventorySlot.dataset.index);
            
            // Get the actual item data from inventory
            this.draggedItemData = this.inventoryManager.character.inventory.items[this.sourceIndex];
        } else {
            // Might be dragging from equipment
            const equipSlot = itemElement.closest('.equip-slot');
            if (equipSlot) {
                this.sourceContainer = 'equipment';
                this.sourceIndex = equipSlot.dataset.slot;
                
                // Get the item data from equipped items
                this.draggedItemData = this.inventoryManager.character.inventory.equipped[this.sourceIndex];
            }
        }
        
        if (this.draggedItemData) {
            event.dataTransfer.setData('text/plain', JSON.stringify({
                itemId: this.draggedItemData.id,
                sourceContainer: this.sourceContainer,
                sourceIndex: this.sourceIndex,
                itemType: this.draggedItemData.type,
                itemSlot: this.draggedItemData.slot
            }));
            
            itemElement.classList.add('dragging');
            console.log(`Drag started: ${this.draggedItemData.name} from ${this.sourceContainer} ${this.sourceIndex}`);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        
        // Check if we're dragging over an inventory slot
        const inventorySlot = event.target.closest('.inventory-slot');
        if (inventorySlot) {
            inventorySlot.classList.add('drag-over');
            return;
        }
        
        // Check if we're dragging over an equipment slot
        const equipSlot = event.target.closest('.equip-slot');
        if (equipSlot && this.draggedItemData) {
            const slotType = equipSlot.dataset.slot;
            
            // Check if this item can go in this equipment slot
            if (this.isItemCompatibleWithSlot(this.draggedItemData, slotType)) {
                equipSlot.classList.add('compatible-target');
            } else {
                equipSlot.classList.add('incompatible-target');
            }
        }
    }

    handleDragEnter(event) {
        const equipSlot = event.target.closest('.equip-slot');
        if (equipSlot && this.draggedItemData) {
            const slotType = equipSlot.dataset.slot;
            
            if (this.isItemCompatibleWithSlot(this.draggedItemData, slotType)) {
                equipSlot.classList.add('compatible-target');
            } else {
                equipSlot.classList.add('incompatible-target');
            }
        }
    }

    handleDragLeave(event) {
        const equipSlot = event.target.closest('.equip-slot');
        if (equipSlot) {
            equipSlot.classList.remove('compatible-target');
            equipSlot.classList.remove('incompatible-target');
        }
        
        const inventorySlot = event.target.closest('.inventory-slot');
        if (inventorySlot) {
            inventorySlot.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        
        // Clear all highlighting
        document.querySelectorAll('.compatible-target, .incompatible-target, .drag-over').forEach(el => {
            el.classList.remove('compatible-target', 'incompatible-target', 'drag-over');
        });
        
        if (!this.draggedItemData) return;
        
        // Check if dropping on inventory slot
        const inventorySlot = event.target.closest('.inventory-slot');
        if (inventorySlot) {
            const targetIndex = parseInt(inventorySlot.dataset.index);
            console.log(`Dropping item from ${this.sourceContainer} ${this.sourceIndex} to inventory ${targetIndex}`);
            
            if (this.sourceContainer === 'inventory' && this.sourceIndex !== targetIndex) {
                this.inventoryManager.moveItem(this.sourceIndex, targetIndex);
            } else if (this.sourceContainer === 'equipment') {
                this.inventoryManager.unequipItem(this.sourceIndex, targetIndex);
            }
            return;
        }
        
        // Check if dropping on equipment slot
        const equipSlot = event.target.closest('.equip-slot');
        if (equipSlot && this.draggedItemData) {
            const slotType = equipSlot.dataset.slot;
            
            // Check if this item can go in this equipment slot
            if (this.isItemCompatibleWithSlot(this.draggedItemData, slotType)) {
                console.log(`Equipping item to ${slotType} from ${this.sourceContainer} ${this.sourceIndex}`);
                
                if (this.sourceContainer === 'inventory') {
                    this.inventoryManager.equipItemFromInventory(this.sourceIndex, slotType);
                } else if (this.sourceContainer === 'equipment' && this.sourceIndex !== slotType) {
                    this.inventoryManager.moveEquippedItem(this.sourceIndex, slotType);
                }
            }
        }
    }

    handleDragEnd(event) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
            this.draggedItemData = null;
            this.sourceContainer = null;
            this.sourceIndex = null;
        }

        // Clear all highlighting
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
        
        document.querySelectorAll('.equip-slot').forEach(slot => {
            slot.classList.remove('compatible-target');
            slot.classList.remove('incompatible-target');
        });
    }
    
    isItemCompatibleWithSlot(item, slotType) {
        // First check if the item has a specific slot property
        if (item.slot) {
            return item.slot === slotType;
        }
        
        // Otherwise, make a reasonable guess based on item type and slot
        switch(item.type) {
            case 'WEAPON':
                return slotType === 'mainHand' || slotType === 'offHand';
                
            case 'ARMOR':
                // Match armor items to appropriate slots
                if (item.name.toLowerCase().includes('helmet') || 
                    item.name.toLowerCase().includes('cap') ||
                    item.name.toLowerCase().includes('crown')) {
                    return slotType === 'head';
                }
                
                if (item.name.toLowerCase().includes('chest') || 
                    item.name.toLowerCase().includes('robe') ||
                    item.name.toLowerCase().includes('armor')) {
                    return slotType === 'chest';
                }
                
                if (item.name.toLowerCase().includes('boot') || 
                    item.name.toLowerCase().includes('shoe') ||
                    item.name.toLowerCase().includes('greave')) {
                    return slotType === 'boots';
                }
                
                if (item.name.toLowerCase().includes('glove') || 
                    item.name.toLowerCase().includes('gauntlet')) {
                    return slotType === 'gloves';
                }
                
                if (item.name.toLowerCase().includes('belt') || 
                    item.name.toLowerCase().includes('sash')) {
                    return slotType === 'belt';
                }
                
                return false;
                
            case 'ACCESSORY':
                // Match accessory items to appropriate slots
                if (item.name.toLowerCase().includes('ring')) {
                    return slotType === 'ringLeft' || slotType === 'ringRight';
                }
                
                if (item.name.toLowerCase().includes('amulet') || 
                    item.name.toLowerCase().includes('necklace') ||
                    item.name.toLowerCase().includes('pendant')) {
                    return slotType === 'amulet';
                }
                
                // For generic accessories
                return slotType === 'amulet' || 
                       slotType === 'ringLeft' || 
                       slotType === 'ringRight';
                
            default:
                return false;
        }
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        console.log("DragDropManager: Cleaned up event listeners");
    }
}
