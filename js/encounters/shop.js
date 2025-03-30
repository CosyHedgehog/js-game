ENCOUNTERS.shop = createShopEncounter({
    name: 'Shop',
    description: "Visit a merchant to buy and sell items.\nYou can also reroll the shop's inventory once for 5 gold.",
    prompt: "Enter shop?",
    state: 'shop',
    entryMessage: "You arrive at a small shop.",
    generateItems: () => generateShopItems(SHOP_NUM_ITEMS),
    canReroll: true,
    showUI: (ui, items) => ui.showShopUI(items, true)
})

function generateShopItems(count) {
    const numItems = getRandomInt(3, 8);
    const items = [];

    const itemTiers = {
        early: {
            items: SHOP_ITEM_POOL.slice(0, 10), // Early game items
            weight: 70
        },
        mid: {
            items: SHOP_ITEM_POOL.slice(10, 17), // Mid game items
            weight: 25
        },
        late: {
            items: SHOP_ITEM_POOL.slice(17), // Late game items
            weight: 5
        }
    };

    const availableItems = new Set();

    while (availableItems.size < numItems) {
        const roll = Math.random() * 100;
        let selectedTier;
        let cumWeight = 0;

        for (const [tier, data] of Object.entries(itemTiers)) {
            cumWeight += data.weight;
            if (roll < cumWeight) {
                selectedTier = data;
                break;
            }
        }

        const tierItems = selectedTier.items;
        const randomItem = tierItems[getRandomInt(0, tierItems.length - 1)];
        
        if (!availableItems.has(randomItem)) {
            availableItems.add(randomItem);
        }
    }

    // Convert selected items to actual item objects
    for (const itemId of availableItems) {
        const itemData = createItem(itemId);
        if (itemData) {
            itemData.buyPrice = Math.ceil(itemData.value * 1.3 + getRandomInt(0, Math.floor(itemData.value * 0.2)));
            items.push(itemData);
        }
    }

    return items;
}