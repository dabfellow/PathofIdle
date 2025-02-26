import { CONFIG } from '../config/constants.js';

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

    updateEquippedItems() {
        console.log('Updating equipped items display');
        
        // Clear all equipment slots first
        document.querySelectorAll('.equip-slot').forEach(slot => {
            // Set empty state 
            slot.classList.remove('filled');
            slot.removeAttribute('data-rarity');
            
            // Show the default slot icons
            const slotIcon = slot.querySelector('.slot-icon');
            const slotLabel = slot.querySelector('.slot-label');
            if (slotIcon) slotIcon.style.display = 'block';
            if (slotLabel) slotLabel.style.display = 'block';
            
            // Remove any equipped items
            const itemElement = slot.querySelector('.item');
            if (itemElement) {
                itemElement.remove();
            }
        });
        
        // Display each equipped item
        if (this.character.inventory && this.character.inventory.equipped) {
            Object.entries(this.character.inventory.equipped).forEach(([slotName, item]) => {
                if (!item) return; // Skip empty slots
                
                // Find the corresponding slot element
                const slotElement = document.querySelector(`.equip-slot[data-slot="${slotName}"]`);
                if (slotElement) {
                    // Create and add the item element
                    const itemElement = this.createItemElement(item, true);
                    
                    // Hide default slot icons
                    const slotIcon = slotElement.querySelector('.slot-icon');
                    const slotLabel = slotElement.querySelector('.slot-label');
                    if (slotIcon) slotIcon.style.display = 'none';
                    if (slotLabel) slotLabel.style.display = 'none';
                    
                    // Add the new item
                    slotElement.appendChild(itemElement);
                    slotElement.classList.add('filled');
                    
                    // Add specific class based on item rarity
                    if (item.rarity) {
                        slotElement.setAttribute('data-rarity', item.rarity.toLowerCase());
                    }
                    
                    console.log(`Added ${item.name} to ${slotName} slot`);
                } else {
                    console.warn(`Could not find element for equipment slot: ${slotName}`);
                }
            });
        }
    }

    createItemElement(item, isEquipment = false) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        if (isEquipment) itemElement.classList.add('equipped-item');
        itemElement.dataset.itemId = item.id;
        itemElement.draggable = true;
        
        // Add any rarity classes
        if (item.rarity) {
            itemElement.classList.add(item.rarity.toLowerCase());
        }
        
        // Add icon
        const iconElement = document.createElement('div');
        iconElement.className = isEquipment ? 'equipped-item-icon' : 'item-icon';
        iconElement.textContent = item.icon || '📦';
        itemElement.appendChild(iconElement);
        
        // Add name
        const nameElement = document.createElement('div');
        nameElement.className = isEquipment ? 'equipped-item-name' : 'item-name';
        nameElement.textContent = item.name;
        itemElement.appendChild(nameElement);
        
        // Add tooltip with more details
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'item-tooltip';
        
        // Create tooltip content
        let tooltipContent = `
            <div class="tooltip-header ${item.rarity ? item.rarity.toLowerCase() : ''}">
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

    equipItemFromInventory(inventoryIndex, equipSlot) {
        const item = this.character.inventory.items[inventoryIndex];
        
        if (!item) {
            console.error(`No item found at inventory index ${inventoryIndex}`);
            return false;
        }
        
        // Check if something is already equipped in this slot
        const currentEquipped = this.character.inventory.equipped[equipSlot];
        
        // Swap with current equipped item (if any)
        this.character.inventory.equipped[equipSlot] = item;
        this.character.inventory.items[inventoryIndex] = currentEquipped;
        
        // Update the UI
        this.updateInventoryUI();
        this.updateEquippedItems();
        
        console.log(`Equipped ${item.name} to ${equipSlot}`);
        return true;
    }

    unequipItem(equipSlot, inventoryIndex) {
        const item = this.character.inventory.equipped[equipSlot];
        
        if (!item) {
            console.error(`No item equipped in slot ${equipSlot}`);
            return false;
        }
        
        // Check if the inventory slot is empty
        if (this.character.inventory.items[inventoryIndex]) {
            console.log(`Inventory slot ${inventoryIndex} is not empty, swapping items`);
            const inventoryItem = this.character.inventory.items[inventoryIndex];
            
            // Only swap if the inventory item is compatible with the equipment slot
            if (this.isItemCompatibleWithSlot(inventoryItem, equipSlot)) {
                this.character.inventory.equipped[equipSlot] = inventoryItem;
                this.character.inventory.items[inventoryIndex] = item;
            } else {
                console.log(`Item ${inventoryItem.name} is not compatible with slot ${equipSlot}`);
                return false;
            }
        } else {
            // Just move the equipped item to inventory
            this.character.inventory.items[inventoryIndex] = item;
            this.character.inventory.equipped[equipSlot] = null;
        }
        
        // Update the UI
        this.updateInventoryUI();
        this.updateEquippedItems();
        
        console.log(`Unequipped ${item.name} from ${equipSlot} to inventory slot ${inventoryIndex}`);
        return true;
    }

    moveEquippedItem(fromSlot, toSlot) {
        const fromItem = this.character.inventory.equipped[fromSlot];
        const toItem = this.character.inventory.equipped[toSlot];
        
        if (!fromItem) {
            console.error(`No item equipped in slot ${fromSlot}`);
            return false;
        }
        
        // Swap the items
        this.character.inventory.equipped[toSlot] = fromItem;
        this.character.inventory.equipped[fromSlot] = toItem;
        
        // Update the UI
        this.updateEquippedItems();
        
        console.log(`Moved ${fromItem.name} from ${fromSlot} to ${toSlot}`);
        return true;
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

    clearInventory() {
        this.character.inventory.items = [];
        this.updateInventoryUI();
        console.log("Inventory cleared");
    }
}