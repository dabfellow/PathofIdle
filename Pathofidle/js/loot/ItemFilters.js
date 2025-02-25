export class ItemFilter {
    constructor() {
        this.filters = new Map();
    }

    addFilter(name, conditions) {
        this.filters.set(name, {
            active: true,
            conditions: conditions
        });
    }

    toggleFilter(name) {
        const filter = this.filters.get(name);
        if (filter) {
            filter.active = !filter.active;
        }
    }

    filterItems(items) {
        return items.filter(item => {
            for (const [name, filter] of this.filters) {
                if (filter.active && !this.itemMatchesFilter(item, filter.conditions)) {
                    return false;
                }
            }
            return true;
        });
    }

    itemMatchesFilter(item, conditions) {
        return Object.entries(conditions).every(([property, condition]) => {
            if (typeof condition === 'function') {
                return condition(item[property]);
            }
            return item[property] === condition;
        });
    }
}

// Preset filters
export const DEFAULT_FILTERS = {
    QUALITY_ITEMS: {
        name: 'Quality Items',
        conditions: {
            quality: (q) => q > 0
        }
    },
    MAGIC_PLUS: {
        name: 'Magic & Better',
        conditions: {
            rarity: (r) => ['MAGIC', 'RARE', 'UNIQUE'].includes(r)
        }
    },
    UNIDENTIFIED: {
        name: 'Unidentified',
        conditions: {
            identified: false
        }
    }
};
