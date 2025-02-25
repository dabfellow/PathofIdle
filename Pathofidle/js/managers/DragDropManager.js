export class DragDropManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.draggedItem = null;
        this.draggedElement = null;
        this.sourceContainer = null;
        this.sourceIndex = null;
        this.cleanupHandlers = new Set();
        this.setupEventListeners();
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
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleDragStart(event) {
        const itemElement = event.target.closest('.item');
        if (itemElement) {
            this.draggedItem = itemElement;
            event.dataTransfer.setData('text/plain', itemElement.dataset.itemId);
            itemElement.classList.add('dragging');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const slotElement = event.target.closest('.inventory-slot');
        if (slotElement && this.draggedItem) {
            slotElement.classList.add('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const slotElement = event.target.closest('.inventory-slot');
        if (slotElement && this.draggedItem) {
            const fromIndex = this.draggedItem.closest('.inventory-slot').dataset.index;
            const toIndex = slotElement.dataset.index;

            this.inventoryManager.moveItem(fromIndex, toIndex);

            slotElement.classList.remove('drag-over');
        }
    }

    handleDragEnd(event) {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
            this.draggedItem = null;
        }

        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
    }
}