import { CONFIG } from '../constants.js';

export class EnemyManager {
    constructor() {
        this.currentEnemy = null;
        this.enemyTypes = this.initializeEnemyTypes();
        this.currentZone = 0;
        this.cleanupHandlers = new Set();
    }

    initialize() {
        try {
            this.setupEventListeners();
            return true;
        } catch (error) {
            console.error('Failed to initialize EnemyManager:', error);
            return false;
        }
    }

    cleanup() {
        this.cleanupHandlers.forEach(cleanup => cleanup());
        this.cleanupHandlers.clear();
        this.currentEnemy = null;
    }

    initializeEnemyTypes() {
        return [
            {
                id: 'rat',
                name: 'Giant Rat',
                baseHealth: 8,
                baseExperience: 3,
                baseDamage: [1, 2],
                attackCooldown: 2000,
                minZone: 0,
                maxZone: 1,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="50" rx="35" ry="25" fill="gray"/>
                    <circle cx="70" cy="40" r="3" fill="black"/>
                    <path d="M 75 50 Q 85 45, 90 50" stroke="pink" stroke-width="2"/>
                </svg>`
            },
            {
                id: 'zombie',
                name: 'Zombie',
                baseHealth: 15,
                baseExperience: 5,
                baseDamage: [2, 4],
                attackCooldown: 2500,
                minZone: 0,
                maxZone: 2,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="lightgreen"/>
                    <circle cx="35" cy="40" r="5" fill="black"/>
                    <circle cx="65" cy="40" r="5" fill="black"/>
                    <path d="M 40 60 Q 50 70, 60 60" stroke="black" stroke-width="3" fill="none"/>
                </svg>`
            },
            {
                id: 'skeleton',
                name: 'Skeleton Warrior',
                baseHealth: 12,
                baseExperience: 6,
                baseDamage: [3, 5],
                attackCooldown: 1800,
                minZone: 1,
                maxZone: 3,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" stroke="white" stroke-width="4" fill="#e0e0e0"/>
                    <circle cx="40" cy="45" r="4" fill="black"/>
                    <circle cx="60" cy="45" r="4" fill="black"/>
                    <path d="M 40 60 Q 50 65, 60 60" stroke="black" stroke-width="2"/>
                </svg>`
            },
            {
                id: 'goblin',
                name: 'Goblin Scout',
                baseHealth: 10,
                baseExperience: 7,
                baseDamage: [2, 6],
                attackCooldown: 1500,
                minZone: 1,
                maxZone: 3,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="#90EE90"/>
                    <circle cx="40" cy="45" r="5" fill="red"/>
                    <circle cx="60" cy="45" r="5" fill="red"/>
                    <path d="M 40 60 Q 50 55, 60 60" stroke="black" stroke-width="2"/>
                </svg>`
            },
            {
                id: 'orc',
                name: 'Orc Warrior',
                baseHealth: 25,
                baseExperience: 10,
                baseDamage: [4, 8],
                attackCooldown: 2200,
                minZone: 2,
                maxZone: 4,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#228B22"/>
                    <circle cx="35" cy="45" r="6" fill="yellow"/>
                    <circle cx="65" cy="45" r="6" fill="yellow"/>
                    <path d="M 30 60 Q 50 80, 70 60" stroke="black" stroke-width="4"/>
                </svg>`
            },
            {
                id: 'ogre',
                name: 'Ogre Brute',
                baseHealth: 40,
                baseExperience: 15,
                baseDamage: [6, 12],
                attackCooldown: 3000,
                minZone: 3,
                maxZone: 5,
                svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#8B4513"/>
                    <circle cx="35" cy="40" r="7" fill="black"/>
                    <circle cx="65" cy="40" r="7" fill="black"/>
                    <path d="M 30 65 Q 50 85, 70 65" stroke="black" stroke-width="5"/>
                </svg>`
            }
        ];
    }

    // ... existing enemy methods with added error handling ...

    update(delta) {
        try {
            if (!this.currentEnemy) return;
            
            // Update enemy cooldown display and check for attack
            if (this.currentEnemy.lastAttackTime) {
                const timeSinceLastAttack = Date.now() - this.currentEnemy.lastAttackTime;
                const cooldownProgress = (timeSinceLastAttack / this.currentEnemy.attackCooldown) * 100;
                this.updateCooldownBar(cooldownProgress);
                
                // Check if enemy can attack
                if (timeSinceLastAttack >= this.currentEnemy.attackCooldown) {
                    this.attackPlayer();
                }
            } else {
                // Initialize lastAttackTime if it doesn't exist
                this.currentEnemy.lastAttackTime = Date.now();
            }
        } catch (error) {
            console.error('Error in enemy update:', error);
        }
    }

