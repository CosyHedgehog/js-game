// Centralized encounter definitions
const ENCOUNTERS = {
    monster: createMonsterEncounter('monster'),
    'mini-boss': createMonsterEncounter('mini-boss'),
    boss: createMonsterEncounter('boss'),
    rest: {
        getText: () => 'Rest Site',
        getDetails: (data, game) => 
            `Rest at this site to recover 20-70% of your maximum health (${Math.floor(game.player.maxHealth * 0.2)}-${Math.floor(game.player.maxHealth * 0.7)} HP).\n` +
            `Your maximum HP will also increase by 1.\n\n` +
            `Do you want to rest here?`,
        handle: (game, ui) => {
            game.state = 'rest';
            const healPercent = 0.2 + Math.random() * 0.5;
            const healAmount = Math.floor(game.player.maxHealth * healPercent);
            const actualHealed = game.player.heal(healAmount);
            game.player.maxHealth += 1;
            
            let message = `You rest and recover ${actualHealed} HP.`;
            message += `\nYour maximum HP increases by 1 (now ${game.player.maxHealth}).`;
            game.addLog(message);
            ui.updatePlayerStats();
            ui.showRestUI(message);
        }
    },

    shop: createShopEncounter({
        name: 'Shop',
        description: "Visit a merchant to buy and sell items.\nYou can also reroll the shop's inventory once for 5 gold.",
        prompt: "Enter shop?",
        state: 'shop',
        entryMessage: "You arrive at a small shop.",
        generateItems: () => generateShopItems(SHOP_NUM_ITEMS),
        canReroll: true,
        showUI: (ui, items) => ui.showShopUI(items, true)
    }),

    fishing: {
        getText: () => 'Go Fishing!',
        getDetails: () => 
            "Try your luck fishing!\n" +
            "You might catch 1-5 fish of varying sizes:\n" +
            "- Small Fish (Common) - Heals 2 HP\n" +
            "- Medium Fish (Uncommon) - Heals 5 HP\n" +
            "- Large Fish (Rare) - Heals 8 HP\n\n" +
            "Go fishing?",
        handle: (game, ui) => {
            const hasFishingRod = game.player.inventory.some(item => item && item.id === 'fishing_rod');
            if (!hasFishingRod) {
                game.addLog("You need a Fishing Rod to fish here!");
                game.proceedToNextRound();
                return;
            }

            game.state = 'fishing';
            game.addLog("You found a good fishing spot and cast your line!");

            const fishCaught = getRandomInt(1, 5);
            game.addLog(`You caught ${fishCaught} fish!`);

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

            game.enterLootState(0, caughtItems);
        }
    },

    blacksmith: {
        getText: () => "Visit Blacksmith",
        getDetails: () => 
            "Visit the Blacksmith to combine two similar items into a stronger version.\n" +
            "You can combine weapons or armor pieces of the same type.\n\n" +
            "Enter the forge?",
        handle: (game, ui) => {
            game.state = 'blacksmith';
            game.addLog("You find a Blacksmith's forge. The smith offers to combine similar items.");
            ui.showBlacksmithUI();
        }
    },

    sharpen: {
        getText: () => "Use Sharpening Stone",
        getDetails: () => 
            "You find a sharpening stone that can enhance a weapon.\n" +
            "Select one weapon to permanently increase its attack power by 1.\n\n" +
            "Use the sharpening stone?",
        handle: (game, ui) => {
            game.state = 'sharpen';
            game.addLog("You find a sharpening stone. You can use it to enhance a weapon's attack power.");
            ui.showSharpenUI();
        }
    },

    armourer: {
        getText: () => "Visit Armourer",
        getDetails: () => 
            "You find an Armourer's tools that can enhance armor.\n" +
            "Select one piece of armor to permanently increase its defense by 1.\n\n" +
            "Use the Armourer's tools?",
        handle: (game, ui) => {
            game.state = 'armourer';
            game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
            ui.showArmourerUI();
        }
    },

    shrine: {
        getText: () => "Approach Mystic Shrine",
        getDetails: (data, game) => 
            "A mysterious shrine pulses with ancient magic.\n" +
            "Offer gold to receive random beneficial effects:\n" +
            "- Minor Blessing (5 gold): Small stat boost\n" +
            "- Major Blessing (15 gold): Significant enhancement\n" +
            "- Divine Favor (30 gold): Powerful permanent upgrade\n\n" +
            `Current gold: ${game.player.gold}\n\n` +
            "Approach the shrine?",
        handle: (game, ui) => {
            game.state = 'shrine';
            game.addLog("You discover a mysterious shrine pulsing with ancient magic.");
            ui.showShrineUI();
        }
    },

    alchemist: createShopEncounter({
        name: 'Visit Alchemist',
        description: "Visit the Alchemist to buy powerful potions:\n- Health Potions: Restore HP instantly\n- Attack Potions: Boost damage for combat\n- Defense Potions: Increase defense for combat\n- Speed Potions: Attack faster for combat",
        prompt: "Enter the Alchemist's shop?",
        state: 'alchemist',
        entryMessage: "You find an Alchemist's shop, filled with mysterious potions.",
        generateItems: () => generateAlchemistItems(),
        showUI: (ui, items) => ui.showAlchemistUI(items)
    }),

    wandering_merchant: {
        getText: () => "Meet Wandering Merchant",
        getDetails: (data, game) => 
            "A mysterious merchant offers unique services:\n" +
            "- Combine items into powerful artifacts\n" +
            "- Enhance weapons with magical power\n" +
            "- Transform shields into weapons\n\n" +
            `Current gold: ${game.player.gold}\n\n` +
            "Meet the merchant?",
        handle: (game, ui) => {
            game.state = 'wandering_merchant';
            game.addLog("You encounter a mysterious wandering merchant with unique offerings.");
            ui.showWanderingMerchantUI(MERCHANT_SPECIAL_OFFERS);
        }
    },

    trap: createEncounter({
        name: "Investigate Suspicious Area",
        description: "You notice something odd about this area.\nIt could be dangerous, but might hide treasure.\n\nInvestigate?",
        handle: (game, ui) => {
            game.state = 'trap';
            const roll = Math.random();
            if (roll < 0.3) { // 30% chance of treasure
                game.addLog("You carefully avoid the trap and find treasure!");
                game.enterLootState(getRandomInt(5, 15), []); // Gold reward
            } else {
                const damage = getRandomInt(3, 8);
                game.player.takeDamage(damage);
                game.addLog(`You trigger a trap and take ${damage} damage!`);
                ui.updatePlayerStats();
                game.proceedToNextRound();
            }
        }
    })
}; 

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

