class Game {
    constructor(ui) {
        this.lastDefeatedEnemyName = null;
        this.ui = ui;
        this.player = null;
        this.currentRound = 0;
        this.maxRounds = 30;
        this.state = 'start_screen'; // Possible states: start_screen, choosing, combat, shop, rest, looting, game_over, win
        this.logMessages = [];
        this.currentChoices = [];
        this.currentCombat = null;
        this.currentShopItems = [];
        this.shopCanReroll = false;
        this.pendingLoot = null; // Will hold { gold: number, items: [] }

        if (this.ui) { this.ui.game = this; }
    }

    startGame() {
        this.player = new Player();
        this.ui.renderAll();
        // Show starting pack selection
        this.state = 'selecting_pack';
        this.ui.showStartingPackSelection();
    }

    addLog(message) {
        this.logMessages.push(message);
        if (this.logMessages.length > 50) { // Keep log manageable
            this.logMessages.shift();
        }
        this.ui.renderLog(); // Update UI immediately
    }

    // Ensure proceedToNextRound correctly sets state and clears UI
    proceedToNextRound() {
        this.currentRound++;
        this.addLog(`--- Round ${this.currentRound} ---`);

        this.state = 'choosing';
        this.ui.clearMainArea();

        // Special rounds handling
        if (this.currentRound === 10 || this.currentRound === 20) {
            // Mini-boss rounds
            this.generateMiniBossEncounter();
        } else if (this.currentRound === 30) {
            // Final boss round
            this.generateBossEncounter();
        } else {
            // Normal rounds
            this.generateChoices();
        }

        this.ui.updatePlayerStats();
        this.ui.renderEquipment();
        this.ui.renderInventory();
    }

    enterLootState(gold, items) {
        // Ensure items have the selected property if somehow missed (defensive)
        items.forEach(item => {
            if (item.selected === undefined) {
                item.selected = true;
            }
        });
        this.pendingLoot = { gold, items };
        this.state = 'looting';
        this.addLog("Examining loot..."); // Changed log message
        this.ui.showLootUI(this.pendingLoot);
    }
    // --- NEW: Toggle Loot Item Selection ---
    toggleLootSelection(itemIndex) {
        if (this.state !== 'looting' || !this.pendingLoot || !this.pendingLoot.items[itemIndex]) {
            return;
        }
        // Toggle the selected state
        const item = this.pendingLoot.items[itemIndex];
        item.selected = !item.selected;

        // Update just the specific item's visual state in the UI
        this.ui.updateLootItemVisual(itemIndex, item.selected);
    }
    collectLoot() {
        if (!this.pendingLoot) return;

        // Count how many unlooted items we have
        const unLootedItems = this.pendingLoot.items ? 
            this.pendingLoot.items.filter(item => !item.looted).length : 0;

        // Check if we have enough inventory space
        const freeSlots = this.player.inventory.filter(slot => slot === null).length;
        
        if (unLootedItems > freeSlots) {
            this.addLog(`Not enough inventory space! You need ${unLootedItems} free slots.`);
            return;
        }

        // If we have space, proceed with collecting all loot
        if (this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            this.addLog(`Collected ${this.pendingLoot.gold} gold.`);
            this.pendingLoot.gold = 0;
        }

        let allItemsCollected = true;
        if (this.pendingLoot.items) {
            this.pendingLoot.items.forEach(item => {
                if (!item.looted) {
                    if (this.player.addItem(item)) {
                        item.looted = true;
                        this.addLog(`Picked up ${item.name}.`);
                    } else {
                        this.addLog(`Failed to pick up ${item.name} - inventory might be full!`);
                        allItemsCollected = false;
                    }
                }
            });
        }

        // Update UI
        this.ui.updatePlayerStats();
        this.ui.renderInventory();

        // Only continue if all items were successfully collected
        if (allItemsCollected) {
            this.continueLoot();
        } else {
            this.ui.showLootUI(this.pendingLoot);
        }
    }