    attackPlayer() {
        try {
            const gameManager = window.gameInstance;
            if (!gameManager) return;
            
            // Calculate random damage within enemy's damage range
            const minDamage = this.currentEnemy.baseDamage[0];
            const maxDamage = this.currentEnemy.baseDamage[1];
            const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
            
            // Apply damage to player
            gameManager.state.character.health = Math.max(0, gameManager.state.character.health - damage);
            
            // Update enemy attack time
            this.currentEnemy.lastAttackTime = Date.now();
            
            // Update UI
            this.updatePlayerHealthDisplay(gameManager.state.character);
            
            // Add log entry
            this.addCombatLogEntry(`${this.currentEnemy.name} attacked for ${damage} damage!`, 'damage');
            
            // Check if player is defeated
            if (gameManager.state.character.health <= 0) {
                this.handlePlayerDefeat();
            }
        } catch (error) {
            console.error('Error during enemy attack:', error);
        }
    }

    updatePlayerHealthDisplay(character) {
        const healthElement = document.querySelector('.health');
        if (healthElement) {
            healthElement.textContent = `Health: ${character.health}/${character.maxHealth}`;
        }
    }

    addCombatLogEntry(message, type) {
        const logEntries = document.querySelector('.log-entries');
        if (logEntries) {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = message;
            logEntries.appendChild(entry);
            logEntries.scrollTop = logEntries.scrollHeight;
        }
    }

    handlePlayerDefeat() {
        // Add defeat log entry
        this.addCombatLogEntry(`You have been defeated by ${this.currentEnemy.name}!`, 'death');
        
        const gameManager = window.gameInstance;
        if (gameManager) {
            // Reset player health to half maximum
            gameManager.state.character.health = Math.floor(gameManager.state.character.maxHealth / 2);
            this.updatePlayerHealthDisplay(gameManager.state.character);
            
            // Generate new enemy
            this.updateEnemyForZone(this.currentZone, gameManager.state.character.level);
            
            // Add respawn log entry
            this.addCombatLogEntry(`You have respawned with ${gameManager.state.character.health} health!`, 'info');
        }
    }

    updateCooldownBar(percentage) {
        const cooldownBar = document.getElementById('enemy-cooldown-bar-fill');
        if (cooldownBar) {
            cooldownBar.style.width = `${Math.min(100, percentage)}%`;
        }
    }

    updateEnemyForZone(zoneIndex, characterLevel) {
        try {
            // Store the current zone
            this.currentZone = zoneIndex;
            
            // Get enemies appropriate for the zone
            const availableEnemies = this.enemyTypes.filter(enemy => 
                enemy.minZone <= zoneIndex && enemy.maxZone >= zoneIndex
            );

            // Select random enemy from available ones, or use first enemy type as fallback
            const selectedEnemy = availableEnemies.length > 0
                ? availableEnemies[Math.floor(Math.random() * availableEnemies.length)]
                : this.enemyTypes[0];

            if (!selectedEnemy) {
                throw new Error('No enemy type available for zone ' + zoneIndex);
            }

            // Ensure numbers are valid
            const baseHealth = Number(selectedEnemy.baseHealth) || 10;
            const baseExperience = Number(selectedEnemy.baseExperience) || 5;
            const level = Number(characterLevel) || 1;
            const zone = Number(zoneIndex) || 0;

            // Calculate enemy stats based on character level and zone
            const health = Math.max(1, Math.floor(baseHealth * 
                (1 + (level * 0.5) + (zone * 0.3))));
            const experience = Math.max(1, Math.floor(baseExperience * 
                (1 + (zone * 0.2))));

            // Create enemy object with validated values
            this.currentEnemy = {
                type: selectedEnemy.id,
                name: selectedEnemy.name,
                maxHealth: health,
                currentHealth: health,
                experience: experience,
                attackCooldown: Number(selectedEnemy.attackCooldown) || 2000,
                lastAttackTime: null,
                svgPath: selectedEnemy.svgPath,
                baseDamage: selectedEnemy.baseDamage
            };

            console.log('Created new enemy:', {
                name: this.currentEnemy.name,
                health: this.currentEnemy.maxHealth,
                experience: this.currentEnemy.experience
            });

            // Update the enemy UI
            this.updateEnemyUI();
            return true;

        } catch (error) {
            console.error('Error creating enemy for zone:', error);
            return false;
        }
    }

    updateEnemyUI() {
        try {
            if (!this.currentEnemy) return;

            // Update enemy name and health
            const nameElement = document.querySelector('.enemy-name');
            const healthElement = document.querySelector('.enemy-health');
            const enemyElement = document.querySelector('.enemy'); // Add this line to properly get the enemy container

            if (nameElement) nameElement.textContent = this.currentEnemy.name;
            if (healthElement) healthElement.textContent = `${this.currentEnemy.currentHealth} / ${this.currentEnemy.maxHealth}`;

            // Update enemy SVG
            if (enemyElement && this.currentEnemy.svgPath) {
                enemyElement.innerHTML = this.currentEnemy.svgPath;
            }
        } catch (error) {
            console.error('Error updating enemy UI:', error);
        }
    }
}

