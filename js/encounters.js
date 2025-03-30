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
    // Generate a random number of items between 3 and 8
    const numItems = getRandomInt(3, 8);
    const items = [];

    // Define item tiers with weights
    const itemTiers = {
        early: {
            items: [
                'wooden_sword', 'rusty_sword', 'leather_helm', 'leather_armor', 
                'leather_legs', 'wooden_shield', 'bread', 'cooked_meat', 
                'health_potion', 'fishing_rod', 'blacksmith_hammer', 'thief_tools'
            ],
            weight: 70  // 70% chance for early game items
        },
        mid: {
            items: [
                'iron_sword', 'quick_dagger', 'iron_helm', 'iron_armor', 
                'iron_legs', 'iron_shield', 'health_potion'
            ],
            weight: 25  // 25% chance for mid game items
        },
        late: {
            items: [
                'steel_sword', 'steel_greatsword', 'steel_helm', 'steel_armor', 
                'steel_legs', 'steel_shield', 'greater_health_potion'
            ],
            weight: 5   // 5% chance for late game items
        }
    };

    const availableItems = new Set(); // Use Set to prevent duplicates

    while (availableItems.size < numItems) {
        // Roll for tier first
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

        // Select random item from the chosen tier
        const tierItems = selectedTier.items;
        const randomItem = tierItems[getRandomInt(0, tierItems.length - 1)];
        
        // Only add if not already selected
        if (!availableItems.has(randomItem)) {
            availableItems.add(randomItem);
        }
    }

    // Convert selected items to actual item objects
    for (const itemId of availableItems) {
        const itemData = createItem(itemId);
        if (itemData) {
            // Reduce shop prices: 1.3x value + small random addition
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
    // Mark item as bought instead of removing it
    game.currentShopItems[itemIndex].bought = true;
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
    // Check if player has fishing rod
    const hasFishingRod = game.player.inventory.some(item => item && item.id === 'fishing_rod');
    
    if (!hasFishingRod) {
        game.addLog("You need a Fishing Rod to fish here!");
        game.proceedToNextRound();
        return;
    }

    game.state = 'fishing';
    game.addLog("You found a good fishing spot and cast your line!");

    // Rest of the fishing logic remains the same
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
    // Check if player has blacksmith hammer
    const hasHammer = game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
    
    if (!hasHammer) {
        game.addLog("You need a Blacksmith Hammer to use the forge!");
        game.proceedToNextRound();
        return;
    }

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
    // Check if player has blacksmith hammer
    const hasHammer = game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
    
    if (!hasHammer) {
        game.addLog("You need a Blacksmith Hammer to use the armoury!");
        game.proceedToNextRound();
        return;
    }

    game.state = 'armourer';
    game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
    ui.showArmourerUI();
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

function handleTrapEncounter(game, ui) {
    game.currentEncounterType = 'trap';
    game.addLog('You carefully approach a suspicious area...');
    ui.showTrapUI();
}

function handleDisarmAttempt() {
    let successChance = 0.30; // Increased base chance to 40%

    // Check for Thief's Tools
    const hasTools = game.player.inventory.some(item => item && item.id === 'thief_tools');
    if (hasTools) {
        successChance += 0.20; // Add 20% bonus
        game.addLog("Your Thief's Tools aid your attempt...");
    }

    const roll = Math.random();
    const trapResultMessage = document.getElementById('trap-result-message');
    const disarmButton = document.getElementById('disarm-trap-button');
    const skipButton = document.getElementById('skip-trap-button');

    if (roll <= successChance) {
        // Success: Disable buttons here
        if (disarmButton) disarmButton.disabled = true;
        if (skipButton) skipButton.disabled = true;

        const goldReward = Math.floor(Math.random() * 6) + 1;
        const weaponRewardId = TRAP_WEAPON_LOOT[Math.floor(Math.random() * TRAP_WEAPON_LOOT.length)];
        const weaponItem = createItem(weaponRewardId);

        const weaponData = ITEMS[weaponRewardId];
        const successMsg = `Success! You disarmed the trap. Found ${goldReward} gold and a ${weaponData.name}.`;
        game.addLog(successMsg);

        if(trapResultMessage) {
            trapResultMessage.textContent = successMsg;
            trapResultMessage.className = 'message success';
        }

        game.enterLootState(goldReward, [weaponItem]);

        game.ui.updatePlayerStats(); // Use game.ui

        if (game.player.health <= 0) {
            return; // Stop further execution if game over
        }
    } else {
        // Failure
        const damageTaken = Math.floor(Math.random() * 3) + 1;
        game.player.takeRawDamage(damageTaken);
        game.ui.createDamageSplat('#trap-area', damageTaken, 'damage');
        game.ui.updatePlayerStats();

        const failMsg = `Failure! The trap triggers, dealing ${damageTaken} damage.`;
        game.addLog(failMsg);

        if(trapResultMessage) {
            trapResultMessage.textContent = failMsg;
            trapResultMessage.className = 'message failure';
        }

        // Check if player died
        if (game.player.health <= 0) {
            game.endGame(false);
            return; // Stop further execution if game over
        }
    }
}

function handleSkipTrap() {
    game.proceedToNextRound();
}

