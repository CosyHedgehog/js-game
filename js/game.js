class Game {
    constructor(ui) {
        this.lastDefeatedEnemyName = null;
        this.ui = ui;
        this.player = null;
        this.currentRound = 0;
        this.maxRounds = 30;
        // Add 'looting' state
        this.state = 'start_screen'; // Possible states: start_screen, choosing, combat, shop, rest, looting, game_over, win
        this.logMessages = [];
        this.currentChoices = [];
        this.currentCombat = null;
        this.currentShopItems = [];
        this.shopCanReroll = false;

        // --- NEW: Properties for Loot ---
        this.pendingLoot = null; // Will hold { gold: number, items: [] }
        // --- End Loot Properties ---

        if (this.ui) { this.ui.game = this; }
    }

    startGame() {
        this.player = new Player();
        // Starting items
        this.player.addItem(createItem('wooden_sword'));
        for (let i = 0; i < 3; i++) {
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

        // *** CRITICAL: Set state BEFORE generating UI ***
        this.state = 'choosing';

        this.ui.clearMainArea(); // Clear relevant UI sections (should hide loot)
        this.ui.renderRoundIndicator();
        if (this.currentRound >= this.maxRounds) {
            this.generateBossEncounter();
        } else {
            this.generateChoices(); // This should update the UI via this.ui.renderChoices
        }
        this.ui.updatePlayerStats();
        this.ui.renderEquipment();
        this.ui.renderInventory(); // Re-render inventory in case max health etc changed? Optional.
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
        if (this.state !== 'looting' || !this.pendingLoot) {
            console.error("collectLoot called incorrectly.");
            return;
        }
        console.log("collectLoot: Processing loot."); // Debug Log

        // Get the name stored by endCombat
        const defeatedName = this.lastDefeatedEnemyName;
        this.lastDefeatedEnemyName = null; // Clear the temporary storage

        let goldTaken = 0;
        let itemsConsidered = 0;
        let itemsTaken = 0;
        let itemsLeft = 0;

        // Grant Gold
        if (this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            goldTaken = this.pendingLoot.gold;
        }

        // Grant SELECTED Items
        if (this.pendingLoot.items) {
            this.pendingLoot.items.forEach(item => {
                itemsConsidered++;
                if (item.selected) {
                    if (this.player.addItem(item)) {
                        itemsTaken++;
                    } else {
                        itemsLeft++;
                    }
                } else {
                    itemsLeft++;
                }
            });
        }

        // --- Summary Logging ---
        let logMsg = "Finished looting.";
        // ... (rest of logging logic) ...
        this.addLog(logMsg);
        // --- End Summary Logging ---

        // Clear pending loot BEFORE proceeding
        this.pendingLoot = null;

        // Update UI state AFTER clearing loot, BEFORE changing game state
        console.log("collectLoot: Updating stats and inventory UI."); // Debug Log
        this.ui.updatePlayerStats();
        this.ui.renderInventory();

        // --- Determine Next Step ---
        const isBossDefeated = defeatedName && MONSTERS[FINAL_BOSS] && defeatedName === MONSTERS[FINAL_BOSS].name;
        console.log(`collectLoot: Checking proceed. Defeated='${defeatedName}', IsBoss=${isBossDefeated}`); // Debug Log

        if (isBossDefeated) {
            console.log("collectLoot: Boss defeated, calling endGame(true)."); // Debug Log
            this.ui.renderRoundIndicator();
            // Game state is handled within endGame
            this.endGame(true);
        } else {
            console.log("collectLoot: Not boss, calling proceedToNextRound()."); // Debug Log
            // proceedToNextRound will set state to 'choosing' and update UI choices
            this.proceedToNextRound();
        }
        // --- End Determine Next Step ---
    }

    generateChoices() {
        this.currentChoices = [];
        const choice1 = this.getRandomEncounter();
        const choice2 = this.getRandomEncounter();

        // Ensure choices are described clearly
        this.currentChoices.push({ text: this.getEncounterText(choice1), encounter: choice1 });
        this.currentChoices.push({ text: this.getEncounterText(choice2), encounter: choice2 });

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
        } else if (type === 'item' && this.pendingLoot.items[index] && !this.pendingLoot.items[index].looted) {
            const item = this.pendingLoot.items[index];
            if (this.player.addItem(item)) {
                item.looted = true;
                this.addLog(`Picked up ${item.name}.`);
            } else {
                this.addLog("Inventory is full!");
                return;
            }
        }

        // Update UI
        this.ui.updatePlayerStats();
        this.ui.renderInventory();

        // Check if all loot has been collected
        const isAllLooted = this.isAllLootCollected();
        if (isAllLooted) {
            this.continueLoot(); // Proceed to next round if everything is looted
        } else {
            this.ui.showLootUI(this.pendingLoot); // Otherwise, update the loot UI
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