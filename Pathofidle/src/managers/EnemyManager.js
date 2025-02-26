import { CONFIG } from '../config/constants.js';
import { randomInt, weightedRandom, chance, randomElement } from '../utils/random.js';
import { calculateEnemyHealth } from '../utils/math.js';

export class EnemyManager {
    constructor() {
        this.currentEnemy = null;
        this.enemies = [];
        this.enemyTypes = [];
        this.loadEnemyTypes();
    }

    initialize() {
        // Load enemy types if not already loaded
        if (this.enemyTypes.length === 0) {
            this.loadEnemyTypes();
        }
        return true;
    }

    loadEnemyTypes() {
        // Define enemy types with their base stats
        this.enemyTypes = [
            {
                id: 'goblin',
                name: 'Goblin',
                icon: '👺',
                baseHealth: 15,
                baseDamage: 3,
                baseDefense: 1,
                baseSpeed: 1.2,
                dropRates: {
                    gold: 0.9,
                    item: 0.3
                },
                zones: [0, 1]
            },
            {
                id: 'skeleton',
                name: 'Skeleton',
                icon: '💀',
                baseHealth: 20,
                baseDamage: 4,
                baseDefense: 2,
                baseSpeed: 0.9,
                dropRates: {
                    gold: 0.7,
                    item: 0.4
                },
                zones: [0, 1, 2]
            },
            {
                id: 'wolf',
                name: 'Wolf',
                icon: '🐺',
                baseHealth: 18,
                baseDamage: 5,
                baseDefense: 1,
                baseSpeed: 1.5,
                dropRates: {
                    gold: 0.5,
                    item: 0.25
                },
                zones: [0, 1]
            },
            {
                id: 'ogre',
                name: 'Ogre',
                icon: '👹',
                baseHealth: 30,
                baseDamage: 8,
                baseDefense: 3,
                baseSpeed: 0.7,
                dropRates: {
                    gold: 1.0,
                    item: 0.5
                },
                zones: [1, 2]
            },
            {
                id: 'ghost',
                name: 'Ghost',
                icon: '👻',
                baseHealth: 22,
                baseDamage: 6,
                baseDefense: 5,
                baseSpeed: 1.0,
                dropRates: {
                    gold: 0.8,
                    item: 0.45
                },
                zones: [2, 3]
            }
        ];
        console.log(`Loaded ${this.enemyTypes.length} enemy types`);
    }

    generateEnemy(zoneId, playerLevel) {
        try {
            // Filter enemies by zone
            const validEnemies = this.enemyTypes.filter(enemy => 
                enemy.zones.includes(zoneId)
            );
            
            if (validEnemies.length === 0) {
                // Fix the syntax error in the template string
                console.warn(`No enemies found for zone ${zoneId}, using default enemies`);
                return this.generateRandomEnemy(playerLevel);
            }
            
            // Select random enemy from valid types
            const enemyTemplate = validEnemies[Math.floor(Math.random() * validEnemies.length)];
            
            // Calculate level based on zone and player level
            const enemyLevel = Math.max(1, playerLevel + randomInt(-1, 1));
            
            // Calculate stats based on level
            const levelMultiplier = 1 + (enemyLevel * 0.1);
            
            const enemy = {
                id: `${enemyTemplate.id}-${Date.now()}`,
                name: enemyTemplate.name,
                icon: enemyTemplate.icon,
                level: enemyLevel,
                health: Math.round(enemyTemplate.baseHealth * levelMultiplier),
                maxHealth: Math.round(enemyTemplate.baseHealth * levelMultiplier),
                damage: Math.round(enemyTemplate.baseDamage * levelMultiplier),
                defense: Math.round(enemyTemplate.baseDefense * levelMultiplier),
                attackSpeed: enemyTemplate.baseSpeed,
                dropRates: enemyTemplate.dropRates,
                experience: Math.round(10 + (enemyLevel * 5)),
                attackCooldown: 0,
                isDead: false
            };
            
            return enemy;
        } catch (error) {
            console.error('Error generating enemy:', error);
            return this.generateDefaultEnemy();
        }
    }
    
    generateRandomEnemy(playerLevel) {
        const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        return this.generateEnemyFromTemplate(randomEnemy, playerLevel);
    }
    
    generateEnemyFromTemplate(template, playerLevel) {
        const enemyLevel = Math.max(1, playerLevel + randomInt(-1, 1));
        const levelMultiplier = 1 + (enemyLevel * 0.1);
        
        return {
            id: `${template.id}-${Date.now()}`,
            name: template.name,
            icon: template.icon,
            level: enemyLevel,
            health: Math.round(template.baseHealth * levelMultiplier),
            maxHealth: Math.round(template.baseHealth * levelMultiplier),
            damage: Math.round(template.baseDamage * levelMultiplier),
            defense: Math.round(template.baseDefense * levelMultiplier),
            attackSpeed: template.baseSpeed,
            dropRates: template.dropRates,
            experience: Math.round(10 + (enemyLevel * 5)),
            attackCooldown: 0,
            isDead: false
        };
    }
    
