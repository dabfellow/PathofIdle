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
        
        console.log("DragDropManager: Event listeners set up");
    }

    handleDragStart(event) {
        try {
            // Check if event.target is valid and has the closest method
            if (!event.target || typeof event.target.closest !== 'function') {
                console.warn('Invalid drag target:', event.target);
                return;
            }
            
            const itemElement = event.target.closest('.item');
            if (!itemElement) {
                return; // Not dragging an item
            }
            
            const slotElement = itemElement.closest('.inventory-slot');
            if (!slotElement || !slotElement.dataset.index) {
                console.warn('Item not in a valid inventory slot', itemElement);
                return;
            }
            
            this.draggedItem = itemElement;
            this.sourceIndex = parseInt(slotElement.dataset.index);
            
            // Set data transfer
            event.dataTransfer.setData('text/plain', itemElement.dataset.itemId || 'unknown-item');
            event.dataTransfer.effectAllowed = 'move';
            
            // Add dragging class
            itemElement.classList.add('dragging');
            console.log(`Drag started from index: ${this.sourceIndex}`);
        } catch (error) {
            console.error('Error in handleDragStart:', error);
        }
    }

    handleDragOver(event) {
        try {
            event.preventDefault();
            
            if (!event.target || typeof event.target.closest !== 'function') {
                return;
            }
            
            const slotElement = event.target.closest('.inventory-slot');
            if (slotElement && this.draggedItem) {
                slotElement.classList.add('drag-over');
            }
        } catch (error) {
            console.error('Error in handleDragOver:', error);
        }
    }

    handleDrop(event) {
        try {
            event.preventDefault();
            
            if (!event.target || typeof event.target.closest !== 'function') {
                return;
            }
            
            const slotElement = event.target.closest('.inventory-slot');
            if (slotElement && this.draggedItem) {
                const targetIndex = parseInt(slotElement.dataset.index);
                console.log(`Dropping item from index ${this.sourceIndex} to index ${targetIndex}`);

                if (this.sourceIndex !== targetIndex && !isNaN(this.sourceIndex) && !isNaN(targetIndex)) {
                    this.inventoryManager.moveItem(this.sourceIndex, targetIndex);
                }

                slotElement.classList.remove('drag-over');
            }
        } catch (error) {
            console.error('Error in handleDrop:', error);
        }
    }

    handleDragEnd(event) {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            this.draggedItem = null;
            this.sourceIndex = null;
        }

        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        console.log("DragDropManager: Cleaned up event listeners");
    }
}