function createEncounter(options) {
    return {
        getText: options.getText || (() => options.name),
        getDetails: options.getDetails || (() => options.description),
        handle: options.handle
    };
}

function createMonsterEncounter(type) {
    return {
        getText: (data) => {
            const suffix = type === 'monster' ? '' : ` (${type === 'boss' ? 'Final Boss' : 'Mini-Boss'})`;
            return `Fight ${MONSTERS[data.monsterId]?.name}${suffix}`;
        },
        getDetails: (data, game) => {
            const monster = MONSTERS[data.monsterId];
            const title = type === 'monster' ? '' : ` (${type.toUpperCase()})`;
            return `${monster.name}${title}\n` +
                   `Health: ${monster.health} // Attack: ${monster.attack} // Defense: ${monster.defense} // Attack Speed: ${monster.speed}s // ` +
                   `Gold Drop: ${monster.goldDrop[0]}-${monster.goldDrop[1]}\n\n` +
                   type === 'boss' ? 'This is the final battle. Are you ready?' :
                   type === 'mini-boss' ? 'A powerful enemy stands before you. Ready to fight?' :
                   'This will start a combat encounter. Are you ready to fight?';
        },
        handle: (game, ui, data) => {
            const monsterData = MONSTERS[data.monsterId];
            if (!monsterData) {
                console.error("Monster data not found:", data.monsterId);
                game.addLog("Error: Encountered an unknown creature.");
                game.proceedToNextRound();
                return;
            }
            const prefix = type === 'boss' ? 'The ' : 
                          type === 'mini-boss' ? 'A powerful ' : '';
            game.addLog(`${prefix}${monsterData.name}${type === 'boss' ? ' towers before you!' : ' appears!'}`);
            game.currentCombat = new Combat(game.player, monsterData, game, ui);
            game.state = 'combat';
            game.currentCombat.start();
        }
    };
}

function createShopEncounter(options) {
    return {
        getText: () => options.name,
        getDetails: (data, game) => 
            `${options.description}\n\n` +
            `Current gold: ${game.player.gold}\n\n` +
            `${options.prompt}`,
        handle: (game, ui) => {
            game.state = options.state;
            game.addLog(options.entryMessage);
            game.currentShopItems = options.generateItems();
            if (options.canReroll !== undefined) {
                game.shopCanReroll = options.canReroll;
            }
            options.showUI(ui, game.currentShopItems);
        }
    };
}

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