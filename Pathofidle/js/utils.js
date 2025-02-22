export function calculateDamage(character) {
    // Base damage calculation
    let damage = character.strength * 0.5;
    
    // Add weapon damage if equipped
    if (character.inventory.equipped.mainHand) {
        damage += character.inventory.equipped.mainHand.damage || 0;
    }
    
    // Add random variance (±10%)
    const variance = damage * 0.1;
    damage += Math.random() * variance * 2 - variance;
    
    return Math.max(1, Math.floor(damage));
}

export function calculateHealth(character) {
    // Base health calculation
    let health = 50 + (character.level - 1) * 10;
    
    // Add strength bonus
    health += character.strength * 2;
    
    // Add armor bonus if equipped
    const armorSlots = ['head', 'chest', 'legs'];
    armorSlots.forEach(slot => {
        if (character.inventory.equipped[slot]) {
            health += character.inventory.equipped[slot].health || 0;
        }
    });
    
    return Math.floor(health);
}
