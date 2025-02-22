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
            this.showErrorMessage(error);
            return false;
        }
    }

    async validateRequiredElements() {
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
    }

    async initializeCharacter() {
        try {
            console.log('Initializing character stats...');
            // Initialize character stats
            updateStats();
            calculateHealth();
            return true;
        } catch (error) {
            throw new Error(`Character initialization failed: ${error.message}`);
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
            return true;
        } catch (error) {
            throw new Error(`Inventory grid initialization failed: ${error.message}`);
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
            return true;
        } catch (error) {
            throw new Error(`Equipment slots initialization failed: ${error.message}`);
        }
    }

    async initializeEnemy() {
        try {
            console.log('Initializing enemy...');
            const success = this.enemyManager.updateEnemyForZone(0, this.character.level);
            if (!success) {
                throw new Error('Failed to initialize enemy');
            }
            return true;
        } catch (error) {
            throw new Error(`Enemy initialization failed: ${error.message}`);
        }
    }

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
            return true;
        } catch (error) {
            throw new Error(`Drag and drop initialization failed: ${error.message}`);
        }
    }

    showErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `Initialization Error: ${error.message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}