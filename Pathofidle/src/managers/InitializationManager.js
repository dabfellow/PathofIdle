import { CONFIG } from '../config/constants.js';
import { updateStats, calculateHealth } from '../utils/math.js';

export class InitializationManager {
    constructor(character, inventoryManager, dragDropManager, enemyManager) {
        this.character = character;
        this.inventoryManager = inventoryManager;
        this.dragDropManager = dragDropManager;
        this.enemyManager = enemyManager;
        this.initialized = false;
        console.log('InitializationManager constructor called from src/managers path');
    }

    async initialize() {
        try {
            console.log('Starting game initialization...');
            const startTime = new Date().toISOString();

            // Validate required DOM elements
            await this.validateRequiredElements();

            // Initialize in sequence with proper error handling
            await this.initializeCharacter();
            await this.initializeInventory();
            await this.initializeEquipmentSlots(); // Make sure this method is called
            await this.initializeEnemy();
            await this.initializeDragDrop();

            this.initialized = true;
            console.log('Game initialization complete');
            return true;
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showErrorMessage(error, error.initStep || 'unknown');
            return false;
        }
    }

    async validateRequiredElements() {
        try {
            console.log('Validating DOM elements - using updated selectors for the new combat layout');
            
            const required = {
                inventoryItems: '.inventory-items',
                equipmentSlots: '.equipment-slots',
                enemyContainer: '.enemy-side', // Changed from .enemy-combat to match new layout
                characterPanel: '.character-panel',
                combatLog: '.log-entries'
            };

            const missing = [];
            for (const [key, selector] of Object.entries(required)) {
                const element = document.querySelector(selector);
                if (!element) {
                    missing.push(`${key} (${selector})`);
                } else {
                    console.log(`✅ Found ${key}: ${selector}`);
                }
            }

            if (missing.length > 0) {
                throw new Error(`Required elements not found: ${missing.join(', ')}`);
            }
            console.log('✓ All required DOM elements validated successfully');
        } catch (error) {
            error.initStep = 'DOM Validation';
            throw error;
        }
    }

    async initializeCharacter() {
        try {
            console.log('Initializing character stats...');
            // Initialize character stats
            updateStats(this.character);
            this.character.health = Math.floor(calculateHealth(this.character));
            this.character.maxHealth = this.character.health;
            this.character.experience = Math.floor(this.character.experience);
            this.character.level = Math.floor(this.character.level);
            console.log('✓ Character initialization complete');
            return true;
        } catch (error) {
            error.initStep = 'Character Initialization';
            throw error;
        }
    }

    async initializeInventory() {
        try {
            console.log('Setting up inventory grid...');
            const inventoryDiv = document.querySelector('.inventory-items');
            inventoryDiv.innerHTML = '';
            for (let i = 0; i < this.character.inventory.maxSize; i++) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                slot.dataset.index = i; // Use index instead of slot for consistency
                slot.dataset.type = 'inventory';
                inventoryDiv.appendChild(slot);
            }
            // Apply any saved inventory items
            this.inventoryManager.updateInventoryUI();
            console.log('✓ Inventory grid setup complete');
            return true;
        } catch (error) {
            error.initStep = 'Inventory Setup';
            throw error;
        }
    }

    async initializeEquipmentSlots() {
        try {
            console.log('Setting up equipment slots...');
            
            // Use the new equipment-slots class
            const equipmentSlotsContainer = document.querySelector('.equipment-slots');
            
            if (!equipmentSlotsContainer) {
                throw new Error('Equipment slots container not found');
            }
            
            // Get all equipment slots
            const slots = equipmentSlotsContainer.querySelectorAll('.equip-slot');
            console.log(`Found ${slots.length} equipment slots`);
            
            // Update each slot with the appropriate data attributes
            slots.forEach(slot => {
                const slotType = slot.dataset.slot;
                if (slotType) {
                    slot.dataset.type = 'equipment';
                    console.log(`Set up equipment slot: ${slotType}`);
                } else {
                    console.warn('Found equipment slot without data-slot attribute');
                }
            });
            
            // Update equipment display if needed
            if (this.inventoryManager && typeof this.inventoryManager.updateEquippedItems === 'function') {
                this.inventoryManager.updateEquippedItems();
            }
            
            console.log('✓ Equipment slots setup complete');
            return true;
        } catch (error) {
            error.initStep = 'Equipment Setup';
            throw error;
        }
    }

    async initializeEnemy() {
        try {
            console.log('Initializing enemy...');
            const success = this.enemyManager.updateEnemyForZone(0, this.character.level);
            if (!success) {
                throw new Error('Failed to initialize enemy');
            }
            console.log('✓ Enemy initialization complete');
            return true;
        } catch (error) {
            error.initStep = 'Enemy Initialization';
            throw error;
        }
    }

    async initializeDragDrop() {
        try {
            console.log('Setting up drag and drop functionality...');
            if (!this.initialized && this.dragDropManager) {
                document.querySelectorAll('.item').forEach(item => {
                    item.draggable = true;
                });
                // Initialize drag and drop only once
                if (typeof this.dragDropManager.initialize === 'function') {
                    this.dragDropManager.initialize();
                }
            }
            console.log('✓ Drag and drop setup complete');
            return true;
        } catch (error) {
            error.initStep = 'Drag and Drop Setup';
            throw error;
        }
    }

    showErrorMessage(error, step) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        const timestamp = new Date().toLocaleTimeString();
        const errorDetails = `
            <h3>Initialization Error</h3>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Step:</strong> ${step}</p>
            <p><strong>Error:</strong> ${error.message}</p>
            ${error.stack ? `<p><strong>Details:</strong> ${error.stack.split('\n')[0]}</p>` : ''}
            <p>Please try refreshing the page. If the error persists, check the console for more details.</p>
        `;

        errorDiv.innerHTML = errorDetails;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 80%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(errorDiv);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        `;
        closeButton.onclick = () => errorDiv.remove();
        errorDiv.appendChild(closeButton);

        // Auto-remove after 10 seconds
        setTimeout(() => errorDiv.remove(), 10000);
    }
}