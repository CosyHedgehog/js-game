ENCOUNTERS.alchemist = createShopEncounter({
    name: 'Visit Alchemist',
    description: "Visit the Alchemist to buy powerful potions:\n- Health Potions: Restore HP instantly\n- Attack Potions: Boost damage for combat\n- Defense Potions: Increase defense for combat\n- Speed Potions: Attack faster for combat",
    prompt: "Enter the Alchemist's shop?",
    state: 'alchemist',
    entryMessage: "You find an Alchemist's shop, filled with mysterious potions.",
    generateItems: () => generateAlchemistItems(),
    showUI: (ui, items) => ui.showAlchemistUI(items)
})

function generateAlchemistItems() {
    const potionTiers = {
        common: {
            items: ['health_potion', 'attack_potion', 'defense_potion'],
            chance: 0.8
        },
        rare: {
            items: ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion'],
            chance: 0.4
        },
        special: {
            items: ['speed_potion'],
            chance: 0.3
        }
    };

    const availableItems = [];
    Object.entries(potionTiers).forEach(([tier, { items, chance }]) => {
        items.forEach(itemId => {
            if (Math.random() < chance) {
                const item = createItem(itemId);
                if (item) {
                    item.buyPrice = Math.ceil(item.value * 2.5);
                    availableItems.push(item);
                }
            }
        });
    });

    if (availableItems.length === 0) {
        const basicPotion = createItem('health_potion');
        basicPotion.buyPrice = Math.ceil(basicPotion.value * 2.5);
        availableItems.push(basicPotion);
    }
    
    return availableItems;
}