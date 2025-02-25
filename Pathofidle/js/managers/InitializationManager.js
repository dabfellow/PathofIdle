import { CONFIG } from '../constants.js';
import { updateStats, calculateHealth } from '../utils.js';

export class InitializationManager {
    constructor(character, inventoryManager, dragDropManager, enemyManager) {
        this.character = character;
        this.inventoryManager = inventoryManager;
        this.dragDropManager = dragDropManager;
        this.enemyManager = enemyManager;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('Starting game initialization...');
            /**
             * The ISO string representation of the current date and time when the initialization starts.
             * @type {string}
             */
            const startTime = new Date().toISOString();

            // Validate required DOM elements
            await this.validateRequiredElements();

            // Initialize in sequence with proper error handling
            await this.initializeCharacter();
            await this.initializeInventory();
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
            const required = {
                inventoryItems: '.inventory-items',
                equippedItems: '.equipped-items',
                enemyContainer: '.enemy-combat',
                statsPanel: '.stats-panel',
                combatLog: '.log-entries'
            };

            const missing = [];
            for (const [key, selector] of Object.entries(required)) {
                if (!document.querySelector(selector)) {
                    missing.push(`${key} (${selector})`);
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
            // Update stats display
            //this.character.updateStatsDisplay();
            //this.character.updateInventoryDisplay();
            //this.character.updateEquipmentDisplay();
            //this.character.updateHealthDisplay();
            //calculateHealth();
            //return true;
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
                slot.dataset.slot = i;
                slot.dataset.type = 'inventory';
                inventoryDiv.appendChild(slot);
            }
            // Apply any saved inventory items
            this.inventoryManager.updateInventoryDisplay();
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
            const equippedDiv = document.querySelector('.equipped-items');
            const slots = equippedDiv.querySelectorAll('.slot');
            // Validate equipment slots
            const requiredSlots = Object.keys(this.character.inventory.equipped);
            if (slots.length !== requiredSlots.length) {
                throw new Error('Mismatch in equipment slot count');
            }
            slots.forEach(slot => {
                if (!requiredSlots.includes(slot.classList[1])) {
                    throw new Error(`Invalid equipment slot: ${slot.classList[1]}`);
                }
                slot.dataset.type = 'equipment';
            });
            this.inventoryManager.updateEquippedItems();
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

    // 

    async initializeDragDrop() {
        try {
            console.log('Setting up drag and drop functionality...');
            if (!this.initialized) {
                document.querySelectorAll('.item').forEach(item => {
                    item.draggable = true;
                });
                // Initialize drag and drop
                this.dragDropManager.initialize();
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