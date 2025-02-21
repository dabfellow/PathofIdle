// Character stats
let character = {
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    strength: 50,
    dexterity: 0,
    intelligence: 0,
    availablePoints: 1,
    damage: calculateDamage(2, 5),    // Base damage range 2-5
    health: 50,
    maxHealth: 50,
    lastAttackTime: 0,    // When we last attacked
    attackCooldown: 1000,  // 1000 milliseconds = 1 second
    inventory: {
        items: [],
        maxSize: 20,
        equipped: {
            mainHand: null,
            offHand: null,
            head: null,
            chest: null,
            legs: null
        }
    }
};

// Enemy stats
let enemy = {
    level: 1,
    health: 10,
    maxHealth: 10,
    experience: 5,
    damage: calculateDamage(1, 3),    // Base damage range 1-3
    lastAttackTime: 0,
    attackCooldown: 1500,  // 1.5 seconds
    imagePath: 'enemy1.png' // Default image path
};

const enemyTypes = [
    {
        name: 'Zombie',
        health: 10,
        maxHealth: 10,
        experience: 5,
        damage: calculateDamage(1, 3),
        attackCooldown: 1500,
        svgPath: `<svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="lightgreen" />
                    <circle cx="35" cy="40" r="5" fill="black" />
                    <circle cx="65" cy="40" r="5" fill="black" />
                    <path d="M 40 60 Q 50 70, 60 60" stroke="black" stroke-width="3" fill="none" />
                  </svg>`
    },
    {
        name: 'Cultist',
        health: 20,
        maxHealth: 20,
        experience: 10,
        damage: calculateDamage(2, 4),
        attackCooldown: 1200,
        svgPath: '<svg>...</svg>' // Replace with actual SVG path for Cultist
    },
    {
        name: 'Moa Creature',
        health: 30,
        maxHealth: 30,
        experience: 15,
        damage: calculateDamage(3, 5),
        attackCooldown: 1000,
        svgPath: '<svg>...</svg>' // Replace with actual SVG path for Moa Creature
    }
];

const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory'
};

const EQUIPMENT_SLOTS = {
    MAIN_HAND: 'mainHand',
    OFF_HAND: 'offHand',
    HEAD: 'head',
    CHEST: 'chest',
    LEGS: 'legs'
};

const RARITY_TYPES = {
    COMMON: { name: 'Common', color: '#ffffff', statMultiplier: 1.0, dropWeight: 100 },
    UNCOMMON: { name: 'Uncommon', color: '#2ecc71', statMultiplier: 1.2, dropWeight: 60 },
    RARE: { name: 'Rare', color: '#3498db', statMultiplier: 1.5, dropWeight: 30 },
    EPIC: { name: 'Epic', color: '#9b59b6', statMultiplier: 2.0, dropWeight: 10 }
};

const ITEM_PREFIXES = {
    weapon: ['Sharp', 'Rusty', 'Ancient', 'Masterwork', 'Deadly'],
    armor: ['Sturdy', 'Broken', 'Reinforced', 'Light', 'Heavy'],
    accessory: ['Mystic', 'Lucky', 'Warrior\'s', 'Swift', 'Wise']
};

const ITEM_BASES = {
    weapon: [
        { name: 'Sword', damage: [3, 7], slot: EQUIPMENT_SLOTS.MAIN_HAND },
        { name: 'Axe', damage: [5, 8], slot: EQUIPMENT_SLOTS.MAIN_HAND },
        { name: 'Shield', damage: [1, 3], slot: EQUIPMENT_SLOTS.OFF_HAND }
    ],
    armor: [
        { name: 'Helmet', defense: [2, 4], slot: EQUIPMENT_SLOTS.HEAD },
        { name: 'Chestplate', defense: [4, 8], slot: EQUIPMENT_SLOTS.CHEST },
        { name: 'Leggings', defense: [3, 6], slot: EQUIPMENT_SLOTS.LEGS }
    ],
    accessory: [
        { name: 'Ring', slot: 'ring' },
        { name: 'Amulet', slot: 'amulet' }
    ]
};

let currentZone = 0;

