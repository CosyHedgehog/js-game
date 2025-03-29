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
        // Starting items
        this.player.addItem(createItem('wooden_sword'));
        for (let i = 0; i < 11; i++) {
            this.player.addItem(createItem('bread'));
        }

        this.currentRound = 0; // Start at 0, first action is advancing to round 1
        this.logMessages = ["Welcome to the Simple Rogue-like!"];
        this.state = 'choosing'; // Initial state after starting

        this.ui.renderAll(); // <<< Ensures orbs are rendered on start

        this.ui.renderAll(); // Initial render of inventory, stats, etc.
        this.addLog("Game started. You find a Wooden Sword and 3 Bread.");
        this.ui.switchScreen('game-screen');
        this.proceedToNextRound(); // Generate first set of choices
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
        // Removed the check against running in 'looting' state, as collectLoot explicitly calls this now.
        // if (this.state === 'combat' /*|| this.state === 'looting'*/) {
        //     console.warn("Attempted to proceedToNextRound while in combat state.");
        //     return;
        // }

        this.currentRound++;
        this.addLog(`--- Round ${this.currentRound} ---`);

        this.state = 'choosing';

        this.ui.clearMainArea();
        this.ui.renderRoundIndicator();
        if (this.currentRound >= this.maxRounds) {
            this.generateBossEncounter();
        } else {
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
        const choice1 = this.getRandomEncounter();
        const choice2 = this.getRandomEncounter();
        const choice3 = this.getRandomEncounter(); // Add third choice

        // Ensure choices are described clearly
        this.currentChoices.push({ text: this.getEncounterText(choice1), encounter: choice1 });
        this.currentChoices.push({ text: this.getEncounterText(choice2), encounter: choice2 });
        this.currentChoices.push({ text: this.getEncounterText(choice3), encounter: choice3 }); // Add third choice

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

        // Add specific details (e.g., which monster)
        if (chosenEncounter.type === 'monster') {
            chosenEncounter.monsterId = COMMON_MONSTERS[getRandomInt(0, COMMON_MONSTERS.length - 1)];
        } else if (chosenEncounter.type === 'mini-boss') {
            chosenEncounter.monsterId = MINI_BOSSES[getRandomInt(0, MINI_BOSSES.length - 1)];
        }

        return chosenEncounter;
    }

    getEncounterText(encounter) {
        switch (encounter.type) {
            case 'monster':
                return `Fight ${MONSTERS[encounter.monsterId]?.name || 'Monster'}`;
            case 'rest':
                return 'Rest Site (Heal 50% Max HP)';
            case 'shop':
                return 'Visit Shop';
            case 'mini-boss':
                return `Fight Mini-Boss: ${MONSTERS[encounter.monsterId]?.name || 'Mini-Boss'}`;
            default:
                return 'Unknown Encounter';
        }
    }

    generateBossEncounter() {
        this.addLog("The air grows heavy... The Final Boss appears!");
        this.currentChoices = []; // No choices for the boss round
        const bossEncounter = { type: 'boss', monsterId: FINAL_BOSS };
        this.startEncounter(bossEncounter);
    }

    selectChoice(index) {
        if (this.state !== 'choosing' || index < 0 || index >= this.currentChoices.length) {
            return; // Ignore clicks if not in choosing state or invalid index
        }
        const selectedChoice = this.currentChoices[index];
        this.startEncounter(selectedChoice.encounter);
    }

    startEncounter(encounter) {
        // Clear choices UI
        this.ui.choicesArea.innerHTML = '';
        this.ui.choicesArea.classList.add('hidden');

        switch (encounter.type) {
            case 'monster':
            case 'mini-boss':
            case 'boss': // Handle boss fight same as monster fight initially
                handleMonsterEncounter(this, this.ui, encounter.monsterId);
                break;
            case 'rest':
                handleRestEncounter(this, this.ui);
                // State set to 'rest' inside handler
                break;
            case 'shop':
                handleShopEncounter(this, this.ui);
                // State set to 'shop' inside handler
                break;
            default:
                this.addLog("Unknown encounter type selected.");
                this.proceedToNextRound(); // Move on if something weird happens
        }
    }

    // --- Player Action Handlers ---

    handleEquipItem(inventoryIndex) {
        if (this.state === 'combat') {
            this.addLog("Cannot equip items during combat!");
            this.ui.hideContextMenu();
            return;
        }
        const result = this.player.equipItem(inventoryIndex);
        if (result.success) {
            this.addLog(`Equipped ${result.item.name}.`);
            if (result.unequipped) {
                this.addLog(`Unequipped ${result.unequipped.name}.`);
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
        if (this.state === 'combat') {
            this.addLog("Cannot unequip items during combat!");
            return;
        }
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
            this.ui.showLootUI(this.pendingLoot);
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
                return; // Return without updating UI
            }
            
            // Try to add the item
            if (this.player.addItem(item)) {
                item.looted = true;
                this.addLog(`Picked up ${item.name}.`);
                
                // Update UI only after successful pickup
                this.ui.updatePlayerStats();
                this.ui.renderInventory();
                this.ui.showLootUI(this.pendingLoot);
                
                // Check if all loot has been collected
                if (this.isAllLootCollected()) {
                    this.continueLoot();
                }
            } else {
                this.addLog("Failed to pick up item - inventory might be full!");
            }
        }
    }

    // Add this helper method to check if all loot has been collected
    isAllLootCollected() {
        if (!this.pendingLoot) return true;
        
        // Check if there's any gold left
        if (this.pendingLoot.gold > 0) return false;
        
        // Check if there are any unlooted items
        if (this.pendingLoot.items && this.pendingLoot.items.length > 0) {
            return this.pendingLoot.items.every(item => item.looted);
        }
        
        return true;
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

}