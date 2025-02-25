const AFFIXES = {
    prefixes: [
        {
            id: 'strong',
            name: 'Strong',
            stat: 'strength',
            min: 1,
            max: 5,
            tags: ['attack', 'physical']
        },
        {
            id: 'sharp',
            name: 'Sharp',
            stat: 'damage',
            min: 2,
            max: 8,
            tags: ['attack', 'physical']
        },
        {
            id: 'quick',
            name: 'Quick',
            stat: 'attackSpeed',
            min: 5,
            max: 15,
            tags: ['attack', 'speed']
        }
    ],
    suffixes: [
        {
            id: 'ofPower',
            name: 'of Power',
            stat: 'damage',
            min: 1,
            max: 6,
            tags: ['attack']
        },
        {
            id: 'ofProtection',
            name: 'of Protection',
            stat: 'defense',
            min: 1,
            max: 5,
            tags: ['defense']
        },
        {
            id: 'ofTheWolf',
            name: 'of the Wolf',
            stat: 'criticalChance',
            min: 2,
            max: 8,
            tags: ['critical', 'attack']
        }
    ]
};

export function getAvailableAffixes(item, type) {
    const affixPool = type === 'prefix' ? AFFIXES.prefixes : AFFIXES.suffixes;
    return affixPool.filter(affix => 
        !item[`${type}es`].some(existing => existing.id === affix.id) &&
        affix.tags.some(tag => item.tags.includes(tag))
    );
}

export function rollAffixValue(affix) {
    return {
        stat: affix.stat,
        value: Math.floor(Math.random() * (affix.max - affix.min + 1) + affix.min)
    };
}
