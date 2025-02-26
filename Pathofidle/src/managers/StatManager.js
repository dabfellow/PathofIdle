import { updateStats, calculateHealth } from '../utils/math.js';

export class StatManager {
    constructor(character) {
        this.character = character;
        this.availablePoints = 0;
        this.initialized = false;
        this.buttonHandlers = new Set();
    }

    initialize() {
        try {
            if (this.initialized) {
                return true;
            }

            console.log('Initializing StatManager');
            this.initCharacterStats();
            
            // Add a small delay to ensure DOM elements are ready
            setTimeout(() => {
                this.setupEventListeners();
                this.updateStatsDisplay();
                console.log('StatManager fully initialized');
            }, 100);
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize StatManager:', error);
            return false;
        }
    }

    initCharacterStats() {
        // Calculate available points based on level
        if (!this.character.spentPoints) {
            this.character.spentPoints = {
                strength: 0,
                dexterity: 0,
                intelligence: 0,
                vitality: 0,
                luck: 0
            };
        }

        // Set base stats if they don't exist
        if (!this.character.baseStrength) this.character.baseStrength = 5;
        if (!this.character.baseDexterity) this.character.baseDexterity = 5;
        if (!this.character.baseIntelligence) this.character.baseIntelligence = 5;
        if (!this.character.baseVitality) this.character.baseVitality = 5;
        if (!this.character.baseLuck) this.character.baseLuck = 3;
        
        // Calculate total available points based on level and spent points
        const totalPointsFromLevel = this.character.level * 3;
        const totalSpentPoints = this.getTotalSpentPoints();
        
        this.availablePoints = Math.max(0, totalPointsFromLevel - totalSpentPoints);
        
        // Update the UI with available points
        this.updateAvailablePointsDisplay();
    }

    getTotalSpentPoints() {
        if (!this.character.spentPoints) return 0;
        return Object.values(this.character.spentPoints).reduce((a, b) => a + b, 0);
    }

    setupEventListeners() {
        console.log('Setting up attribute button listeners');
        
        // Clean up existing handlers
        this.buttonHandlers.forEach(handler => {
            if (handler && typeof handler.cleanup === 'function') {
                handler.cleanup();
            }
        });
        this.buttonHandlers.clear();
        
        // Find all attribute buttons
        const buttons = document.querySelectorAll('.attribute-button');
        console.log(`Found ${buttons.length} attribute buttons`);
        
        if (buttons.length === 0) {
            console.error('No attribute buttons found in DOM');
            return;
        }
        
        // Add click handlers to each attribute button - using direct inline functions for reliability
        buttons.forEach(button => {
            const attribute = button.dataset.attribute;
            console.log(`Setting up listener for ${attribute} button`);
            
            // Use a direct click handler instead of replacing elements
            const clickHandler = () => {
                console.log(`${attribute} button clicked`);
                this.increaseAttribute(attribute);
            };
            
            // Remove existing listeners then add new one
            button.removeEventListener('click', clickHandler);
            button.addEventListener('click', clickHandler);
            
            this.buttonHandlers.add({
                cleanup: () => button.removeEventListener('click', clickHandler)
            });
        });
    }
    
    increaseAttribute(attribute) {
        console.log(`Attempting to increase ${attribute}`);
        
        if (this.availablePoints <= 0) {
            console.log('No attribute points available');
            this.showMessage('No attribute points available');
            return false;
        }
        
        const validAttributes = ['strength', 'dexterity', 'intelligence', 'vitality', 'luck'];
        if (!validAttributes.includes(attribute)) {
            console.error(`Invalid attribute: ${attribute}`);
            return false;
        }
        
        // Increase spent points for this attribute
        if (!this.character.spentPoints) {
            this.character.spentPoints = {};
        }
        
        if (!this.character.spentPoints[attribute]) {
            this.character.spentPoints[attribute] = 0;
        }
        
        this.character.spentPoints[attribute] += 1;
        this.availablePoints -= 1;
        
        // Update the base attribute value
        const baseAttributeProperty = `base${attribute.charAt(0).toUpperCase() + attribute.slice(1)}`;
        if (typeof this.character[baseAttributeProperty] !== 'undefined') {
            this.character[baseAttributeProperty] += 1;
            console.log(`Increased ${baseAttributeProperty} to ${this.character[baseAttributeProperty]}`);
        }
        
        // Update character stats
        updateStats(this.character);
        
        // If vitality was increased, recalculate health
        if (attribute === 'vitality') {
            const oldMaxHealth = this.character.maxHealth || 0;
            this.character.maxHealth = calculateHealth(this.character);
            
            // Increase current health proportionally
            if (oldMaxHealth > 0) {
                const healthRatio = this.character.health / oldMaxHealth;
                this.character.health = Math.floor(healthRatio * this.character.maxHealth);
            } else {
                this.character.health = this.character.maxHealth;
            }
        }
        
        // Show success message
        this.showMessage(`Increased ${attribute} by 1!`, 'success');
        
        // Update the UI
        this.updateStatsDisplay();
        this.updateAvailablePointsDisplay();
        
        console.log(`Successfully increased ${attribute} by 1`);
        return true;
    }
    