    generateChoices() {
        this.currentChoices = [];
        
        // Determine number of choices (2-4)
        const roll = Math.random() * 100;
        let numChoices;
        if (roll < 5){
            numChoices = 1;
        } else if (roll < 30) {
            numChoices = 2;
        } else if (roll < 95) {
            numChoices = 3;
        } else { // 15% chance for 4 choices
            numChoices = 4;
        }

        // Generate unique encounters
        const usedEncounters = new Set();
        while (usedEncounters.size < numChoices) {
            const encounter = this.getRandomEncounter();
            if (encounter.type === 'monster') {
                encounter.monsterId = COMMON_MONSTERS[getRandomInt(0, COMMON_MONSTERS.length - 1)];
            } else if (encounter.type === 'mini-boss') {
                encounter.monsterId = MINI_BOSSES[getRandomInt(0, MINI_BOSSES.length - 1)];
            }
            // Create a unique key for the encounter to prevent duplicates
            const encounterKey = encounter.type + (encounter.monsterId || '');
            
            if (!usedEncounters.has(encounterKey)) {
                usedEncounters.add(encounterKey);
                this.currentChoices.push({ 
                    text: this.getEncounterText(encounter), 
                    encounter: encounter 
                });
            }
        }

        this.ui.renderChoices(this.currentChoices);
    }

    getRandomEncounter() {
        const totalWeight = ENCOUNTER_PROBABILITY.reduce((sum, enc) => sum + enc.weight, 0);
        let randomRoll = Math.random() * totalWeight;
        let chosenEncounter = null;

        for (const encounter of ENCOUNTER_PROBABILITY) {
            if (randomRoll < encounter.weight) {
                chosenEncounter = { type: encounter.type };
                break;
            }
            randomRoll -= encounter.weight;
        }


        return chosenEncounter;
    }

    getEncounterText(encounter) {
        switch (encounter.type) {
            case 'monster':
                return `Fight ${MONSTERS[encounter.monsterId]?.name || 'Monster'}`;
            case 'rest':
                return 'Rest Site';
            case 'shop':
                return 'Shop';
            case 'mini-boss':
                return `Fight ${MONSTERS[encounter.monsterId]?.name}`;
            case 'fishing':
                return 'Go Fishing!';
            case 'blacksmith':
                return "Visit Blacksmith";
            case 'sharpen':
                return "Use Sharpening Stone";
            case 'armourer':
                return "Visit Armourer";
            case 'alchemist':
                return "Visit Alchemist";
            case 'trap':
                return "Disarm Trap";
            case 'treasure_chest':
                return "Treasure Chest";
            default:
                return 'Unknown Encounter';
        }
    }

    generateBossEncounter() {
        this.addLog("The air grows heavy... The Final Boss appears!");
        this.currentChoices = [{
            text: `Fight ${MONSTERS[FINAL_BOSS].name} (Final Boss)`,
            encounter: { type: 'boss', monsterId: FINAL_BOSS }
        }];
        this.ui.renderChoices(this.currentChoices);
    }

    selectChoice(index) {
        if (this.state !== 'choosing' || index < 0 || index >= this.currentChoices.length) {
            return;
        }
        
        // Instead of starting encounter immediately, show confirmation
        const selectedChoice = this.currentChoices[index];
        this.ui.showEncounterConfirmation(selectedChoice, index);
    }

    // Add new method to handle final confirmation
    confirmChoice(index) {
        const selectedChoice = this.currentChoices[index];
        this.startEncounter(selectedChoice.encounter);
    }

