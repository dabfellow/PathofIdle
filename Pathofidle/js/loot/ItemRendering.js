import { RARITY } from './RaritySystem.js';

export class ItemRenderer {
    static createItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `item ${item.rarity.toLowerCase()}`;
        itemDiv.dataset.itemId = item.id;
        itemDiv.draggable = true;

        // Add item name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-name';
        nameDiv.textContent = item.name;
        itemDiv.appendChild(nameDiv);

        // Add item properties
        if (item.identified || item.rarity === 'NORMAL') {
            this.addItemProperties(itemDiv, item);
        } else {
            this.addUnidentifiedText(itemDiv);
        }

        return itemDiv;
    }

    static addItemProperties(itemDiv, item) {
        const propsDiv = document.createElement('div');
        propsDiv.className = 'item-properties';

        // Add implicit mods
        if (item.implicit) {
            const implicitDiv = document.createElement('div');
            implicitDiv.className = 'implicit';
            implicitDiv.textContent = this.formatProperty(item.implicit);
            propsDiv.appendChild(implicitDiv);
        }

        // Add explicit mods
        if (item.prefixes) {
            item.prefixes.forEach(prefix => {
                const modDiv = document.createElement('div');
                modDiv.className = 'prefix';
                modDiv.textContent = this.formatProperty(prefix);
                propsDiv.appendChild(modDiv);
            });
        }

        if (item.suffixes) {
            item.suffixes.forEach(suffix => {
                const modDiv = document.createElement('div');
                modDiv.className = 'suffix';
                modDiv.textContent = this.formatProperty(suffix);
                propsDiv.appendChild(modDiv);
            });
        }

        itemDiv.appendChild(propsDiv);
    }

    static addUnidentifiedText(itemDiv) {
        const unidDiv = document.createElement('div');
        unidDiv.className = 'unidentified';
        unidDiv.textContent = 'Unidentified';
        itemDiv.appendChild(unidDiv);
    }

    static formatProperty(prop) {
        if (prop.effect) {
            const value = prop.effect.value;
            const type = prop.effect.type;
            const format = prop.effect.format || '';
            return `${value}${format} ${type}`;
        }
        return prop.name || '';
    }

    static createTooltip(item) {
        const tooltip = document.createElement('div');
        tooltip.className = 'item-tooltip';
        // Add tooltip content based on item properties
        return tooltip;
    }
}
