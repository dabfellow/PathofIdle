import { CONFIG, INITIAL_STATE } from './constants.js';
import { EnemyManager } from './managers/EnemyManager.js';
import { InventoryManager } from './managers/InventoryManager.js';
import { DragDropManager } from './managers/DragDropManager.js';
import { InitializationManager } from './managers/InitializationManager.js';
import { calculateDamage } from './utils.js';

class GameManager {
    constructor() {
        this.state = { ...INITIAL_STATE };
        this.managers = {
            enemy: null,
            inventory: null,
            dragDrop: null,
            init: null
        };
        this.cleanupHandlers = new Set();
        this.gameLoopId = null;
    }

    async initialize() {
        try {
            console.log('Starting game initialization...');
            
            // Initialize managers
            this.managers.enemy = new EnemyManager();
            this.managers.inventory = new InventoryManager(this.state.character);
            this.managers.dragDrop = new DragDropManager(this.managers.inventory);
            
            this.managers.init = new InitializationManager(
                this.state.character,
                this.managers.inventory,
                this.managers.dragDrop,
                this.managers.enemy
            );

            // Initialize game systems
            const initialized = await this.managers.init.initialize();
            if (!initialized) throw new Error('Game initialization failed');

            this.setupEventListeners();
            this.startGameLoop();
            
            console.log('Game initialization complete');
            return true;
        } catch (error) {
            console.error('Fatal error during game initialization:', error);
            return false;
        }
    }

    cleanup() {
        // Stop game loop
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }

        // Cleanup managers
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.cleanup === 'function') {
                manager.cleanup();
            }
        });

        // Remove event listeners
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();

        // Reset state
        this.state = { ...INITIAL_STATE };
    }

    handleCombat() {
        if (!this.canAttack()) return;
        
        try {
            const damage = calculateDamage(this.state.character);
            const enemy = this.managers.enemy.currentEnemy;
            
            if (!enemy) {
                console.error('No enemy to attack');
                return;
            }

            // Apply damage to enemy
            enemy.currentHealth -= damage;
            
            // Update UI
            this.updateCombatUI(damage);
            
            // Set attack cooldown
            this.state.character.lastAttackTime = Date.now();
            this.startAttackCooldown();

            // Check if enemy is defeated
            if (enemy.currentHealth <= 0) {
                this.handleEnemyDefeat();
            }
        } catch (error) {
            console.error('Combat error:', error);
        }
    }

    canAttack() {
        const now = Date.now();
        const timeSinceLastAttack = now - this.state.character.lastAttackTime;
        return timeSinceLastAttack >= this.state.character.attackCooldown;
    }

    startAttackCooldown() {
        const cooldownBar = document.getElementById('player-cooldown-bar-fill');
        if (!cooldownBar) return;

        cooldownBar.style.animation = 'none';
        cooldownBar.offsetHeight; // Trigger reflow
        cooldownBar.style.animation = `cooldown ${this.state.character.attackCooldown}ms linear`;
    }

    updateCombatUI(damage) {
        const enemy = this.managers.enemy.currentEnemy;
        
        // Update enemy health display
        const enemyHealthElement = document.querySelector('.enemy-health');
        if (enemyHealthElement) {
            enemyHealthElement.textContent = `Enemy Health: ${Math.max(0, enemy.currentHealth)}/${enemy.maxHealth}`;
        }

        // Add combat log entry
        const logEntries = document.querySelector('.log-entries');
        if (logEntries) {
            const logEntry = document.createElement('div');
            logEntry.classList.add('log-entry', 'attack');
            logEntry.textContent = `Player attacked for ${damage} damage.`;
            logEntries.appendChild(logEntry);
            logEntries.scrollTop = logEntries.scrollHeight;
        }
    }

    handleEnemyDefeat() {
        const enemy = this.managers.enemy.currentEnemy;
        
        // Add defeat log entry
        const logEntries = document.querySelector('.log-entries');
        if (logEntries) {
            const defeatEntry = document.createElement('div');
            defeatEntry.classList.add('log-entry', 'death');
            defeatEntry.textContent = `${enemy.name} defeated! Gained ${enemy.experience} experience.`;
            logEntries.appendChild(defeatEntry);
        }

        // Grant experience
        this.grantExperience(enemy.experience);

        // Generate new enemy
        this.managers.enemy.updateEnemyForZone(this.state.currentZone, this.state.character.level);
    }

    grantExperience(amount) {
        this.state.character.experience += amount;
        
        // Check for level up
        if (this.state.character.experience >= this.state.character.experienceToNextLevel) {
            this.levelUp();
        }

        // Update experience display
        const expElement = document.querySelector('.experience');
        if (expElement) {
            expElement.textContent = `Experience: ${this.state.character.experience}/${this.state.character.experienceToNextLevel}`;
        }
    }

    levelUp() {
        this.state.character.level++;
        this.state.character.experience -= this.state.character.experienceToNextLevel;
        this.state.character.experienceToNextLevel = Math.floor(this.state.character.experienceToNextLevel * 1.5);
        this.state.character.availablePoints++;

        // Update level display
        const levelElement = document.querySelector('.level');
        const pointsElement = document.querySelector('.available-points');
        if (levelElement) {
            levelElement.textContent = `Level: ${this.state.character.level}`;
        }
        if (pointsElement) {
            pointsElement.textContent = `Available Points: ${this.state.character.availablePoints}`;
        }

        // Add level up log entry
        const logEntries = document.querySelector('.log-entries');
        if (logEntries) {
            const levelUpEntry = document.createElement('div');
            levelUpEntry.classList.add('log-entry', 'level-up');
            levelUpEntry.textContent = `Level Up! You are now level ${this.state.character.level}`;
            logEntries.appendChild(levelUpEntry);
        }
    }

    // ... existing game methods ...
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const game = new GameManager();
    try {
        const initialized = await game.initialize();
        if (!initialized) throw new Error('Game initialization failed');
        
        // Store game instance for cleanup
        window.gameInstance = game;
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }

    const attackButton = document.getElementById('attack-button');
    const clearLogButton = document.getElementById('clear-log');
    const logFilter = document.getElementById('log-filter');
    const logEntries = document.querySelector('.log-entries');
    const attributeButtons = document.querySelectorAll('.attribute-button');

    // Example: Attack button click event
    attackButton.addEventListener('click', () => {
        game.handleCombat();
    });

    // Example: Clear log button click event
    clearLogButton.addEventListener('click', () => {
        logEntries.innerHTML = '';
    });

    // Example: Log filter change event
    logFilter.addEventListener('change', (event) => {
        const filter = event.target.value;
        // Implement log filtering logic here
        console.log(`Log filter changed to: ${filter}`);
    });

    // Example: Attribute button click event
    attributeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const attribute = event.target.dataset.attribute;
            // Implement attribute increment logic here
            console.log(`Attribute ${attribute} button clicked`);
        });
    });
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    if (window.gameInstance) {
        window.gameInstance.cleanup();
    }
});
