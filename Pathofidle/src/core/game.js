import { CONFIG, INITIAL_STATE } from '../config/constants.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { InventoryManager } from '../managers/InventoryManager.js';
import { DragDropManager } from '../managers/DragDropManager.js';
import { InitializationManager } from '../managers/InitializationManager.js';
import { LootManager } from '../managers/LootManager.js';
import { CombatManager } from '../managers/CombatManager.js';
import { StatManager } from '../managers/StatManager.js';
import { updateStats } from '../utils/math.js';

export class Game {
    constructor(initialState = {}) {
        this.state = {
            character: initialState.character || this.createDefaultCharacter(),
            settings: initialState.settings || {},
            lastSave: initialState.lastSave || null,
            gameTime: 0
        };

        this.isRunning = false;
        this.lastUpdateTime = 0;
        this.managers = {};
    }

    createDefaultCharacter() {
        return {
            name: 'Hero',
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            baseStrength: 5,
            baseDexterity: 5,
            baseIntelligence: 5,
            baseVitality: 10,
            baseLuck: 3,
            stats: {}
        };
    }

    async initialize() {
        try {
            console.log('Initializing game...');
            
            // Create managers
            this.managers.inventory = new InventoryManager(this.state.character);
            this.managers.dragDrop = new DragDropManager(this.managers.inventory);
            this.managers.enemy = new EnemyManager();
            
            // Set the dragDrop reference in the inventory manager
            this.managers.inventory.setDragDropManager(this.managers.dragDrop);
            
            // Create initialization manager with needed dependencies
            this.managers.init = new InitializationManager(
                this.state.character,
                this.managers.inventory,
                this.managers.dragDrop,
                this.managers.enemy
            );
            
            // Run initialization
            const initSuccess = await this.managers.init.initialize();
            if (!initSuccess) {
                console.error('Game initialization failed');
                return false;
            }

            // Initialize enemy manager separately to ensure it's ready
            this.managers.enemy.initialize();

            // Create additional managers after initialization
            this.managers.loot = new LootManager(this.managers.inventory);
            this.state.lootManager = this.managers.loot; // Add reference to state for CombatManager
            
            // Create stat manager and initialize it
            this.managers.stats = new StatManager(this.state.character);
            this.managers.stats.initialize();
            
            // Create combat manager last, after all dependencies are ready
            this.managers.combat = new CombatManager(this.state, this.managers.enemy);
            
            // Make the game instance accessible globally
            window.gameInstance = this;
            
            // Add diagnostic information to check DOM structure
            console.log('DOM Structure Check:');
            console.log('- Attack button:', document.querySelector('#attack-button, .attack-button'));
            console.log('- Attribute buttons:', document.querySelectorAll('.attribute-button').length);
            console.log('- Health bar:', document.querySelector('.enemy-health-bar-fill'));
            console.log('- Enemy element:', document.querySelector('.enemy'));
            
            // Start game loop
            this.startGameLoop();
            
            console.log('Game initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing game:', error);
            return false;
        }
    }

    startGameLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        
        // Start the animation frame loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        console.log('Game loop started');
    }

    stopGameLoop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        console.log('Game loop stopped');
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = timestamp;
        
        // Update game time
        this.state.gameTime += deltaTime;
        
        // Update all managers
        this.update(deltaTime);
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        // Update enemy and combat systems
        if (this.managers.enemy) {
            this.managers.enemy.update(deltaTime);
        }
        
        if (this.managers.combat) {
            this.managers.combat.update(deltaTime);
        }
        
        // Add any additional update logic here
    }

    updateStats(character) {
        // Update character stats using utility function
        updateStats(character);
        
        // Update UI if stat manager exists
        if (this.managers.stats) {
            this.managers.stats.updateStatsDisplay();
        }
    }

    saveGame() {
        try {
            const saveData = {
                character: this.state.character,
                settings: this.state.settings,
                lastSave: new Date().toISOString()
            };
            
            localStorage.setItem('pathOfIdleSave', JSON.stringify(saveData));
            console.log('Game saved:', saveData.lastSave);
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const savedData = localStorage.getItem('pathOfIdleSave');
            if (!savedData) {
                console.log('No saved game found');
                return false;
            }
            
            const parsed = JSON.parse(savedData);
            this.state.character = parsed.character || this.state.character;
            this.state.settings = parsed.settings || this.state.settings;
            this.state.lastSave = parsed.lastSave;
            
            console.log('Game loaded from:', this.state.lastSave);
            
            // Reinitialize managers with loaded data
            if (this.managers.inventory) {
                this.managers.inventory.character = this.state.character;
                this.managers.inventory.updateInventoryUI();
            }
            
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            return false;
        }
    }

    cleanup() {
        // Stop the game loop
        this.stopGameLoop();
        
        // Cleanup all managers
        for (const [key, manager] of Object.entries(this.managers)) {
            if (manager && typeof manager.cleanup === 'function') {
                manager.cleanup();
                console.log(`Cleaned up ${key} manager`);
            }
        }
        
        // Remove global reference
        if (window.gameInstance === this) {
            window.gameInstance = null;
        }
        
        console.log('Game cleanup complete');
    }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.initialize();
});