function updateEnemyForZone(zone) {
    const enemyType = enemyTypes[zone];
    enemy.level = character.level;
    enemy.health = enemyType.health;
    enemy.maxHealth = enemyType.maxHealth;
    enemy.experience = enemyType.experience;
    enemy.damage = enemyType.damage;
    enemy.attackCooldown = enemyType.attackCooldown;
    enemy.svgPath = enemyType.svgPath;
    enemy.name = enemyType.name; // Set the enemy name
    updateEnemy();
}

// Call this function to update the enemy when changing zones
function changeZone(newZone) {
    currentZone = newZone;
    updateEnemyForZone(currentZone);
}

// Calculate damage within a range
function calculateDamage(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate health based on strength
function calculateHealth() {
    let oldMax = character.maxHealth;
    character.maxHealth = 50 + (character.strength * 5);
    character.health = oldMax > 0 ? Math.floor((character.health / oldMax) * character.maxHealth) : character.maxHealth;
}

// Combat functionality
function attack() {
    if (enemy.health <= 0) {
        respawnEnemy();
        return;
    }

    const currentTime = Date.now();
    if (currentTime - character.lastAttackTime < character.attackCooldown) return;

    let damage = calculateDamage(2, 5) + Math.floor(character.strength * 0.5);
    enemy.health -= damage;
    character.lastAttackTime = currentTime;

    updateCombatLog(`You hit the enemy for ${damage} damage!`, 'attack');
    if (enemy.health <= 0) {
        defeatEnemy();
    } else {
        enemyAttack();
    }

    updateStats();
    updateEnemy();
    document.getElementById('attack-button').disabled = true;
    startCooldown(character.attackCooldown, 'player-cooldown-bar-fill', () => {
        document.getElementById('attack-button').disabled = false;
    });
}

// Enemy attacks back
function enemyAttack() {
    const currentTime = Date.now();
    if (currentTime - enemy.lastAttackTime < enemy.attackCooldown) return;

    let damage = calculateDamage(1, 3) + Math.floor(Math.random() * (enemy.level * 0.5));
    character.health = Math.max(0, character.health - damage);
    enemy.lastAttackTime = currentTime;

    updateCombatLog(`The enemy hits you for ${damage} damage!`, 'damage');
    if (character.health <= 0) {
        let expLoss = Math.floor(character.experience * 0.1);
        character.experience = Math.max(0, character.experience - expLoss);
        updateCombatLog(`You died`, 'death');
        character.health = character.maxHealth;
        respawnEnemy();
        updateStats();
    } else {
        updateStats();
        updateEnemy();
    }
}

// Handle enemy defeat
function defeatEnemy() {
    updateCombatLog(`You defeated the enemy and gained ${enemy.experience} experience!`, 'xp-gain');
    gainExperience(enemy.experience);
    
    // Generate loot with 75% chance
    if (Math.random() < 0.75) {
        const loot = generateLoot(enemy.level);
        console.log('Generated loot:', loot); // Debug log
        
        if (addToInventory(loot)) {
            console.log('Current inventory:', character.inventory.items); // Debug log
        }
    }
    
    respawnEnemy();
}

// Respawn enemy with slightly randomized stats
function respawnEnemy() {
    enemy.level = character.level;
    enemy.maxHealth = Math.floor((10 + (enemy.level * 5)) * (0.8 + (Math.random() * 0.4)));
    enemy.health = enemy.maxHealth;
    enemy.experience = 5 + (enemy.level * 2);
    enemy.damage = 1 + Math.floor(enemy.level * 0.5);
    enemy.imagePath = `enemy${Math.floor(Math.random() * 3) + 1}.png`; // Randomly select an image
    updateEnemy();
}

// Experience and leveling
function gainExperience(amount) {
    character.experience += amount;
    if (character.experience >= character.experienceToNextLevel) levelUp();
    updateStats();
}

// Level up system
function levelUp() {
    character.level += 1;
    character.experience -= character.experienceToNextLevel;
    character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5);
    character.availablePoints += 3;
    updateCombatLog(`Level Up! You are now level ${character.level}`, 'level-up');
    updateStats();
}

// Clear the activity log
function clearLog() {
    const logEntries = document.querySelector('.log-entries');
    while (logEntries.firstChild) {
        logEntries.removeChild(logEntries.firstChild);
    }
}