    // Add new method to get encounter details
    getEncounterDetails(encounter) {
        switch (encounter.type) {
            case 'monster':
            case 'mini-boss':
            case 'boss': {
                const monster = MONSTERS[encounter.monsterId];
                if (!monster) return "Error: Monster data not found.";
                return `${monster.name}\n` +
                       `Health: ${monster.health} // Attack: ${monster.attack} // Defense: ${monster.defense} // Attack Speed: ${monster.speed}s // ` +
                       `Gold Drop: ${monster.goldDrop[0]}-${monster.goldDrop[1]}\n\n` +
                       `This will start a combat encounter. Are you ready to fight?`;
            }
            case 'rest':
                return `Rest at this site to recover 20-70% of your maximum health (${Math.floor(this.player.maxHealth * 0.2)}-${Math.floor(this.player.maxHealth * 0.7)} HP).\n` +
                       `Your maximum HP will also increase by 1.\n\n` +
                       `Do you want to rest here?`;
            case 'shop':
                return "Visit a merchant to buy and sell items.\n" +
                       "You can also reroll the shop's inventory once for 5 gold.\n\n" +
                       `Current gold: ${this.player.gold}\n\n` +
                       "Enter shop?";
            case 'fishing':
                return "Try your luck fishing!\n" +
                       "You might catch 1-5 fish of varying sizes:\n" +
                       "- Small Fish (Common) - Heals 2 HP\n" +
                       "- Medium Fish (Uncommon) - Heals 5 HP\n" +
                       "- Large Fish (Rare) - Heals 8 HP\n\n" +
                       "Go fishing?";
            case 'blacksmith':
                return "Visit the Blacksmith to combine two similar items into a stronger version.\n" +
                       "You can combine weapons or armor pieces of the same type.\n\n" +
                       "Enter the forge?";
            case 'sharpen':
                return "You find a sharpening stone that can enhance a weapon.\n" +
                       "Select one weapon to permanently increase its attack power by 1.\n\n" +
                       "Use the sharpening stone?";
            case 'armourer':
                return "You find an Armourer's tools that can enhance armor.\n" +
                       "Select one piece of armor to permanently increase its defense by 1.\n\n" +
                       "Use the Armourer's tools?";
            case 'alchemist':
                return "Visit the Alchemist to buy powerful potions:\n" +
                       "- Health Potions: Restore HP instantly\n" +
                       "- Attack Potions: Boost damage for combat\n" +
                       "- Defense Potions: Increase defense for combat\n" +
                       "- Speed Potions: Attack faster for combat\n\n" +
                       `Current gold: ${this.player.gold}\n\n` +
                       "Enter the Alchemist's shop?";
            case 'trap':
                return "You notice something suspicious on the ground. It might be a trap."
                    + "\n\nYou could try to disarm it (30% chance) for a potential reward."
                    + "\nFailure will result in 1-3 damage."
                    + "\n\nInvestigate the trap?";
            case 'treasure_chest':
                return "You find a sturdy-looking treasure chest.\n\n" +
                       "Open it?";
            default:
                return "Unknown encounter type.";
        }
    }

    startEncounter(encounter) {
        // Clear choices UI
        this.ui.choicesArea.innerHTML = '';
        this.ui.choicesArea.classList.add('hidden');

        switch (encounter.type) {
            case 'monster':
            case 'mini-boss':
            case 'boss':
                handleMonsterEncounter(this, this.ui, encounter.monsterId);
                break;
            case 'rest':
                handleRestEncounter(this, this.ui);
                break;
            case 'shop':
                handleShopEncounter(this, this.ui);
                break;
            case 'fishing':
                handleFishingEncounter(this, this.ui);
                break;
            case 'blacksmith':
                handleBlacksmithEncounter(this, this.ui);
                break;
            case 'sharpen':
                handleSharpenEncounter(this, this.ui);
                break;
            case 'armourer':
                handleArmourerEncounter(this, this.ui);
                break;
            case 'alchemist':
                handleAlchemistEncounter(this, this.ui);
                break;
            case 'trap':
                handleTrapEncounter(this, this.ui);
                break;
            case 'treasure_chest':
                handleTreasureChestEncounter(this, this.ui);
                break;
            default:
                this.addLog("Unknown encounter type selected.");
                this.proceedToNextRound();
        }
    }

    // --- Player Action Handlers ---

    handleEquipItem(index) {
        const result = this.player.equipItem(index);
        if (result.success) {
            this.addLog(`Equipped ${result.item.name}.`);
            if (result.unequipped) {
                this.addLog(`Unequipped ${result.unequipped.name}.`);
            }
            
            // If in combat and equipping a weapon, reset attack timer
            if (this.state === 'combat' && this.currentCombat && result.item.type === 'weapon') {
                this.player.attackTimer = this.player.getAttackSpeed();
                this.currentCombat.ui.updateCombatTimers(this.player.attackTimer, this.currentCombat.enemy.attackTimer);
            }
            
            this.ui.renderInventory();
            this.ui.renderEquipment();
            this.ui.updatePlayerStats();
            this.ui.hideContextMenu();
        } else {
            this.addLog(`Equip failed: ${result.message}`);
        }
    }

