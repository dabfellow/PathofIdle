import { CONFIG } from '../config/constants.js';
import { randomInt, weightedRandom, randomElement } from '../utils/random.js';

export class LootManager {
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.itemTemplates = this.loadItemTemplates();
    }
    
    loadItemTemplates() {
        return {
            WEAPON: [
                { 
                    name: "Short Sword", 
                    description: "A basic one-handed sword.",
                    icon: "🗡️", 
                    slot: "mainHand",
                    baseValue: 10,
                    stats: { strength: 2, attackSpeed: 1.0 }
                },
                { 
                    name: "Dagger", 
                    description: "Quick but weak. Good for rogues.",
                    icon: "🔪", 
                    slot: "mainHand",
                    baseValue: 8,
                    stats: { dexterity: 3, attackSpeed: 1.5 }
                },
                { 
                    name: "Battle Axe", 
                    description: "A heavy two-handed axe.",
                    icon: "🪓", 
                    slot: "mainHand",
                    baseValue: 15,
                    stats: { strength: 4, attackSpeed: 0.7 }
                },
                { 
                    name: "Staff", 
                    description: "A magical staff for spellcasters.",
                    icon: "🧙‍♂️", 
                    slot: "mainHand",
                    baseValue: 12,
                    stats: { intelligence: 3, attackSpeed: 0.9 }
                },
                { 
                    name: "Brutal Axe", 
                    description: "A heavy axe that deals massive damage.",
                    icon: "🪓", 
                    slot: "mainHand",
                    baseValue: 20,
                    stats: { strength: 5, attackSpeed: 0.8 }
                }
            ],
            ARMOR: [
                { 
                    name: "Leather Cap", 
                    description: "Basic head protection made of leather.",
                    icon: "🧢", 
                    slot: "head",
                    baseValue: 5,
                    stats: { defense: 1 }
                },
                { 
                    name: "Cloth Robe", 
                    description: "A simple cloth robe.",
                    icon: "👘", 
                    slot: "chest",
                    baseValue: 8,
                    stats: { intelligence: 2 }
                },
                { 
                    name: "Leather Boots", 
                    description: "Comfortable boots for long journeys.",
                    icon: "👢", 
                    slot: "boots",
                    baseValue: 6,
                    stats: { dexterity: 1 }
                }
            ],
            ACCESSORY: [
                { 
                    name: "Gold Ring", 
                    description: "A simple gold ring. Looks fancy.",
                    icon: "💍", 
                    slot: "ringLeft",
                    baseValue: 15,
                    stats: { luck: 2 }
                },
                { 
                    name: "Amulet of Wisdom", 
                    description: "Enhances the wearer's magical abilities.",
                    icon: "📿", 
                    slot: "amulet",
                    baseValue: 18,
                    stats: { intelligence: 3 }
                }
            ]
        };
    }
    
    generateItem(rarity = "COMMON") {
        try {
            // Select item type (weapon, armor, accessory)
            const itemType = this.selectItemType();
            console.log("Item type selected:", itemType);
            
            // Select rarity if not provided
            rarity = rarity || this.selectItemRarity();
            console.log("Item rarity selected:", rarity);
            
            // Select a random item template of this type
            const templates = this.itemTemplates[itemType];
            if (!templates || templates.length === 0) {
                console.error("No templates available for item type:", itemType);
                return null;
            }
            
            const template = randomElement(templates);
            console.log("Selected template:", template.name);
            
            // Create a new item based on this template
            const item = this.createItemFromTemplate(template, rarity);
            console.log("Generated item:", item.name + (item.rarity ? ` (${item.rarity})` : ''));
            
            return item;
        } catch (error) {
            console.error("Error generating item:", error);
            return null;
        }
    }
    
    selectItemType() {
        const typeWeights = {
            WEAPON: 50,
            ARMOR: 40,
            ACCESSORY: 10
        };
        
        return weightedRandom(typeWeights);
    }
    
    selectItemRarity() {
        const rarityWeights = {
            COMMON: 70,
            MAGIC: 20,
            RARE: 8,
            UNIQUE: 2
        };
        
        return weightedRandom(rarityWeights);
    }
    
    createItemFromTemplate(template, rarity) {
        // Create a new item object with a unique ID
        const item = {
            ...template,
            id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
            type: template.type || this.getTypeFromTemplate(template),
            rarity: rarity,
            stats: { ...template.stats }  // Clone stats to avoid modifications
        };
        
        // Apply rarity bonuses
        this.applyRarityBonuses(item, rarity);
        
        // Add any special affixes based on rarity
        this.addItemAffixes(item, rarity);
        
        return item;
    }
    
    getTypeFromTemplate(template) {
        if (template.slot === 'mainHand' || template.slot === 'offHand') {
            return 'WEAPON';
        } else if (template.slot === 'head' || template.slot === 'chest' || template.slot === 'legs' || template.slot === 'boots' || template.slot === 'gloves') {
            return 'ARMOR';
        } else {
            return 'ACCESSORY';
        }
    }
    
    applyRarityBonuses(item, rarity) {
        const rarityMultipliers = {
            COMMON: 1.0,
            MAGIC: 1.3,
            RARE: 1.6,
            UNIQUE: 2.0
        };
        
        const multiplier = rarityMultipliers[rarity] || 1.0;
        
        // Increase stats based on rarity
        for (const [stat, value] of Object.entries(item.stats)) {
            item.stats[stat] = Math.round(value * multiplier * 10) / 10;
        }
        
        // Increase item value
        item.baseValue = Math.round(item.baseValue * multiplier);
    }
    
    addItemAffixes(item, rarity) {
        // More complex affix system would go here
        // For now, just add a simple bonus based on rarity
        
        if (rarity === 'MAGIC' || rarity === 'RARE' || rarity === 'UNIQUE') {
            // Add 1 random affix for magic items
            this.addRandomAffix(item);
        }
        
        if (rarity === 'RARE' || rarity === 'UNIQUE') {
            // Add another random affix for rare items
            this.addRandomAffix(item);
        }
        
        if (rarity === 'UNIQUE') {
            // Add a special property for unique items
            this.addSpecialProperty(item);
        }
    }
    
    addRandomAffix(item) {
        const possibleAffixes = {
            vitality: { min: 1, max: 3 },
            strength: { min: 1, max: 3 },
            dexterity: { min: 1, max: 3 },
            intelligence: { min: 1, max: 3 },
            critChance: { min: 1, max: 5 },
            attackSpeed: { min: 0.1, max: 0.2 }
        };
        
        // Pick a random stat that doesn't already exist on the item
        const availableStats = Object.keys(possibleAffixes).filter(stat => 
            !item.stats[stat] || item.stats[stat] <= 0
        );
        
        if (availableStats.length > 0) {
            const selectedStat = randomElement(availableStats);
            const affixRange = possibleAffixes[selectedStat];
            
            // Generate a random value within the range
            const value = selectedStat === 'attackSpeed'
                ? Math.round((Math.random() * (affixRange.max - affixRange.min) + affixRange.min) * 100) / 100
                : randomInt(affixRange.min, affixRange.max);
                
            // Add to item stats
            item.stats[selectedStat] = (item.stats[selectedStat] || 0) + value;
        }
    }
    
    addSpecialProperty(item) {
        // This method adds a unique property to a unique-rarity item
        const specialProperties = {
            "mainHand": [
                { name: "Vampiric", effect: { lifeSteal: 5 }, description: "Heals you for 5% of damage dealt" },
                { name: "Fiery", effect: { fireDamage: 3 }, description: "Deals 3 fire damage on hit" },
                { name: "Swift", effect: { attackSpeed: 0.3 }, description: "Increases attack speed by 30%" }
            ],
            "armor": [
                { name: "Sturdy", effect: { damageReduction: 5 }, description: "Reduces damage taken by 5%" },
                { name: "Resilient", effect: { healthRegen: 2 }, description: "Regenerates 2 health every 5 seconds" },
                { name: "Reflective", effect: { damageReturn: 10 }, description: "Returns 10% of damage to attacker" }
            ],
            "accessory": [
                { name: "Lucky", effect: { findGold: 15 }, description: "Increases gold drops by 15%" },
                { name: "Insightful", effect: { expGain: 10 }, description: "Increases experience gained by 10%" },
                { name: "Fortunate", effect: { itemRarity: 5 }, description: "Increases chance of rare item drops by 5%" }
            ]
        };
        
        // Determine item category
        let category;
        if (item.slot === 'mainHand' || item.slot === 'offHand') {
            category = "mainHand";
        } else if (item.slot === 'head' || item.slot === 'chest' || item.slot === 'legs' || item.slot === 'gloves' || item.slot === 'boots') {
            category = "armor";
        } else {
            category = "accessory";
        }
        
        // Select a random special property for this category
        const propertyOptions = specialProperties[category] || specialProperties.accessory;
        const selectedProperty = randomElement(propertyOptions);
        
        // Apply the special property to the item
        const propertyName = selectedProperty.name;
        item.name = `${propertyName} ${item.name}`;
        item.description = `${item.description} ${selectedProperty.description}`;
        
        // Add special effects to stats
        for (const [effectType, effectValue] of Object.entries(selectedProperty.effect)) {
            item.stats[effectType] = (item.stats[effectType] || 0) + effectValue;
        }
        
        item.specialProperty = selectedProperty;
    }
    
    addLootToInventory(item) {
        console.log("Attempting to add loot to inventory:", item);
        
        if (!this.inventoryManager) {
            console.error("No inventory manager available to add loot");
            return false;
        }
        
        const success = this.inventoryManager.addItem(item);
        
        if (success) {
            console.log(`Added ${item.name} to inventory`);
            return true;
        } else {
            console.log("Failed to add item to inventory - inventory full?");
            return false;
        }
    }
}
