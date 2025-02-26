import { calculateDamage } from '../utils/math.js';

export class CombatManager {
    constructor(gameState, enemyManager) {
        this.gameState = gameState;
        this.enemyManager = enemyManager;
        this.autoAttackInterval = null;
        this.autoAttackDelay = 1000; // 1 second between auto-attacks
        this.isAutoAttacking = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Manual attack button - try multiple selectors for robustness
        const attackButton = document.querySelector('#attack-button') || 
                             document.querySelector('.attack-button');
                             
        if (attackButton) {
            console.log('Found attack button, adding listener');
            // Remove any existing listeners first
            const newButton = attackButton.cloneNode(true);
            attackButton.parentNode.replaceChild(newButton, attackButton);
            
            // Add fresh listener
            newButton.addEventListener('click', () => {
                console.log('Attack button clicked');
                this.playerAttack();
            });
        } else {
            console.error('Attack button not found in DOM');
        }

        // Auto-attack toggle
        const autoAttackButton = document.querySelector('.auto-attack-button');
        if (autoAttackButton) {
            // Remove any existing listeners first
            const newAutoButton = autoAttackButton.cloneNode(true);
            autoAttackButton.parentNode.replaceChild(newAutoButton, autoAttackButton);
            
            // Add fresh listener
            newAutoButton.addEventListener('click', () => {
                console.log('Auto-attack button clicked');
                this.toggleAutoAttack();
            });
        } else {
            console.error('Auto-attack button not found in DOM');
        }

        // Keyboard controls (spacebar for attack)
        const keyHandler = (event) => {
            if (event.code === 'Space') {
                this.playerAttack();
                event.preventDefault();
            }
        };
        
        document.removeEventListener('keydown', keyHandler);
        document.addEventListener('keydown', keyHandler);
        
        console.log('Combat event listeners set up');
        
        // Initialize attack indicators
        this.updateAttackIndicator('player', 0);
        this.updateAttackIndicator('enemy', 0);
    }

    toggleAutoAttack() {
        if (this.isAutoAttacking) {
            this.stopAutoAttack();
        } else {
            this.startAutoAttack();
        }
    }

    startAutoAttack() {
        if (this.autoAttackInterval) return;
        
        this.isAutoAttacking = true;
        this.updateAutoAttackButton(true);
        
        // Start auto-attacking
        this.playerAttack();
        this.autoAttackInterval = setInterval(() => {
            this.playerAttack();
        }, this.autoAttackDelay);
        
        console.log('Auto-attack started');
    }

    stopAutoAttack() {
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
            this.autoAttackInterval = null;
        }
        
