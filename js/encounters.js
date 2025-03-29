function handleMonsterEncounter(game, ui, monsterId) {
    const monsterData = MONSTERS[monsterId];
    if (!monsterData) {
        console.error("Monster data not found:", monsterId);
        game.addLog("Error: Encountered an unknown creature.");
        game.proceedToNextRound(); // Skip if error
        return;
    }
    game.addLog(`You encounter a ${monsterData.name}!`);
    game.currentCombat = new Combat(game.player, monsterData, game, ui);
    game.state = 'combat';
    game.currentCombat.start();
}

function handleRestEncounter(game, ui) {
    game.state = 'rest';
    game.addLog("You found a quiet spot to rest.");
    const healAmount = Math.floor(game.player.maxHealth * 0.5); // Heal 50% of max HP
    const actualHealed = game.player.heal(healAmount);
    if (actualHealed > 0) {
        game.addLog(`You healed for ${actualHealed} HP.`);
    } else {
        game.addLog("Your health is already full.");
    }
    ui.showRestUI();
    ui.updatePlayerStats(); // Update stats display
}

function handleShopEncounter(game, ui) {
    game.state = 'shop';
    game.addLog("You arrive at a small shop.");
    game.currentShopItems = generateShopItems(SHOP_NUM_ITEMS);
    game.shopCanReroll = true;
    ui.showShopUI(game.currentShopItems, game.shopCanReroll);
}

function generateShopItems(count) {
    const items = [];
    const availableItems = [...SHOP_ITEM_POOL]; // Copy pool
    for (let i = 0; i < count; i++) {
        if (availableItems.length === 0) break; // No more unique items to pick

        const randomIndex = getRandomInt(0, availableItems.length - 1);
        const itemId = availableItems.splice(randomIndex, 1)[0]; // Pick and remove
        const itemData = createItem(itemId);
        if (itemData) {
            // Determine buy price (e.g., double the value, or more complex logic)
            itemData.buyPrice = itemData.value * 2 + getRandomInt(0, itemData.value);
            items.push(itemData);
        }
    }
    return items;
}

function handleBuyItem(game, ui, itemIndex) {
    if (game.state !== 'shop' || !game.currentShopItems || itemIndex < 0 || itemIndex >= game.currentShopItems.length) return;

    const item = game.currentShopItems[itemIndex];
    if (!item) return; // Item might have been bought already

    if (game.player.gold >= item.buyPrice) {
        const freeSlot = game.player.findFreeInventorySlot();
        if (freeSlot !== -1) {
            game.player.spendGold(item.buyPrice);
            game.player.addItem(item); // Add a *copy*
            game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);
            // Remove from shop display (or mark as sold) - simple removal here
            game.currentShopItems.splice(itemIndex, 1);
            ui.showShopUI(game.currentShopItems, game.shopCanReroll); // Refresh shop UI
            ui.renderInventory();
            ui.updatePlayerStats();
        } else {
            game.addLog("Your inventory is full!");
        }
    } else {
        game.addLog("Not enough gold!");
    }
}

function handleSellItem(game, ui, inventoryIndex) {
    if (game.state !== 'shop') return; // Can only sell in shop

    const item = game.player.inventory[inventoryIndex];
    if (!item) return;

    const sellPrice = item.value || 0; // Use item's base value
    game.player.removeItem(inventoryIndex);
    game.player.addGold(sellPrice);
    game.addLog(`You sold ${item.name} for ${sellPrice} gold.`);

    ui.renderInventory();
    ui.updatePlayerStats();
    ui.hideContextMenu(); // Hide menu after selling
}

function handleRerollShop(game, ui) {
    if (game.state !== 'shop' || !game.shopCanReroll) return;

    if (game.player.spendGold(SHOP_REROLL_COST)) {
        game.addLog(`You spend ${SHOP_REROLL_COST} gold to reroll the shop.`);
        game.currentShopItems = generateShopItems(SHOP_NUM_ITEMS);
        game.shopCanReroll = false; // Only one reroll per visit
        ui.showShopUI(game.currentShopItems, game.shopCanReroll);
        ui.updatePlayerStats();
    } else {
        game.addLog(`Not enough gold to reroll (costs ${SHOP_REROLL_COST})!`);
    }
}