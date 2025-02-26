/**
 * Utility functions for testing game functionality
 */

// Function to add test items to inventory
export function addTestItems() {
    if (window.gameInstance) {
        const game = window.gameInstance;
        
        // Add a test weapon
        const testWeapon = {
            id: 'test-sword-' + Date.now(),
            name: "Test Sword",
            description: "A sword for testing purposes",
            icon: "🗡️",
            type: "WEAPON",
            rarity: "RARE",
            rarityName: "Rare",
            level: 5,
            stats: {
                damage: 10,
                strength: 3
            }
        };
        
        // Add a test armor
        const testArmor = {
            id: 'test-helmet-' + Date.now(),
            name: "Test Helmet",
            description: "A helmet for testing purposes",
            icon: "⛑️",
            type: "ARMOR",
            rarity: "MAGIC",
            rarityName: "Magic",
            level: 3,
            stats: {
                defense: 5,
                health: 10
            }
        };
        
        // Add items to inventory
        game.managers.inventory.addItem(testWeapon);
        game.managers.inventory.addItem(testArmor);
        
        console.log("Test items added to inventory");
    } else {
        console.error("Game instance not found");
    }
}

// Add a console command for testing
window.addTestItems = addTestItems;
console.log("Test utilities loaded. Type 'addTestItems()' in console to add test items.");
