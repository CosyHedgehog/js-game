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
    
    // Calculate and apply healing (without including the +1 max HP)
    const healPercent = 0.2 + Math.random() * 0.5; // Random between 20-70%
    const healAmount = Math.floor(game.player.maxHealth * healPercent);
    const actualHealed = game.player.heal(healAmount);
    
    // Increase max HP by 1 (but don't heal this amount)
    game.player.maxHealth += 1;
    
    // Create detailed message
    let message = `You rest and recover ${actualHealed} HP.`;
    message += `\nYour maximum HP increases by 1 (now ${game.player.maxHealth}).`;
    
    game.addLog(message);
    
    // Update UI stats immediately before showing rest UI
    ui.updatePlayerStats();
    
    ui.showRestUI(message);
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
    const availableItems = [...SHOP_ITEM_POOL];
    for (let i = 0; i < count; i++) {
        if (availableItems.length === 0) break;

        const randomIndex = getRandomInt(0, availableItems.length - 1);
        const itemId = availableItems.splice(randomIndex, 1)[0];
        const itemData = createItem(itemId);
        if (itemData) {
            // Reduce shop prices: 1.5x value instead of 2x, with smaller random addition
            itemData.buyPrice = Math.ceil(itemData.value * 1.3 + getRandomInt(0, Math.floor(itemData.value * 0.2)));
            items.push(itemData);
        }
    }
    return items;
}

function handleBuyItem(game, ui, itemIndex) {
    if (game.state !== 'shop' || !game.currentShopItems || itemIndex < 0 || itemIndex >= game.currentShopItems.length) return;

    const item = game.currentShopItems[itemIndex];
    if (!item) return; // Item might have been bought already

    // Check gold first
    if (game.player.gold < item.buyPrice) {
        game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
        return;
    }

    // Only check inventory space if they can afford it
    const freeSlot = game.player.findFreeInventorySlot();
    if (freeSlot === -1) {
        game.addLog("Your inventory is full!");
        return;
    }

    // If we get here, they can afford it and have space
    game.player.spendGold(item.buyPrice);
    game.player.addItem(item); // Add a *copy*
    game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);
    // Remove from shop display (or mark as sold) - simple removal here
    game.currentShopItems.splice(itemIndex, 1);
    ui.showShopUI(game.currentShopItems, game.shopCanReroll); // Refresh shop UI
    ui.renderInventory();
    ui.updatePlayerStats();
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

function handleFishingEncounter(game, ui) {
    game.state = 'fishing';
    game.addLog("You found a good fishing spot!");

    // Determine number of fish caught (1-5)
    const fishCaught = getRandomInt(1, 5);
    game.addLog(`You caught ${fishCaught} fish!`);

    // Generate fish based on rarity
    const caughtItems = [];
    for (let i = 0; i < fishCaught; i++) {
        const roll = Math.random();
        let cumulative = 0;
        
        for (const fish of FISHING_LOOT_TABLE) {
            cumulative += fish.chance;
            if (roll < cumulative) {
                const fishItem = createItem(fish.itemId);
                if (fishItem) {
                    fishItem.selected = true;
                    caughtItems.push(fishItem);
                }
                break;
            }
        }
    }

    // Enter loot state with caught fish
    game.enterLootState(0, caughtItems); // No gold, just fish
}

function handleBlacksmithEncounter(game, ui) {
    game.state = 'blacksmith';
    game.addLog("You find a Blacksmith's forge. The smith offers to combine similar items.");
    ui.showBlacksmithUI();
}

function handleSharpenEncounter(game, ui) {
    game.state = 'sharpen';
    game.addLog("You find a sharpening stone. You can use it to enhance a weapon's attack power.");
    ui.showSharpenUI();
}

function handleArmourerEncounter(game, ui) {
    game.state = 'armourer';
    game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
    ui.showArmourerUI();
}

function handleShrineEncounter(game, ui) {
    game.state = 'shrine';
    game.addLog("You discover a mysterious shrine pulsing with ancient magic.");
    ui.showShrineUI();
}

function handleAlchemistEncounter(game, ui) {
    game.state = 'alchemist';
    game.addLog("You find an Alchemist's shop, filled with mysterious potions.");
    
    // Define potion tiers and their spawn chances
    const potionTiers = {
        common: {
            items: ['health_potion', 'attack_potion', 'defense_potion'],
            chance: 0.8 // 80% chance for common potions
        },
        rare: {
            items: ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion'],
            chance: 0.4 // 40% chance for greater potions
        },
        special: {
            items: ['speed_potion'],
            chance: 0.3 // 30% chance for speed potion
        }
    };

    // Generate available stock
    const availableItems = [];
    
    // Check each tier and item
    Object.entries(potionTiers).forEach(([tier, { items, chance }]) => {
        items.forEach(itemId => {
            if (Math.random() < chance) {
                const item = createItem(itemId);
                if (item) {
                    // Alchemist charges more than regular shops
                    item.buyPrice = Math.ceil(item.value * 2.5);
                    availableItems.push(item);
                }
            }
        });
    });

    // Ensure at least one common potion is always available
    if (availableItems.length === 0) {
        const basicPotion = createItem('health_potion');
        basicPotion.buyPrice = Math.ceil(basicPotion.value * 2.5);
        availableItems.push(basicPotion);
    }
    
    game.currentShopItems = availableItems;
    ui.showAlchemistUI(availableItems);
}

function handleWanderingMerchantEncounter(game, ui) {
    game.state = 'wandering_merchant';
    game.addLog("You encounter a mysterious wandering merchant with unique offerings.");
    
    // Generate available offers based on player's inventory
    const availableOffers = [];
    
    MERCHANT_SPECIAL_OFFERS.forEach(offer => {
        if (offer.type === 'combine') {
            // Check if player has required items
            const hasItems = offer.requires.every(itemId => 
                game.player.inventory.some(item => item && item.id === itemId)
            );
            if (hasItems) {
                availableOffers.push(offer);
            }
        } else if (offer.type === 'enhance') {
            // Check if player has any weapons
            const hasWeapon = game.player.inventory.some(item => 
                item && item.type === 'weapon'
            );
            if (hasWeapon) {
                availableOffers.push(offer);
            }
        } else if (offer.type === 'transform') {
            // Check if player has any shields
            const hasShield = game.player.inventory.some(item => 
                item && item.type === 'armor' && item.slot === 'shield'
            );
            if (hasShield) {
                availableOffers.push(offer);
            }
        }
    });

    ui.showWanderingMerchantUI(availableOffers);
}