    generateDefaultEnemy() {
        return {
            id: `default-${Date.now()}`,
            name: 'Monster',
            icon: '👾',
            level: 1,
            health: 10,
            maxHealth: 10,
            damage: 2,
            defense: 1,
            attackSpeed: 1.0,
            dropRates: {
                gold: 0.5,
                item: 0.2
            },
            experience: 5,
            attackCooldown: 0,
            isDead: false
        };
    }

    updateEnemyForZone(zoneId, playerLevel) {
        try {
            const newEnemy = this.generateEnemy(zoneId, playerLevel);
            this.currentEnemy = newEnemy;
            
            // Make sure the enemy has proper health
            if (!newEnemy.health || newEnemy.health <= 0) {
                newEnemy.health = calculateEnemyHealth(newEnemy.level, newEnemy.baseHealth || 15);
                newEnemy.maxHealth = newEnemy.health;
            }
            
            // Update UI
            this.updateEnemyUI();
            
            console.log(`New enemy spawned: ${newEnemy.name} (Level ${newEnemy.level}) with ${newEnemy.health}/${newEnemy.maxHealth} health`);
            return true;
        } catch (error) {
            console.error('Error updating enemy for zone:', error);
            return false;
        }
    }
    
    updateEnemyUI() {
        if (!this.currentEnemy) return;
        
        const enemyNameElement = document.querySelector('.enemy-name');
        const enemyHealthElement = document.querySelector('.enemy-health');
        const enemyAvatarElement = document.querySelector('.enemy-avatar');
        const enemyHealthBarFill = document.getElementById('enemy-health-bar-fill');
        
        if (enemyNameElement) {
            enemyNameElement.textContent = `${this.currentEnemy.name} Lv.${this.currentEnemy.level}`;
        }
        
        if (enemyHealthElement) {
            enemyHealthElement.textContent = `Health: ${this.currentEnemy.health}/${this.currentEnemy.maxHealth}`;
        }
        
        if (enemyAvatarElement) {
            enemyAvatarElement.textContent = this.currentEnemy.icon;
        }
        
        if (enemyHealthBarFill) {
            const healthPercentage = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
            enemyHealthBarFill.style.width = `${healthPercentage}%`;
        }
        
        // Reset any visual effects
        const enemyElement = document.querySelector('.enemy');
        if (enemyElement) {
            enemyElement.classList.remove('dead', 'hit');
        }
    }
    
    update(deltaTime) {
        if (!this.currentEnemy || this.currentEnemy.isDead) return;
        
        // Update attack cooldown
        if (this.currentEnemy.attackCooldown > 0) {
            this.currentEnemy.attackCooldown -= deltaTime;
        }
    }
    
    damageEnemy(damage) {
        if (!this.currentEnemy || this.currentEnemy.isDead) return { damaged: false };
        
        // Calculate actual damage based on enemy defense
        const actualDamage = Math.max(1, damage - this.currentEnemy.defense);
        this.currentEnemy.health = Math.max(0, this.currentEnemy.health - actualDamage);
        
        // Update UI
        this.updateEnemyHealthUI();
        
        // Check if enemy is defeated
        if (this.currentEnemy.health <= 0) {
            this.currentEnemy.isDead = true;
            this.handleEnemyDeath();
            return { damaged: true, killed: true, damage: actualDamage };
        }
        
        return { damaged: true, killed: false, damage: actualDamage };
    }
    
    updateEnemyHealthUI() {
        if (!this.currentEnemy) return;
        
        const enemyHealthElement = document.querySelector('.enemy-health');
        const enemyHealthBarFill = document.getElementById('enemy-health-bar-fill');
        
        if (enemyHealthElement) {
            enemyHealthElement.textContent = `Health: ${Math.max(0, this.currentEnemy.health)}/${this.currentEnemy.maxHealth}`;
        }
        
        if (enemyHealthBarFill) {
            const healthPercentage = (this.currentEnemy.health / this.currentEnemy.maxHealth) * 100;
            enemyHealthBarFill.style.width = `${Math.max(0, healthPercentage)}%`;
        }
    }
    
    handleEnemyDeath() {
        const enemyElement = document.querySelector('.enemy');
        if (enemyElement) {
            enemyElement.classList.add('dead');
        }
        
        // Additional enemy death effects could be added here
        console.log(`Enemy defeated: ${this.currentEnemy.name}`);
    }
    
    resetEnemy() {
        this.currentEnemy = null;
    }
}