        this.isAutoAttacking = false;
        this.updateAutoAttackButton(false);
        console.log('Auto-attack stopped');
    }

    updateAutoAttackButton(isActive) {
        const autoAttackButton = document.querySelector('.auto-attack-button');
        if (autoAttackButton) {
            if (isActive) {
                autoAttackButton.classList.add('active');
                autoAttackButton.textContent = 'Stop Auto Attack';
            } else {
                autoAttackButton.classList.remove('active');
                autoAttackButton.textContent = 'Start Auto Attack';
            }
        }
    }

    playerAttack() {
        console.log('Player attack triggered');
        if (!this.enemyManager.currentEnemy || this.enemyManager.currentEnemy.currentHealth <= 0) {
            // No enemy to attack or enemy is already dead
            console.log('No valid enemy to attack');
            return;
        }

        const character = this.gameState.character;
        const enemy = this.enemyManager.currentEnemy;
        
        // Calculate damage
        const damageResult = calculateDamage(character, enemy);
        console.log('Damage calculated:', damageResult);
        
        // Apply damage to enemy
        enemy.currentHealth = Math.max(0, enemy.currentHealth - damageResult.mitigated);
        
        // Update enemy UI
        this.enemyManager.updateEnemyUI();
        
        // Add combat log entry
        const logMessage = damageResult.critical 
            ? `Critical hit! You dealt ${damageResult.mitigated} damage to ${enemy.name}!` 
            : `You dealt ${damageResult.mitigated} damage to ${enemy.name}.`;
        
        this.enemyManager.addCombatLogEntry(logMessage, damageResult.critical ? 'critical' : 'player-attack');
        
        // Add visual effect for the attack
        this.showAttackEffect('player', damageResult.mitigated, damageResult.critical);
        
        // Check if enemy is defeated
        if (enemy.currentHealth <= 0) {
            this.handleEnemyDefeat(enemy);
        }
        
        // Reset player attack indicator
        this.updateAttackIndicator('player', 0);
        
        // Add new time tracking for player cooldown
        character.lastAttackTime = Date.now();
    }

    showAttackEffect(attacker, damage, isCritical = false) {
        // Determine which side is attacking and being hit
        const isPlayerAttacking = attacker === 'player';
        const attackerElement = isPlayerAttacking ? '.player-portrait' : '.enemy-portrait';
        const targetElement = isPlayerAttacking ? '.enemy-portrait' : '.player-portrait';
        
        // Add hit effect to target
        const target = document.querySelector(targetElement);
        if (target) {
            target.classList.add('hit');
            setTimeout(() => target.classList.remove('hit'), 300);
        }
        
        // Show damage text
        const damageText = document.createElement('div');
        damageText.textContent = damage;
        damageText.classList.add('damage-text');
        damageText.classList.add(isPlayerAttacking ? 'enemy-damage' : 'player-damage');
        
        if (isCritical) {
            damageText.classList.add('critical');
            damageText.textContent = `${damage} CRIT!`;
        }
        
        // Position the damage text
        damageText.style.top = `${Math.random() * 30 + 35}%`;
        damageText.style.left = isPlayerAttacking ? `${Math.random() * 20 + 70}%` : `${Math.random() * 20 + 10}%`;
        
        // Add to combat effects container
        const effectsContainer = document.querySelector('.combat-effects');
        if (effectsContainer) {
            effectsContainer.appendChild(damageText);
            
            // Clean up after animation
            setTimeout(() => damageText.remove(), 1000);
        }
        
        // Create hit spark
        const spark = document.createElement('div');
        spark.classList.add('hit-spark');
        spark.classList.add('active');
        
        // Position the spark
        spark.style.top = isPlayerAttacking ? '60%' : '40%';
        spark.style.left = isPlayerAttacking ? '70%' : '30%';
        
        // Add to effects container
        if (effectsContainer) {
            effectsContainer.appendChild(spark);
            
            // Clean up after animation
            setTimeout(() => spark.remove(), 500);
        }
    }

    enemyAttack() {
        // ...existing enemy attack code...
        
        // Update to use our new effect method
        this.showAttackEffect('enemy', damageResult.mitigated, damageResult.critical);
        
        // Reset enemy attack indicator
        this.updateAttackIndicator('enemy', 0);
        
        // ...rest of existing code...
    }

    updateHealthBars() {
        // Update player health bar
        const playerHealthBar = document.getElementById('player-health-bar-fill');
        const playerHealthText = document.querySelector('.player-health');
        
        if (playerHealthBar) {
            const healthPercent = (this.gameState.character.health / this.gameState.character.maxHealth) * 100;
            playerHealthBar.style.width = `${healthPercent}%`;
        }
        
        if (playerHealthText) {
            playerHealthText.textContent = `Health: ${this.gameState.character.health}/${this.gameState.character.maxHealth}`;
        }
        
        // Update enemy health bar
        const enemyHealthBar = document.getElementById('enemy-health-bar-fill');
        const enemyHealthText = document.querySelector('.enemy-health');
        
        if (enemyHealthBar && this.enemyManager.currentEnemy) {
            const enemy = this.enemyManager.currentEnemy;
            const healthPercent = (enemy.currentHealth / enemy.maxHealth) * 100;
            enemyHealthBar.style.width = `${healthPercent}%`;
        }
        
        if (enemyHealthText && this.enemyManager.currentEnemy) {
            const enemy = this.enemyManager.currentEnemy;
            enemyHealthText.textContent = `Health: ${enemy.currentHealth}/${enemy.maxHealth}`;
        }
    }

    handleEnemyDefeat(enemy) {
        // Stop auto-attacking
        if (this.isAutoAttacking) {
            this.stopAutoAttack();
        }
        
        // Log defeat message
        this.enemyManager.addCombatLogEntry(`You have defeated ${enemy.name}!`, 'victory');
        
        // Award experience
        this.awardExperience(enemy.experience);
        
        // Generate loot
        this.generateLoot(enemy);
        
        // Generate a new enemy after a short delay
        setTimeout(() => {
            this.enemyManager.updateEnemyForZone(this.enemyManager.currentZone, this.gameState.character.level);
            this.enemyManager.addCombatLogEntry(`A new enemy appears: ${this.enemyManager.currentEnemy.name}`, 'info');
            
            // Restart auto-attack if it was active
            if (this.isAutoAttacking) {
                this.startAutoAttack();
            }
        }, 1000);
    }

    awardExperience(amount) {
        const character = this.gameState.character;
        const oldLevel = character.level;
        
        character.experience += amount;
        
        // Check for level up
        const newLevel = Math.floor(1 + Math.sqrt(character.experience / 100));
        if (newLevel > oldLevel) {
            character.level = newLevel;
            this.handleLevelUp(oldLevel, newLevel);
        }
        
        // Update UI
        this.updateExperienceUI();
        
        // Log experience gain
        this.enemyManager.addCombatLogEntry(`You gained ${amount} experience.`, 'experience');
    }

    handleLevelUp(oldLevel, newLevel) {
        // Update character stats for new level
        const character = this.gameState.character;
        
        // Recalculate stats based on new level
        if (this.gameState.updateStats) {
            this.gameState.updateStats(character);
        }
        
        // Fully heal on level up
        character.health = character.maxHealth;
        
        // Update attribute points
        if (window.gameInstance && window.gameInstance.managers.stats) {
            window.gameInstance.managers.stats.initCharacterStats();
            window.gameInstance.managers.stats.updateStatsDisplay();
        }
        
        // Log level up
        this.enemyManager.addCombatLogEntry(`Level Up! You are now level ${newLevel}!`, 'level-up');
    }

    updateExperienceUI() {
        const expElement = document.querySelector('.experience');
        const character = this.gameState.character;
        
        if (expElement) {
            expElement.textContent = `Level: ${character.level} | XP: ${character.experience}`;
        }
    }

    generateLoot(enemy) {
        // If we have a LootManager, use it to generate loot
        if (this.gameState.lootManager) {
            const loot = this.gameState.lootManager.generateLootFromEnemy(enemy, this.gameState.character.level);
            
            if (loot) {
                this.gameState.lootManager.addLootToInventory(loot);
            }
        }
    }

    // Called from game loop
    update(deltaTime) {
        // Update enemy attack cooldowns and perform attacks if ready
        if (this.enemyManager) {
            this.enemyManager.update(deltaTime);
        }
        
        // Update player cooldown visualization
        const character = this.gameState.character;
        if (character && character.lastAttackTime) {
            const attackCooldown = character.attackCooldown || 1000;
            const timeSinceLastAttack = Date.now() - character.lastAttackTime;
            const cooldownPercentage = Math.min(100, (timeSinceLastAttack / attackCooldown) * 100);
            
            // Update both the bar at bottom and the indicator above player
            this.updateCooldownBar(cooldownPercentage, 'player');
            this.updateAttackIndicator('player', cooldownPercentage);
        }
        
        // Update enemy cooldown visualization
        const enemy = this.enemyManager.currentEnemy;
        if (enemy && enemy.lastAttackTime) {
            const attackCooldown = enemy.attackCooldown || 2000;
            const timeSinceLastAttack = Date.now() - enemy.lastAttackTime;
            const cooldownPercentage = Math.min(100, (timeSinceLastAttack / attackCooldown) * 100);
            
            // Update both the bar at bottom and the indicator above enemy
            this.updateCooldownBar(cooldownPercentage, 'enemy');
            this.updateAttackIndicator('enemy', cooldownPercentage);
        }
    }

    updateCooldownBar(percentage, type) {
        try {
            const elementId = type === 'player' ? 'player-cooldown-bar-fill' : 'enemy-cooldown-bar-fill';
            const cooldownBar = document.getElementById(elementId);
            
            if (cooldownBar) {
                cooldownBar.style.width = `${Math.min(100, percentage)}%`;
            }
        } catch (error) {
            console.error(`Error updating ${type} cooldown bar:`, error);
        }
    }

    updateAttackIndicator(type, percentage) {
        const indicator = document.querySelector(`.${type}-attack-indicator`);
        if (indicator) {
            const fill = indicator.querySelector('.attack-indicator-fill');
            
            if (fill) {
                fill.style.height = `${percentage}%`;
                
                // Add "ready" animation when attack is ready
                if (percentage >= 100) {
                    indicator.classList.add('attack-ready');
                } else {
                    indicator.classList.remove('attack-ready');
                }
            }
        }
    }

    cleanup() {
        // Clean up event listeners and intervals
        if (this.autoAttackInterval) {
            clearInterval(this.autoAttackInterval);
            this.autoAttackInterval = null;
        }
    }
}