    updateStatsDisplay() {
        // Ensure character stats are up to date
        if (!this.character.stats) {
            updateStats(this.character);
        }
        
        const stats = this.character.stats || {};
        console.log('Updating stats display with:', stats);
        
        // Update each attribute display element
        const strengthEl = document.querySelector('.strength');
        if (strengthEl) {
            strengthEl.textContent = `Strength: ${stats.strength || 0}`;
        }
        
        const dexterityEl = document.querySelector('.dexterity');
        if (dexterityEl) {
            dexterityEl.textContent = `Dexterity: ${stats.dexterity || 0}`;
        }
        
        const intelligenceEl = document.querySelector('.intelligence');
        if (intelligenceEl) {
            intelligenceEl.textContent = `Intelligence: ${stats.intelligence || 0}`;
        }
        
        const vitalityEl = document.querySelector('.vitality');
        if (vitalityEl) {
            vitalityEl.textContent = `Vitality: ${stats.vitality || 0}`;
        }
        
        const luckEl = document.querySelector('.luck');
        if (luckEl) {
            luckEl.textContent = `Luck: ${stats.luck || 0}`;
        }
        
        // Update derived stats
        const damageEl = document.querySelector('.damage');
        if (damageEl) {
            damageEl.textContent = `Damage: ${stats.damageMin || 0}-${stats.damageMax || 0}`;
        }
        
        const critChanceEl = document.querySelector('.crit-chance');
        if (critChanceEl) {
            critChanceEl.textContent = `Crit Chance: ${stats.critChance || 0}%`;
        }
        
        const attackSpeedEl = document.querySelector('.attack-speed');
        if (attackSpeedEl) {
            attackSpeedEl.textContent = `Attack Speed: ${stats.attackSpeed || 1.0}`;
        }
        
        const defenseEl = document.querySelector('.defense');
        if (defenseEl) {
            defenseEl.textContent = `Defense: ${stats.defense || 0}`;
        }
        
        // Update health and experience
        const healthEl = document.querySelector('.health');
        if (healthEl) {
            healthEl.textContent = `Health: ${this.character.health}/${this.character.maxHealth}`;
        }
        
        const levelEl = document.querySelector('.level');
        if (levelEl) {
            levelEl.textContent = `Level: ${this.character.level}`;
        }
        
        // Update experience display
        const expElement = document.querySelector('.experience');
        if (expElement) {
            const nextLevelExp = Math.floor(100 * this.character.level * this.character.level);
            expElement.textContent = `Experience: ${Math.floor(this.character.experience)}/${nextLevelExp}`;
        }
        
        // Add a subtle animation to show changes
        document.querySelectorAll('.attributes .attribute p').forEach(el => {
            el.classList.add('stat-updated');
            setTimeout(() => el.classList.remove('stat-updated'), 1000);
        });
    }
    
    updateAvailablePointsDisplay() {
        const pointsElement = document.querySelector('.available-points');
        if (pointsElement) {
            pointsElement.textContent = `Available Points: ${this.availablePoints}`;
            
            // Highlight if there are points to spend
            if (this.availablePoints > 0) {
                pointsElement.classList.add('points-available');
            } else {
                pointsElement.classList.remove('points-available');
            }
        }
    }
    
    showMessage(message, type = 'info', duration = 3000) {
        // Create a floating message element
        const messageElement = document.createElement('div');
        messageElement.className = `game-message ${type}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            messageElement.classList.remove('visible');
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }, duration);
    }
    
    recalculateStats() {
        updateStats(this.character);
        this.updateStatsDisplay();
    }
    
    cleanup() {
        // Clean up event listeners
        this.buttonHandlers.forEach(handler => handler.cleanup());
        this.buttonHandlers.clear();
        console.log('StatManager cleanup complete');
    }
}
