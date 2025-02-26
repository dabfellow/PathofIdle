import { CONFIG } from '../config/constants.js';
import { randomInt, chance, randomElement } from '../utils/random.js';
import { calculateDamage } from '../utils/math.js';

export class CombatManager {
    constructor(gameState, enemyManager) {
        this.state = gameState;
        this.character = gameState.character;
        this.enemyManager = enemyManager;
        this.autoAttackEnabled = false;
        this.autoAttackInterval = null;
        this.playerAttackCooldown = 0;
        this.enemyAttackCooldown = 0;
        this.attackSpeed = 1.0; // Attacks per second
        this.logEntries = [];
        this.maxLogEntries = 50;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Set up attack button
        const attackButton = document.querySelector('#attack-button, .attack-button');
        if (attackButton) {
            attackButton.addEventListener('click', () => {
                console.log("Attack button clicked");
                this.playerAttack();
            });
        } else {
            console.error("Attack button not found in the DOM");
        }

        // Set up auto-attack button
        const autoAttackButton = document.querySelector('.auto-attack-button');
        if (autoAttackButton) {
            autoAttackButton.addEventListener('click', () => {
                this.toggleAutoAttack();
                autoAttackButton.classList.toggle('active');
                autoAttackButton.textContent = this.autoAttackEnabled ? 'Stop Auto' : 'Auto Attack';
            });
        }

        // Clear log button
        const clearLogButton = document.querySelector('#clear-log');
        if (clearLogButton) {
            clearLogButton.addEventListener('click', () => {
                this.clearLog();
            });
        }
    }

    update(deltaTime) {
        // Update cooldowns
        if (this.playerAttackCooldown > 0) {
            this.playerAttackCooldown -= deltaTime;
            this.updateCooldownUI('player', this.playerAttackCooldown);
        }

        if (this.enemyAttackCooldown > 0) {
            this.enemyAttackCooldown -= deltaTime;
            this.updateCooldownUI('enemy', this.enemyAttackCooldown);
        }

        // Check if auto attack is enabled and cooldown is ready
        if (this.autoAttackEnabled && this.playerAttackCooldown <= 0) {
            this.playerAttack();
        }

        // Check if enemy should attack
        if (this.enemyManager.currentEnemy && 
            !this.enemyManager.currentEnemy.isDead && 
            this.enemyAttackCooldown <= 0) {
            this.enemyAttack();
        }
    }

    updateCooldownUI(entity, cooldown) {
        const maxCooldown = entity === 'player' 
            ? this.getPlayerAttackSpeed() 
            : this.getEnemyAttackSpeed();
        
        const percentage = Math.max(0, Math.min(100, (cooldown / maxCooldown) * 100));
        const fillElement = document.getElementById(`${entity}-cooldown-bar-fill`);
        
        if (fillElement) {
            fillElement.style.width = `${100 - percentage}%`;
        }
    }

    playerAttack() {
        console.log("Player attack triggered");
        
        // Check if we can attack
        if (this.playerAttackCooldown > 0) {
            this.addLogEntry("Too soon to attack again!", "info");
            return;
        }

        // Check if there's a valid enemy to attack
        if (!this.enemyManager.currentEnemy || this.enemyManager.currentEnemy.isDead) {
            console.log("No valid enemy to attack");
            this.addLogEntry("No enemy to attack!", "info");
            
            // Try to spawn a new enemy if the current one is dead
            if (!this.enemyManager.currentEnemy || this.enemyManager.currentEnemy.isDead) {
                console.log("Attempting to spawn a new enemy");
                this.enemyManager.updateEnemyForZone(0, this.character.level);
            }
            return;
        }

        // Calculate damage
        const damageInfo = this.calculatePlayerDamage();
        
        // Apply damage to enemy
        const result = this.enemyManager.damageEnemy(damageInfo.damage);
        
        if (result.damaged) {
            // Add hit effect
            this.showHitEffect('enemy');
            
            // Play sound
            // this.playSoundEffect('hit');
            
            // Show damage number
            this.showDamageNumber(result.damage, damageInfo.isCritical);
            
            // Add log entry
            const critText = damageInfo.isCritical ? " Critical hit!" : "";
            this.addLogEntry(`You hit ${this.enemyManager.currentEnemy.name} for ${result.damage} damage.${critText}`, damageInfo.isCritical ? "critical" : "player-attack");
            
            // Check if enemy was killed
            if (result.killed) {
                this.handleEnemyDefeat();
            }
        } else {
            this.addLogEntry("Your attack missed!", "miss");
        }
        
        // Set cooldown for next attack
        this.playerAttackCooldown = this.getPlayerAttackSpeed();
        this.updateCooldownUI('player', this.playerAttackCooldown);
    }

