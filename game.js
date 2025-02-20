// Character stats
let character = {
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    availablePoints: 1,
    damage: calculateDamage(2, 5),    // Base damage range 2-5
    health: 50,
    maxHealth: 50,
    lastAttackTime: 0,    // When we last attacked
    attackCooldown: 1000  // 1000 milliseconds = 1 second
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
});