// Filter the activity log
function filterLog() {
    const filter = document.getElementById('log-filter').value;
    const logEntries = document.querySelectorAll('.log-entry');
    logEntries.forEach(entry => {
        if (filter === 'all' || entry.classList.contains(filter)) {
            entry.style.display = '';
        } else {
            entry.style.display = 'none';
        }
    });
}

// Update general log
function updateCombatLog(message, type) {
    const logEntries = document.querySelector('.log-entries');
    const filter = document.getElementById('log-filter').value;
    if (logEntries) {
        const entry = document.createElement('p');
        entry.textContent = message;
        entry.classList.add('log-entry', type);
        
        // Check if the new entry matches the current filter
        if (filter === 'all' || type === filter) {
            entry.style.display = '';
        } else {
            entry.style.display = 'none';
        }
        
        logEntries.insertBefore(entry, logEntries.firstChild);
        while (logEntries.children.length > 50) logEntries.removeChild(logEntries.lastChild);
    }
}

// Update enemy display
function updateEnemy() {
    const enemyHealth = document.querySelector('.enemy-health');
    const enemyImage = document.querySelector('.enemy');
    const enemyName = document.querySelector('.enemy-name'); // Select the enemy name element
    if (enemyHealth) enemyHealth.textContent = `Enemy Health: ${enemy.health}/${enemy.maxHealth}`;
    if (enemyImage) enemyImage.innerHTML = enemy.svgPath;
    if (enemyName) enemyName.textContent = enemy.name; // Update the enemy name
}

// Handle spending attribute points
function allocatePoint(attribute) {
    if (character.availablePoints > 0) {
        character[attribute] += 1;
        character.availablePoints -= 1;
        if (attribute === 'strength') calculateHealth();
        updateStats();
    }
}

// Update stats display
function updateStatsDisplay(className, value) {
    const element = document.querySelector(`.${className}`);
    if (element) element.textContent = value;
}

// Update stats display
function updateStats() {
    updateStatsDisplay('level', `Level: ${character.level}`);
    updateStatsDisplay('experience', `Experience: ${character.experience}/${character.experienceToNextLevel}`);
    updateStatsDisplay('strength', `Strength: ${character.strength}`);
    updateStatsDisplay('dexterity', `Dexterity: ${character.dexterity}`);
    updateStatsDisplay('intelligence', `Intelligence: ${character.intelligence}`);
    updateStatsDisplay('available-points', `Available Points: ${character.availablePoints}`);
    updateStatsDisplay('health', `Health: ${character.health}/${character.maxHealth}`);
}

// Start cooldown
function startCooldown(duration, barId, callback) {
    const cooldownBarFill = document.getElementById(barId);
    cooldownBarFill.style.animation = `cooldown ${duration}ms linear`;
    cooldownBarFill.style.width = '100%';

    setTimeout(() => {
        cooldownBarFill.style.animation = 'none';
        cooldownBarFill.style.width = '0';
        if (callback) callback();
    }, duration);
}

// Game loop for enemy attack cooldown
function gameLoop() {
    const currentTime = Date.now();
    if (currentTime - enemy.lastAttackTime >= enemy.attackCooldown) {
        enemyAttack();
        startCooldown(enemy.attackCooldown, 'enemy-cooldown-bar-fill');
    } else {
        let elapsedTime = currentTime - enemy.lastAttackTime;
        let percentage = Math.min((elapsedTime / enemy.attackCooldown) * 100, 100);
        document.getElementById('enemy-cooldown-bar-fill').style.width = `${100 - percentage}%`;
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Periodically check for enemy attacks
setInterval(enemyAttack, 1000);

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    updateEnemyForZone(currentZone); // Initialize the first enemy
    updateInventoryDisplay();  // This will handle both inventory and equipment
});

function generateLoot(enemyLevel) {
    const rarity = determineRarity();
    const type = randomChoice(Object.values(ITEM_TYPES));
    const base = randomChoice(ITEM_BASES[type]);
    const prefix = randomChoice(ITEM_PREFIXES[type]);

    return {
        id: generateUniqueId(),
        name: `${prefix} ${base.name}`,
        type: type,
        slot: base.slot,
        rarity: rarity.name,
        level: Math.max(1, enemyLevel + randomInt(-2, 2)),
        stats: generateItemStats(base, rarity),
        // Ensure we have all required display properties
        iconPath: `icons/${type}_${base.name.toLowerCase()}.png`
    };
}