    enemyAttack() {
        if (!this.enemyManager.currentEnemy || this.enemyManager.currentEnemy.isDead || this.character.health <= 0) {
            return;
        }

        // Calculate enemy damage
        const enemyDamage = this.calculateEnemyDamage();
        
        // Apply damage to player
        this.character.health = Math.max(0, this.character.health - enemyDamage);
        
        // Update player health UI
        this.updatePlayerHealthUI();
        
        // Add hit effect
        this.showHitEffect('player');
        
        // Show damage number
        this.showDamageNumber(enemyDamage, false, true);
        
        // Add log entry
        this.addLogEntry(`${this.enemyManager.currentEnemy.name} hits you for ${enemyDamage} damage.`, "damage");
        
        // Check if player is defeated
        if (this.character.health <= 0) {
            this.handlePlayerDefeat();
        }
        
        // Set enemy cooldown
        this.enemyAttackCooldown = this.getEnemyAttackSpeed();
        this.updateCooldownUI('enemy', this.enemyAttackCooldown);
    }

    calculatePlayerDamage() {
        // Get base damage from character stats
        const minDamage = this.character.stats.minDamage || 1;
        const maxDamage = this.character.stats.maxDamage || 3;
        
        // Random damage in range
        let damage = randomInt(minDamage, maxDamage);
        
        // Check for critical hit
        const critChance = this.character.stats.critChance || 5;
        const isCritical = chance(critChance);
        
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }
        
