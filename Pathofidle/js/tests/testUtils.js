export function testLootSystem() {
    if (!window.gameInstance) {
        console.error("Game instance not found!");
        return;
    }
    
    const game = window.gameInstance;
    
    if (!game.managers.loot) {
        console.error("Loot manager not found!");
        return;
    }
    
    console.log("Testing loot generation...");
    
    // Create a test enemy
    const testEnemy = {
        name: "Test Enemy",
        level: 5,
        experience: 10
    };
    
    // Generate loot
    const loot = game.managers.loot.generateLootFromEnemy(testEnemy, game.state.character.level);
    
    if (loot) {
        console.log("Loot generated:", loot);
        game.managers.loot.addLootToInventory(loot);
    } else {
        console.log("No loot generated");
    }
}