    handleUnequipItem(slotName) {
        const result = this.player.unequipItem(slotName);
        if (result.success) {
            this.addLog(`Unequipped ${result.item.name}.`);
            this.ui.renderInventory();
            this.ui.renderEquipment();
            this.ui.updatePlayerStats();
        } else {
            this.addLog(`Unequip failed: ${result.message}`);
        }
    }

    handleUseItem(inventoryIndex) {
        // Add a check for the inventory index bounds
        if (inventoryIndex < 0 || inventoryIndex >= this.player.inventory.length) {
            console.error(`Invalid inventory index: ${inventoryIndex}`);
            return; // Stop execution if index is out of bounds
        }

        const item = this.player.inventory[inventoryIndex];
        if (!item) {
            console.warn(`No item found at index: ${inventoryIndex}`);
            return; // Stop execution if no item exists
        }

        const useResult = this.player.useItem(inventoryIndex);

        if (this.state === 'combat' && this.currentCombat) {
            // Combat usage: Already handled by Combat class
            this.currentCombat.handlePlayerItemUse(useResult);
        } else {
            // Non-combat usage
            if (useResult.success) {
                this.addLog(useResult.message);
                
                // Add heal splat for non-combat heals
                if (useResult.healedAmount && useResult.healedAmount > 0) {
                   // Target the inventory area instead
                   this.ui.createDamageSplat('#inventory-area', useResult.healedAmount, 'heal'); 
                }

                this.ui.renderInventory(); // Item consumed
                this.ui.updatePlayerStats(); // Health/Stats changed
                this.ui.hideContextMenu();
            } else {
                this.addLog(useResult.message); 
            }
        }
    }

    handleDestroyItem(inventoryIndex) {
        const removedItem = this.player.removeItem(inventoryIndex);
        if (removedItem) {
            this.addLog(`Destroyed ${removedItem.name}.`);
            this.ui.renderInventory();
            this.ui.hideContextMenu();
        }
    }

    // --- NEW: Inventory Drag/Drop Handler ---
    handleInventorySwap(sourceIndexStr, targetIndexStr) {
        const sourceIndex = parseInt(sourceIndexStr, 10);
        const targetIndex = parseInt(targetIndexStr, 10);

        // Validate indices
        if (isNaN(sourceIndex) || isNaN(targetIndex) ||
            sourceIndex < 0 || sourceIndex >= this.player.inventory.length ||
            targetIndex < 0 || targetIndex >= this.player.inventory.length ||
            sourceIndex === targetIndex) {
            console.warn(`Invalid inventory swap attempt: ${sourceIndexStr} -> ${targetIndexStr}`);
            // Optional: Re-render just in case visual styles got stuck, though dragend should handle it
            // this.ui.renderInventory();
            return; // Do nothing if indices are invalid or the same
        }

        // Perform the swap in the player's inventory data
        const temp = this.player.inventory[sourceIndex];
        this.player.inventory[sourceIndex] = this.player.inventory[targetIndex];
        this.player.inventory[targetIndex] = temp;

        // Add a log message (optional)
        // this.addLog("Rearranged inventory."); // Might be too noisy

        // Re-render the inventory to show the updated positions
        this.ui.renderInventory();
    }

    // --- End Game ---
    endGame(playerWon) {
        if (playerWon) {
            this.state = 'win';
            this.addLog("YOU WIN!");
            this.ui.showEndScreen(true);
        } else {
            this.state = 'game_over';
            this.addLog("GAME OVER");
            this.ui.showEndScreen(false);
        }
        if (this.currentCombat && this.currentCombat.intervalId) {
            clearInterval(this.currentCombat.intervalId); // Ensure combat stops fully
        }
    }