        return {
            damage,
            isCritical
        };
    }

    calculateEnemyDamage() {
        const enemy = this.enemyManager.currentEnemy;
        if (!enemy) return 0;
        
        // Base damage from enemy
        const baseDamage = enemy.damage || 1;
        
        // Apply variation
        const damage = randomInt(Math.floor(baseDamage * 0.8), Math.ceil(baseDamage * 1.2));
        
        // Apply player defense
        const defense = this.character.stats.defense || 0;
        const finalDamage = Math.max(1, damage - defense);
        
        return finalDamage;
    }

    getPlayerAttackSpeed() {
        // Base attack cooldown in seconds
        const baseSpeed = 2.0; 
        
        // Get attack speed modifier from character (higher value = faster attacks)
        const attackSpeedModifier = this.character.stats.attackSpeed || 1.0;
        
        // Calculate actual cooldown (lower value = faster attacks)
        return baseSpeed / attackSpeedModifier;
    }

    getEnemyAttackSpeed() {
        if (!this.enemyManager.currentEnemy) return 2.0;
        
        // Base enemy attack cooldown
        const baseSpeed = 2.5;
        
        // Enemy attack speed modifier
        const attackSpeedModifier = this.enemyManager.currentEnemy.attackSpeed || 1.0;
        
        return baseSpeed / attackSpeedModifier;
    }

    handleEnemyDefeat() {
        const enemy = this.enemyManager.currentEnemy;
        if (!enemy) return;
        
        // Add victory log
        this.addLogEntry(`You have defeated ${enemy.name}!`, "victory");
        
        // Award experience
        this.awardExperience(enemy.experience);
        
        // Generate loot
        this.generateLoot(enemy);
        
        // Update stats
        this.state.enemiesDefeated = (this.state.enemiesDefeated || 0) + 1;
        
        // Wait a moment before spawning a new enemy
        setTimeout(() => {
            // Spawn a new enemy
            if (this.enemyManager && typeof this.enemyManager.updateEnemyForZone === 'function') {
                this.enemyManager.updateEnemyForZone(0, this.character.level);
            }
        }, 1500);
    }

    handlePlayerDefeat() {
        // Handle player death
        this.addLogEntry("You have been defeated!", "death");
        
        // Disable auto attack
        this.setAutoAttack(false);
        
        // Show defeat message
        this.showMessage("You have been defeated! You will respawn in a moment.", "error");
        
        // Respawn after delay
        setTimeout(() => {
            // Restore some health
            this.character.health = Math.floor(this.character.maxHealth * 0.5);
            this.updatePlayerHealthUI();
            
            // Spawn a new enemy
            this.enemyManager.updateEnemyForZone(0, this.character.level);
            
            // Add log entry
            this.addLogEntry("You have respawned.", "info");
        }, 3000);
    }

    awardExperience(amount) {
        const oldLevel = this.character.level;
        
        // Award XP
        this.character.experience += amount;
        
        // Calculate XP needed for next level
        const xpNeeded = Math.floor(100 * Math.pow(1.1, this.character.level - 1));
        
        // Check for level up
        while (this.character.experience >= xpNeeded) {
            this.character.experience -= xpNeeded;
            this.character.level += 1;
            
            // Award stat point
            this.character.availablePoints = (this.character.availablePoints || 0) + 3;
            
            // Recalculate XP needed for next level
            const newXpNeeded = Math.floor(100 * Math.pow(1.1, this.character.level - 1));
            
            // Add log entry
            this.addLogEntry(`Congratulations! You reached level ${this.character.level}!`, "level-up");
        }
        
        // Check if level changed
        if (this.character.level > oldLevel) {
            this.showMessage(`You reached level ${this.character.level}!`, "success");
        }
        
        // Add XP log entry
        this.addLogEntry(`You gained ${amount} experience.`, "experience");
        
        // Update UI
        this.updateExperienceUI();
        
        // Update health if level changed
        if (this.character.level > oldLevel) {
            // Some games increase max health on level up
            const oldMaxHealth = this.character.maxHealth;
            
            // Assuming updateStats is defined elsewhere
            if (window.gameInstance && typeof window.gameInstance.updateStats === 'function') {
                window.gameInstance.updateStats(this.character);
            }
            
            // Heal by the amount of health gained
            if (this.character.maxHealth > oldMaxHealth) {
                this.character.health += (this.character.maxHealth - oldMaxHealth);
            }
            
            this.updatePlayerHealthUI();
        }
    }

    generateLoot(enemy) {
        // Check if the enemy has drop rates defined
        if (!enemy.dropRates) return;
        
        // Roll for gold
        const goldChance = enemy.dropRates.gold || 0.5;
        if (chance(goldChance * 100)) {
            const goldAmount = randomInt(
                enemy.level * 2, 
                enemy.level * 5
            );
            
            // Add gold to character
            this.character.gold = (this.character.gold || 0) + goldAmount;
            
            // Add log entry
            this.addLogEntry(`You found ${goldAmount} gold.`, "loot");
        }
        
        // Roll for items
        const itemChance = enemy.dropRates.item || 0.2;
        if (chance(itemChance * 100)) {
            console.log("Loot roll succeeded! Generating item...");
            
            // Check if we have a LootManager
            if (this.state.lootManager) {
                const itemRarity = this.determineLootRarity();
                const item = this.state.lootManager.generateItem(itemRarity);
                
                if (item) {
                    this.addLogEntry(`${enemy.name} dropped: ${item.name} (${itemRarity})`, "item-drop");
                    this.state.lootManager.addLootToInventory(item);
                }
            }
        }
    }

    determineLootRarity() {
        // Base rarity chances
        const rarityChances = {
            COMMON: 70,
            MAGIC: 20,
            RARE: 8,
            UNIQUE: 2
        };
        
        // Apply luck modifier from character
        const luckModifier = this.character.stats.luck || 0;
        
        // Adjust chances based on luck
        rarityChances.COMMON = Math.max(40, rarityChances.COMMON - luckModifier);
        rarityChances.MAGIC = Math.min(40, rarityChances.MAGIC + (luckModifier * 0.5));
        rarityChances.RARE = Math.min(15, rarityChances.RARE + (luckModifier * 0.3));
        rarityChances.UNIQUE = Math.min(5, rarityChances.UNIQUE + (luckModifier * 0.2));
        
        // Roll for rarity
        const roll = Math.random() * 100;
        
        if (roll < rarityChances.UNIQUE) return "UNIQUE";
        if (roll < rarityChances.UNIQUE + rarityChances.RARE) return "RARE";
        if (roll < rarityChances.UNIQUE + rarityChances.RARE + rarityChances.MAGIC) return "MAGIC";
        return "COMMON";
    }

    showHitEffect(target) {
        const element = target === 'enemy' 
            ? document.querySelector('.enemy') 
            : document.querySelector('.player-portrait');
        
        if (element) {
            element.classList.add('hit');
            setTimeout(() => {
                element.classList.remove('hit');
            }, 300);
        }
    }

    showDamageNumber(amount, isCritical = false, isPlayerDamage = false) {
        const combatEffects = document.querySelector('.combat-effects');
        if (!combatEffects) return;
        
        const damageText = document.createElement('div');
        damageText.className = `damage-text ${isPlayerDamage ? 'player-damage' : 'enemy-damage'} ${isCritical ? 'critical' : ''}`;
        damageText.textContent = amount.toString();
        
        // Position the damage text
        damageText.style.left = isPlayerDamage ? '25%' : '75%';
        damageText.style.top = '40%';
        
        // Add to DOM
        combatEffects.appendChild(damageText);
        
        // Remove after animation
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    }

    addLogEntry(text, type = "info") {
        // Create log entry object
        const entry = {
            text,
            type,
            timestamp: new Date().toLocaleTimeString()
        };
        
        // Add to log entries array
        this.logEntries.unshift(entry);
        
        // Trim array if it's too long
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries.pop();
        }
        
        // Update log UI
        this.updateLogUI();
    }

    updateLogUI() {
        const logContainer = document.querySelector('.log-entries');
        if (!logContainer) return;
        
        // Clear existing entries
        logContainer.innerHTML = '';
        
        // Add all log entries
        for (const entry of this.logEntries) {
            const entryElement = document.createElement('div');
            entryElement.className = `log-entry ${entry.type}`;
            entryElement.textContent = `[${entry.timestamp}] ${entry.text}`;
            
            logContainer.appendChild(entryElement);
        }
    }

    clearLog() {
        this.logEntries = [];
        this.updateLogUI();
    }

    updatePlayerHealthUI() {
        const healthElement = document.querySelector('.player-health');
        const healthBarElement = document.getElementById('player-health-bar-fill');
        
        if (healthElement) {
            healthElement.textContent = `Health: ${Math.max(0, this.character.health)}/${this.character.maxHealth}`;
        }
        
        if (healthBarElement) {
            const healthPercentage = (this.character.health / this.character.maxHealth) * 100;
            healthBarElement.style.width = `${Math.max(0, healthPercentage)}%`;
        }
    }

    updateExperienceUI() {
        const xpElement = document.querySelector('.experience');
        if (!xpElement) return;
        
        const xpNeeded = Math.floor(100 * Math.pow(1.1, this.character.level - 1));
        xpElement.textContent = `Experience: ${Math.floor(this.character.experience)}/${xpNeeded}`;
        
        // Update level UI
        const levelElement = document.querySelector('.level');
        if (levelElement) {
            levelElement.textContent = `Level: ${this.character.level}`;
        }
        
        // Update available points UI
        const pointsElement = document.querySelector('.available-points');
        if (pointsElement) {
            pointsElement.textContent = `Available Points: ${this.character.availablePoints || 0}`;
            
            if ((this.character.availablePoints || 0) > 0) {
                pointsElement.classList.add('points-available');
            } else {
                pointsElement.classList.remove('points-available');
            }
        }
    }

    showMessage(message, type = "info") {
        // Check if there's an existing message element
        let messageElement = document.querySelector('.game-message');
        
        if (!messageElement) {
            // Create new message element
            messageElement = document.createElement('div');
            messageElement.className = 'game-message';
            document.body.appendChild(messageElement);
        }
        
        // Set content and type
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
        
        // Show the message
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);
        
        // Hide after delay
        setTimeout(() => {
            messageElement.classList.remove('visible');
            
            // Remove from DOM after fade
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }, 3000);
    }

    toggleAutoAttack() {
        this.setAutoAttack(!this.autoAttackEnabled);
    }

    setAutoAttack(enabled) {
        this.autoAttackEnabled = enabled;
        
        // Update UI
        const button = document.querySelector('.auto-attack-button');
        if (button) {
            button.classList.toggle('active', enabled);
            button.textContent = enabled ? 'Stop Auto' : 'Auto Attack';
        }
        
        // Log state change
        this.addLogEntry(enabled ? "Auto attack enabled." : "Auto attack disabled.", "info");
    }
}