function determineRarity() {
    const totalWeight = Object.values(RARITY_TYPES).reduce((sum, rarity) => sum + rarity.dropWeight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const rarity of Object.values(RARITY_TYPES)) {
        if (roll < rarity.dropWeight) return rarity;
        roll -= rarity.dropWeight;
    }
    return RARITY_TYPES.COMMON;
}

function addBonusStats(stats, rarity) {
    const possibleStats = ['strength', 'dexterity', 'intelligence'];
    const numBonusStats = Math.floor(rarity.statMultiplier);
    
    for (let i = 0; i < numBonusStats; i++) {
        const stat = randomChoice(possibleStats);
        const value = randomInt(1, 3) * Math.floor(rarity.statMultiplier);
        stats[stat] = (stats[stat] || 0) + value;
    }
}

function generateItemStats(base, rarity) {
    const stats = {};
    
    if (base.damage) {
        const baseDamage = randomInt(base.damage[0], base.damage[1]);
        stats.damage = Math.round(baseDamage * rarity.statMultiplier);
    }
    if (base.defense) {
        const baseDefense = randomInt(base.defense[0], base.defense[1]);
        stats.defense = Math.round(baseDefense * rarity.statMultiplier);
    }
    
    addBonusStats(stats, rarity);
    return stats;
}

// Utility functions
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Modify the addToInventory function to create draggable items
function addToInventory(item) {
    if (character.inventory.items.length < character.inventory.maxSize) {
        item.id = generateUniqueId();
        character.inventory.items.push(item);
        updateCombatLog(`Added ${item.name} (${item.rarity}) to inventory`, 'loot');
        updateInventoryDisplay();
        return true;
    }
    updateCombatLog('Inventory is full!', 'info');
    return false;
}

function equipItem(itemIndex) {
    const item = character.inventory.items[itemIndex];
    if (!item) return;

    // Unequip current item in that slot if any
    if (character.inventory.equipped[item.slot]) {
        const oldItem = character.inventory.equipped[item.slot];
        character.inventory.items.push(oldItem);
    }

    // Remove item from inventory and equip it
    character.inventory.items.splice(itemIndex, 1);
    character.inventory.equipped[item.slot] = item;

    // Update character stats
    updateCharacterStats();
    updateInventoryDisplay();
}

function unequipItem(slot) {
    const item = character.inventory.equipped[slot];
    if (!item) return;

    if (character.inventory.items.length < character.inventory.maxSize) {
        character.inventory.items.push(item);
        character.inventory.equipped[slot] = null;
        updateCharacterStats();
        updateInventoryDisplay();
    } else {
        updateCombatLog('Inventory is full!', 'info');
    }
}

function updateCharacterStats() {
    // Reset to base stats
    character.damage = calculateDamage(2, 5);
    
    // Add equipped items' stats
    Object.values(character.inventory.equipped).forEach(item => {
        if (!item) return;
        
        // Add item stats
        Object.entries(item.stats).forEach(([stat, value]) => {
            if (stat === 'damage') {
                character.damage += value;
            } else {
                character[stat] = (character[stat] || 0) + value;
            }
        });
    });

    // Recalculate dependent stats
    calculateHealth();
    updateStats();
}

// Add this utility function to find items by ID
function findItemById(itemId) {
    // Check inventory items
    const inventoryItem = character.inventory.items.find(item => item.id === itemId);
    if (inventoryItem) return inventoryItem;

    // Check equipped items
    for (const [slot, item] of Object.entries(character.inventory.equipped)) {
        if (item && item.id === itemId) return item;
    }
    return null;
}