    handleIndividualLoot(type, index) {
        if (!this.pendingLoot) return;

        if (type === 'gold' && this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            this.addLog(`Collected ${this.pendingLoot.gold} gold.`);
            this.pendingLoot.gold = 0;
            
            // Update UI after successful gold collection
            this.ui.updatePlayerStats();
            
            // Check if this was the last thing to loot
            if (this.isAllLootCollected()) {
                this.continueLoot();
            } else {
                this.ui.showLootUI(this.pendingLoot);
            }
        } else if (type === 'item' && this.pendingLoot.items[index]) {
            const item = this.pendingLoot.items[index];
            
            // First check if item is already looted
            if (item.looted) {
                return; // Item already taken, do nothing
            }

            // Check inventory space
            const freeSlot = this.player.findFreeInventorySlot();
            if (freeSlot === -1) {
                this.addLog("Inventory is full!");
                return;
            }
            
            // Try to add the item
            if (this.player.addItem(item)) {
                item.looted = true;
                this.addLog(`Picked up ${item.name}.`);
                
                // Update UI
                this.ui.updatePlayerStats();
                this.ui.renderInventory();
                
                // Check if this was the last thing to loot
                if (this.isAllLootCollected()) {
                    this.continueLoot();
                } else {
                    this.ui.showLootUI(this.pendingLoot);
                }
            } else {
                this.addLog("Failed to pick up item - inventory might be full!");
            }
        }
    }

    // Update the isAllLootCollected method to be more robust
    isAllLootCollected() {
        if (!this.pendingLoot) return true;
        
        // Check if there's any gold left
        if (this.pendingLoot.gold > 0) return false;
        
        // Check if there are any unlooted items
        if (this.pendingLoot.items && this.pendingLoot.items.length > 0) {
            const hasUnlootedItems = this.pendingLoot.items.some(item => !item.looted);
            return !hasUnlootedItems; // Return true if all items are looted
        }
        
        return true; // No gold and no items (or all items looted)
    }

    continueLoot() {
        // Clear pending loot
        this.pendingLoot = null;

        // Get the name stored by endCombat
        const defeatedName = this.lastDefeatedEnemyName;
        this.lastDefeatedEnemyName = null;

        // Check if it was the boss
        const isBossDefeated = defeatedName && MONSTERS[FINAL_BOSS] && defeatedName === MONSTERS[FINAL_BOSS].name;

        if (isBossDefeated) {
            this.endGame(true);
        } else {
            this.proceedToNextRound();
        }
    }

    // Add new method to handle pack selection
    selectStartingPack(packId) {
        this.state = 'starting_pack';
        switch(packId) {
            case 'warrior':
                // Warrior pack: More armor focused
                this.player.addItem(createItem('rusty_sword'));
                this.player.addItem(createItem('leather_helm'));
                this.player.addItem(createItem('leather_legs'));
                this.player.addItem(createItem('bread'));
                this.player.addItem(createItem('bread'));
                this.ui.clearMainArea();
                break;
                
            case 'fisher':
                // Fisher pack: Includes fishing rod
                this.player.addItem(createItem('wooden_sword'));
                this.player.addItem(createItem('leather_helm'));
                this.player.addItem(createItem('fishing_rod'));
                this.player.addItem(createItem('large_fish'));
                this.player.addItem(createItem('large_fish'));
                this.player.addItem(createItem('large_fish'));
                this.player.addItem(createItem('large_fish'));
                this.ui.clearMainArea();
                break;

            case 'blacksmith':
                // Blacksmith pack: Includes hammer and some basic resources
                this.player.addItem(createItem('wooden_sword'));
                this.player.addItem(createItem('blacksmith_hammer'));
                this.player.addItem(createItem('bread'));
                this.player.addItem(createItem('small_fish'));
                this.player.addItem(createItem('leather_helm'));
                this.player.addItem(createItem('leather_helm'));
            
                this.ui.clearMainArea();
                break;
        }

        this.currentRound = 0;
        this.logMessages = ["Welcome to the Simple Rogue-like!"];
        this.state = 'choosing';

        this.ui.renderAll();
        this.addLog("Game started with your chosen equipment.");
        this.ui.switchScreen('game-screen');
        this.proceedToNextRound();
    }

    // Add new method for mini-boss encounters
    generateMiniBossEncounter() {
        // Select a random mini-boss
        const miniBossIndex = getRandomInt(0, MINI_BOSSES.length - 1);
        const miniBossId = MINI_BOSSES[miniBossIndex];
        
        this.currentChoices = [{
            text: `Fight ${MONSTERS[miniBossId].name} (Mini-Boss)`,
            encounter: { type: 'mini-boss', monsterId: miniBossId }
        }];
        
        this.addLog(`A powerful enemy approaches...`);
        this.ui.renderChoices(this.currentChoices);
    }

}