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

        this.eventHandlers = {
            stateChange: [],
            combatStart: [],
            combatEnd: [],
            playerDamaged: [],
            // ... etc
        };
    }

    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.emit('stateChange', { oldState, newState });
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
        if (roll < 30) {
            numChoices = 2;
        } else if (roll < 85) {
            numChoices = 3;
        } else { // 15% chance for 4 choices
            numChoices = 4;
        }

        // Generate unique encounters
        const usedEncounters = new Set();
        while (this.currentChoices.length < numChoices) {
            const encounter = this.getRandomEncounter();
            
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
        
        for (const encounter of ENCOUNTER_PROBABILITY) {
            if (randomRoll < encounter.weight) {
                const encounterData = { type: encounter.type };
                
                // Add specific data for certain encounter types
                if (encounter.type === 'monster') {
                    encounterData.monsterId = COMMON_MONSTERS[getRandomInt(0, COMMON_MONSTERS.length - 1)];
                } else if (encounter.type === 'mini-boss') {
                    encounterData.monsterId = MINI_BOSSES[getRandomInt(0, MINI_BOSSES.length - 1)];
                }
                
                return encounterData;
            }
            randomRoll -= encounter.weight;
        }
        return { type: 'monster', monsterId: COMMON_MONSTERS[0] }; // Fallback
    }

    getEncounterText(encounter) {
        const encounterType = ENCOUNTERS[encounter.type];
        return encounterType ? encounterType.getText(encounter) : 'Unknown Encounter';
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
        const encounterType = ENCOUNTERS[encounter.type];
        return encounterType ? encounterType.getDetails(encounter, this) : 'Unknown encounter type.';
    }

    startEncounter(encounter) {
        this.ui.choicesArea.innerHTML = '';
        this.ui.choicesArea.classList.add('hidden');

        const encounterType = ENCOUNTERS[encounter.type];
        if (encounterType) {
            encounterType.handle(this, this.ui, encounter);
        } else {
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
        const item = this.player.inventory[inventoryIndex];
        if (!item) return;

        const useResult = this.player.useItem(inventoryIndex);

        if (this.state === 'combat' && this.currentCombat) {
            // Let the combat instance handle the result (logging, applying delay)
            this.currentCombat.handlePlayerItemUse(useResult);
            // No need to re-render inventory here, combat handler does it
        } else {
            // Handle non-combat usage
            if (useResult.success) {
                this.addLog(useResult.message);
                this.ui.renderInventory(); // Item consumed
                this.ui.updatePlayerStats(); // Health might have changed
                this.ui.hideContextMenu();
            } else {
                this.addLog(useResult.message); // Log failure (e.g., health full)
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
        }

        this.currentRound = 0;
        this.logMessages = ["Welcome to the Simple Rogue-like!"];
        this.state = 'choosing';

        this.ui.renderAll();
        this.addLog("Game started with your chosen equipment.");
        this.ui.switchScreen('game-screen');
        this.currentRound = 19;
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