// Replace the existing updateInventoryDisplay with this single version
function updateInventoryDisplay() {
    const inventoryDiv = document.querySelector('.inventory-items');
    if (!inventoryDiv) return;

    // Clear current inventory display
    inventoryDiv.innerHTML = '';

    // Create all inventory slots
    for (let i = 0; i < character.inventory.maxSize; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = i;
        
        // Add item if it exists at this index
        const item = character.inventory.items[i];
        if (item) {
            const itemDiv = document.createElement('div');
            itemDiv.className = `item ${item.rarity.toLowerCase()}`;
            itemDiv.draggable = true;
            itemDiv.dataset.itemId = item.id;
            
            // Update the item display to show all relevant info
            itemDiv.innerHTML = `
                <div class="item-icon">
                    <img src="${item.iconPath}" alt="${item.name}" onerror="this.src='icons/default.png'">
                </div>
                <div class="item-name">${item.name}</div>
                <div class="item-stats">
                    ${Object.entries(item.stats || {})
                        .map(([stat, value]) => `${stat}: ${value}`)
                        .join('<br>')}
                </div>
            `;
            slot.appendChild(itemDiv);
        }
        
        inventoryDiv.appendChild(slot);
    }

    // After updating inventory, make sure to update equipped items
    updateEquippedItems();
    
    // Reinitialize drag and drop
    initializeDragAndDrop();
}

function updateEquippedItems() {
    const equippedDiv = document.querySelector('.equipped-items');
    if (!equippedDiv) return;

    Object.entries(character.inventory.equipped).forEach(([slot, item]) => {
        const slotDiv = equippedDiv.querySelector(`.slot.${slot.toLowerCase()}`);
        if (slotDiv) {
            slotDiv.innerHTML = '';
            if (item) {
                const itemDiv = document.createElement('div');
                itemDiv.className = `item ${item.rarity.toLowerCase()}`;
                itemDiv.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-stats">
                        ${Object.entries(item.stats)
                            .map(([stat, value]) => `${stat}: ${value}`)
                            .join('<br>')}
                    </div>
                `;
                slotDiv.appendChild(itemDiv);
            } else {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'empty-slot';
                emptySlot.textContent = slot.replace(/([A-Z])/g, ' $1').trim();
                slotDiv.appendChild(emptySlot);
            }
        }
    });
}

function initializeDragAndDrop() {
    // Remove DOMContentLoaded wrapper since we call this after elements exist
    const items = document.querySelectorAll('.item');
    const slots = document.querySelectorAll('.inventory-slot, .equipped-slot');
    
    items.forEach(item => {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', JSON.stringify({
        itemId: e.target.dataset.itemId,
        sourceSlot: e.target.parentElement.dataset.slot
    }));
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.drag-over, .valid-target').forEach(el => {
        el.classList.remove('drag-over', 'valid-target');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    if (isValidDropTarget(e.target, e.dataTransfer)) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
    e.target.classList.remove('valid-target');
}

function handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const item = findItemById(data.itemId);
    
    if (isValidDropTarget(e.target, e.dataTransfer)) {
        if (e.target.classList.contains('empty-slot')) {
            equipItem(item, e.target.parentElement.dataset.slot);
        } else {
            moveItemToSlot(item, e.target.dataset.slot);
        }
    }
    
    updateInventoryDisplay();
}

function isValidDropTarget(target, transfer) {
    const draggedItem = JSON.parse(transfer.getData('text/plain'));
    const item = findItemById(draggedItem.itemId);
    
    if (target.classList.contains('empty-slot')) {
        const slotType = target.parentElement.dataset.slot;
        return item.slot === slotType;
    }
    
    return target.classList.contains('inventory-slot');
}

function addToInventory(item) {
    if (character.inventory.items.length < character.inventory.maxSize) {
        character.inventory.items.push(item);
        updateCombatLog(`Added ${item.name} to inventory`, 'info');
        updateInventoryDisplay();
        return true;
    }
    updateCombatLog('Inventory is full!', 'info');
    return false;
}

function generateItemStats(base, rarity) {
    const stats = {};
    
    // Add base stats based on item type
    if (base.damage) {
        const baseDamage = randomInt(base.damage[0], base.damage[1]);
        stats.damage = Math.round(baseDamage * rarity.statMultiplier);
    }
    if (base.defense) {
        const baseDefense = randomInt(base.defense[0], base.defense[1]);
        stats.defense = Math.round(baseDefense * rarity.statMultiplier);
    }
    
    // Add bonus stats based on rarity
    addBonusStats(stats, rarity);
    
    return stats;
}