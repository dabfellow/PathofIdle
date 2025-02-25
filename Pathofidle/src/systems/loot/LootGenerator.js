import { RARITY, calculateRarityChances } from './RaritySystem.js';
import { getBaseItem, getItemsForLevel } from './ItemBases.js';
import { getAvailableAffixes, rollAffixValue } from './Affixes.js';

export class LootGenerator {
    constructor() {
        this.dropRates = calculateRarityChances();
    }

    generateItem(level, luck = 1) {
        // Select base item for level
        const possibleItems = getItemsForLevel(level);
        const baseItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        
        // Roll rarity
        const rarity = this.rollRarity(luck);
        
        // Create item instance
        const item = {
            id: crypto.randomUUID(),
            name: baseItem.name,
            type: baseItem.type,
            slot: baseItem.slot,
            level: baseItem.level,
            rarity: rarity,
            prefixes: [],
            suffixes: [],
            implicit: {...baseItem},
            tags: [...baseItem.tags]
        };

        // Add affixes based on rarity
        if (rarity === 'MAGIC') {
            this.addRandomAffix(item, 'prefix');
            this.addRandomAffix(item, 'suffix');
        } else if (rarity === 'RARE') {
            const prefixCount = Math.floor(Math.random() * 3) + 1; // 1-3 prefixes
            const suffixCount = Math.floor(Math.random() * 3) + 1; // 1-3 suffixes
            
            for (let i = 0; i < prefixCount; i++) {
                this.addRandomAffix(item, 'prefix');
            }
            for (let i = 0; i < suffixCount; i++) {
                this.addRandomAffix(item, 'suffix');
            }
        }

        return item;
    }

    rollRarity(luck) {
        const roll = Math.random();
        let cumulative = 0;

        for (const [rarity, chance] of this.dropRates) {
            cumulative += chance * luck;
            if (roll < cumulative) return rarity;
        }

        return 'NORMAL';
    }

    addRandomAffix(item, type) {
        const availableAffixes = getAvailableAffixes(item, type);
        if (availableAffixes.length === 0) return;

        const affix = availableAffixes[Math.floor(Math.random() * availableAffixes.length)];
        const rolledValue = rollAffixValue(affix);

        if (type === 'prefix') {
            item.prefixes.push({
                id: affix.id,
                name: affix.name,
                effect: rolledValue
            });
        } else {
            item.suffixes.push({
                id: affix.id,
                name: affix.name,
                effect: rolledValue
            });
        }
    }
}
