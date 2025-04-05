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
        this.currentArea = Math.random() < 0.5 ? 'spider_cave' : 'wolf_den';
        this.pendingAreaTransitionName = null; // Add this property

        if (this.ui) { this.ui.game = this; }
    }

    EVENT_PROBABILITY = [
        { type: 'monster', weight: 30 },
        { type: 'rest', weight: 10 }, // 
        { type: 'shop', weight: 10 },
        { type: 'alchemist', weight: 10 },
        { type: 'treasure_chest', weight: 10 }, //
        { type: 'forge', weight: 10 }, 
        { type: 'fishing', weight: 10 },
        { type: 'trap', weight: 10 }
    ];

    startGame() {
        this.ui.renderAll();
    }

    addLog(message) {
        this.logMessages.push(message);
        if (this.logMessages.length > 200) { // Keep log manageable
            this.logMessages.shift();
        }
        new Log(this, this.ui).renderLog();
    }

    // Ensure proceedToNextRound correctly sets state and clears UI
    proceedToNextRound() {
        if (this.state === 'win' || this.state === 'game_over') {
            console.log("Game already ended, not proceeding to next round.");
            return; 
        }

        this.currentRound++;
        this.addLog(`--- Round ${this.currentRound} ---`);
        console.log("Current round:", this.currentRound);

        this.ui.updateRoundDisplay(this.currentRound, this.maxRounds);
        let encounterGenerated = false;
        let currentTier = null;

        // Find the tier for the CURRENT round first
        for (const tier of AREA_CONFIG) {
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                currentTier = tier;
                break;
            }
        }
        
        // *** Handle Area Change and Transition ***
        let areaChanged = false;
        if (currentTier && currentTier.areas) {
            const validAreaIds = Object.keys(currentTier.areas);
            if (validAreaIds.length > 0 && !validAreaIds.includes(this.currentArea)) {
                 const previousArea = this.currentArea;
                 const newAreaIndex = Math.floor(Math.random() * validAreaIds.length);
                 this.currentArea = validAreaIds[newAreaIndex];
                 // Store the name for the UI
                 this.pendingAreaTransitionName = currentTier.areas[this.currentArea]?.name || this.currentArea.replace('_', ' ');
                 areaChanged = true;
                 console.log(`[Area Change] Determined new area: ${this.currentArea}`);
            }
        } else if (this.currentRound === 1 && (!this.currentArea || (currentTier && !currentTier.areas))) { 
             // Special handling for initializing area on round 1
             const firstTier = AREA_CONFIG[0];
             if (firstTier && firstTier.areas) {
                 const firstTierAreaIds = Object.keys(firstTier.areas);
                 if (firstTierAreaIds.length > 0) {
                    this.currentArea = firstTierAreaIds[Math.floor(Math.random() * firstTierAreaIds.length)];
                    // Store the name for the UI
                    this.pendingAreaTransitionName = firstTier.areas[this.currentArea]?.name || this.currentArea.replace('_', ' ');
                    areaChanged = true;
                    console.log(`[Area Init] Setting initial area for Round 1 to ${this.currentArea}`);
                 }
             }
        }

        // *** If area changed, show transition and stop ***
        if (areaChanged) {
            this.state = 'area_transition'; // Set new state
            this.ui.clearMainArea(); 
            this.ui.showAreaTransitionScreen(this.pendingAreaTransitionName);
            return; // Exit function early
        }

        // --- If NO area transition, proceed with regular logic ---
        this.state = 'choosing';
        this.ui.clearMainArea();

        // Apply boss round indicators
        if (this.ui.roundAreaElement) {
            this.ui.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss'); // Clear previous
            if (this.currentRound === 10 || this.currentRound === 20) {
                this.ui.roundAreaElement.classList.add('round-miniboss');
            } else if (this.currentRound === 30) {
                this.ui.roundAreaElement.classList.add('round-finalboss');
            }
        }

        // *** Determine Encounter Type using Revised AREA_CONFIG ***
        encounterGenerated = false;
        currentTier = null;

        // Find the tier for the CURRENT round first
        for (const tier of AREA_CONFIG) {
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                currentTier = tier;
                break;
            }
        }
        
        // *** NEW: Validate and Update Area if Necessary ***
        if (currentTier && currentTier.areas) {
            const validAreaIds = Object.keys(currentTier.areas);
            if (validAreaIds.length > 0 && !validAreaIds.includes(this.currentArea)) {
                 const previousArea = this.currentArea;
                 const newAreaIndex = Math.floor(Math.random() * validAreaIds.length);
                 this.currentArea = validAreaIds[newAreaIndex];
                 console.log(`[Area Correction] Current area '${previousArea}' invalid for Tier ${currentTier.startRound}-${currentTier.endRound}. Changing to '${this.currentArea}'.`);
                 this.addLog(`You venture into the ${currentTier.areas[this.currentArea]?.name || this.currentArea.replace('_', ' ')}!`);
            }
        } else if (this.currentRound === 1 && (!currentTier || !currentTier.areas)) { 
             // Special handling for initializing area on round 1 if the first tier setup is odd
             const firstTier = AREA_CONFIG[0];
             if (firstTier && firstTier.areas) {
                 const firstTierAreaIds = Object.keys(firstTier.areas);
                 if (firstTierAreaIds.length > 0) {
                    this.currentArea = firstTierAreaIds[Math.floor(Math.random() * firstTierAreaIds.length)];
                     console.log(`[Area Init] Setting initial area for Round 1 to ${this.currentArea}`);
                 }
             }
        }

        // *** DEBUG AREA BEFORE BOSS CHECK ***
        console.log(`[Debug] Before boss check (Round ${this.currentRound}): currentArea = ${this.currentArea}, currentTier found = ${!!currentTier}`);
        if(currentTier) {
             const areaDataForLog = currentTier.areas?.[this.currentArea];
             console.log(`[Debug] currentAreaData = ${JSON.stringify(areaDataForLog)}`);
             console.log(`[Debug] Check: (round=${this.currentRound} === 30 && areaData?.finalBoss=${areaDataForLog?.finalBoss}) = ${this.currentRound === 30 && areaDataForLog?.finalBoss}`);
        }
        // *** END DEBUG AREA BEFORE BOSS CHECK ***

        if (currentTier) {
            const currentAreaData = currentTier.areas?.[this.currentArea]; // Get current area data

            // Check if it's round 30 AND the current area has a final boss defined
            if (this.currentRound === 30 && currentAreaData?.finalBoss) {
                 this.generateBossEncounter();
                 encounterGenerated = true;
            // Check if it's the end round of the tier (and not round 30) AND the current area has a miniBoss defined
            } else if (this.currentRound === currentTier.endRound && currentAreaData?.miniBoss) {
                 this.generateBossEncounter();
                 encounterGenerated = true;
            }
        }

        // If it wasn't a boss round, generate normal choices
        if (!encounterGenerated) {
            this.generateEventChoices(); 
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
        new Loot(this, this.ui).handle(this.pendingLoot);
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

    generateEventChoices() {
        this.currentChoices = [];
        
        const roll = Math.random() * 100;
        let numChoices = 3;
        if (roll < 25) {
            numChoices = 4;
        }

        const usedEncounters = new Set();
        while (this.currentChoices.length < numChoices && usedEncounters.size < this.EVENT_PROBABILITY.length) { // Added check against total event types
            const encounter = this.getRandomEvent();
            // Monster ID is now assigned within getRandomEvent
            
            // Create a unique key for the encounter type to prevent duplicates of non-monster events
            // For monsters, the specific monsterId makes it unique
            const encounterKey = encounter.type === 'monster' ? encounter.monsterId : encounter.type;
            
            if (!usedEncounters.has(encounterKey)) {
                usedEncounters.add(encounterKey);
                this.currentChoices.push({ 
                    text: this.getEncounterText(encounter), 
                    encounter: encounter 
                });
            } else if (usedEncounters.size >= this.EVENT_PROBABILITY.length) {
                 // Safety break if we run out of unique event types 
                 console.warn("Ran out of unique event types to generate choices.");
                 break;
            } 
        }
        
        // Ensure at least one choice if loop fails (e.g., all weights 0 or error)
        if (this.currentChoices.length === 0) {
            console.warn("Failed to generate any event choices, defaulting to Rest.");
            const defaultEncounter = { type: 'rest' };
             this.currentChoices.push({ 
                text: this.getEncounterText(defaultEncounter),
                encounter: defaultEncounter
            });
        }

        this.ui.renderChoices(this.currentChoices);
    }

    getRandomEvent() {
        const totalWeight = this.EVENT_PROBABILITY.reduce((sum, enc) => sum + enc.weight, 0);
        let randomRoll = Math.random() * totalWeight;
        let chosenEncounter = null;

        for (const encounter of this.EVENT_PROBABILITY) {
            if (randomRoll < encounter.weight) {
                chosenEncounter = { type: encounter.type };
                
                // If it's a monster event, pick an appropriate monster based on area
                if (chosenEncounter.type === 'monster') {
                    let monsterPool = [];
                    let currentTier = null;

                    // Find the current tier based on the round
                    for (const tier of AREA_CONFIG) { // Use AREA_CONFIG
                        if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                            currentTier = tier;
                            break;
                        }
                    }

                    // Select monster pool based on current area and tier config
                    if (currentTier && currentTier.areas && currentTier.areas[this.currentArea] && currentTier.areas[this.currentArea].monsters) {
                        monsterPool = currentTier.areas[this.currentArea].monsters;
                    } else {
                        console.warn(`Could not determine monster pool for round ${this.currentRound} and area ${this.currentArea} using AREA_CONFIG.`);
                        monsterPool = []; // Default to empty if no pool found
                    }
                    
                    if (monsterPool.length > 0) {
                        chosenEncounter.monsterId = monsterPool[this.getRandomInt(0, monsterPool.length - 1)];
                    } else {
                        console.error(`Monster pool empty for round ${this.currentRound}! Cannot select monster.`);
                        chosenEncounter = { type: 'rest' };
                    }
                }
                break;
            }
            randomRoll -= encounter.weight;
        }
        
        // Fallback if somehow no encounter is chosen (shouldn't happen with weights)
        if (!chosenEncounter) {
             console.warn("No encounter chosen based on weights, defaulting to rest.");
             chosenEncounter = { type: 'rest' };
        }

        return chosenEncounter;
    }

    getEncounterText(encounter) {
        switch (encounter.type) {
            case 'monster':
                // Make sure monsterId exists before trying to access MONSTERS
                return `Fight ${MONSTERS[encounter.monsterId]?.name || 'Unknown Monster'}`;
            case 'rest':
                return 'Rest Site';
            case 'shop':
                return 'Shop';
            case 'forge':
                return 'Blacksmith Workshop';
            case 'fishing':
                return 'Go Fishing!';
            case 'blacksmith':
                return "Visit Blacksmith";
            case 'sharpen':
                return "Use Sharpening Stone";
            case 'armorsmith':
                return "Visit Armorsmith";
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

    // *** Combined Boss Generation Logic (Revised) ***
    generateBossEncounter() {
        let bossId = null;
        let currentTier = null;

        // Find the tier corresponding to the current round
        for (const tier of AREA_CONFIG) {
            // *** Updated check to simply find the tier the current round falls into ***
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) { 
                currentTier = tier;
                break;
            }
        }

        if (!currentTier) {
            console.error(`Could not find tier config for boss round ${this.currentRound}.`);
            this.generateEventChoices(); 
            return;
        }

        // *** Updated Logic to check for finalBoss first, then miniBoss within the area ***
        const currentAreaData = currentTier.areas?.[this.currentArea];

        if (this.currentRound === 30 && currentAreaData?.finalBoss) {
            // Check for final boss specifically on round 30 in the current area data
            bossId = currentAreaData.finalBoss;
        } else if (currentTier.endRound === this.currentRound && currentAreaData?.miniBoss) {
            // Check for mini-boss on the last round of the tier in the current area data
            bossId = currentAreaData.miniBoss;
        } 

        // *** DEBUGGING ***
        console.log(`generateBossEncounter: Determined bossId = ${bossId}`);
        console.log(`generateBossEncounter: MONSTERS object keys:`, Object.keys(MONSTERS || {}));
        console.log(`generateBossEncounter: MONSTERS[${bossId}] =`, MONSTERS ? MONSTERS[bossId] : 'MONSTERS is undefined');
        // *** END DEBUGGING ***

        if (bossId && MONSTERS[bossId]) {
            const bossData = MONSTERS[bossId];
            this.ui.renderBossEncounter(bossData, bossId);
        } else {
            console.error(`Could not determine or find boss data for round ${this.currentRound} in area ${this.currentArea}.`);
            this.generateEventChoices(); // Fallback to regular choices
        }
    }

    selectChoice(index) {
        if (this.state !== 'choosing' || index < 0 || index >= this.currentChoices.length) {
            return;
        }
        // Just select the choice, the UI will handle showing details in the card
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
                // Construct the details string, including the description if available
                let details = `${monster.name}\n` +
                       `Health: ${monster.health} // Attack: ${monster.attack} // Defense: ${monster.defense} // Attack Speed: ${monster.speed}s // ` +
                       `Gold Drop: ${monster.goldDrop[0]}-${monster.goldDrop[1]}\n\n`;
                if (monster.description) {
                    details += `${monster.description}\n\n`; // Add the description
                }
                details += `This will start a combat encounter. Are you ready to fight?`;
                return details;
            }
            case 'rest':
                return `Rest at this site to recover 20-70% of your maximum health (${Math.floor(this.player.maxHealth * 0.2)}-${Math.floor(this.player.maxHealth * 0.7)} HP).\n` +
                       `Your maximum HP will also increase by 1.\n\n` +
                       `Do you want to rest here?`;
            case 'shop':
                return "Visit a merchant to buy and sell items.\n" +
                       "You can also reroll the shop's inventory once for 3 gold.\n\n" +
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
            case 'armorsmith':
                return "You find an Armorsmith that can enhance armor.\n" +
                       "Select one piece of armor to permanently increase its defense by 1.\n\n" +
                       "OR increase its max health by 3.\n\n" +
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
            case 'forge':
                return "Visit the Blacksmith Workshop to enhance or combine your gear using various stations.\n\n" +
                       "Some stations may require a Blacksmith Hammer.\n\n" +
                       "Enter the workshop?"
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
                new Monster(this, this.ui).handle(encounter.monsterId);
                break;
            case 'rest':
                new Rest(this, this.ui).handle();
                break;
            case 'shop':
                new Shop(this, this.ui).handle();
                break;
            case 'fishing':
                new Fishing(this, this.ui).handle();
                break;
            case 'blacksmith':
                new Blacksmith(this, this.ui).handle();
                break;
            case 'sharpen':
                new Sharpen(this, this.ui).handle();
                break;
            case 'armorsmith':
                new Armoury(this, this.ui).handle();
                break;
            case 'alchemist':
                new Alchemist(this, this.ui).handle();
                break;
            case 'trap':
                new Trap(this, this.ui).handle();
                break;
            case 'treasure_chest':
                new Treasure(this, this.ui).handle();
                break;
            case 'forge':
                new Forge(this, this.ui).handle();
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
            // Logging for auto-unequip is now handled inside Player.equipItem

            // If in combat and equipping a weapon, reset attack timer
            if (this.state === 'combat' && this.currentCombat && result.item.type === 'weapon') {
                this.player.attackTimer = this.player.getAttackSpeed();
                // Pass breath timer arguments to prevent hiding
                this.currentCombat.ui.updateCombatTimers(
                    this.player.attackTimer,
                    this.currentCombat.enemy.attackTimer,
                    0, // playerDelay
                    this.currentCombat.enemy.breathAttackTimer, // Pass breath timer
                    this.currentCombat.enemy.breathAttackInterval // Pass breath interval
                );
            }

            this.ui.renderInventory(); // Update inventory for visual indicator
            this.ui.renderEquipment();
            this.ui.updatePlayerStats();
        } else {
            this.addLog(`Equip failed: ${result.message}`);
        }
    }

    handleUnequipItem(index) { // Changed parameter to index
        const result = this.player.unequipItem(index);
        if (result.success) {
            this.addLog(`Unequipped ${result.item.name}.`);
            this.ui.renderInventory(); // Update inventory to remove visual indicator
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
                
                // Render inventory FIRST to reflect item consumption
                this.ui.renderInventory(); 

                // Add heal splat for non-combat heals - TARGET THE SPECIFIC SLOT
                // Show splat even if heal amount is 0 (e.g., eating at full health)
                if (useResult.item?.healAmount !== undefined) { // Check if it was a healing item attempt
                   // Simplify the selector
                   const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                   const amountToShow = useResult.healedAmount || 0; // Show +0 if full health
                   const splatType = useResult.item?.isPotion ? 'potion-heal' : 'heal'; 
                   this.ui.createDamageSplat(slotSelector, amountToShow, splatType); // Pass the specific type
                } else if (useResult.buffType) { // NEW: Check for buffs
                    const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                    const buffAmount = useResult.buffAmount;
                    const buffSplatType = `buff-${useResult.buffType}`; // e.g., buff-attack
                    this.ui.createDamageSplat(slotSelector, buffAmount, buffSplatType);
                }

                this.ui.updatePlayerStats(); // Health/Stats changed
            } else {
                this.addLog(useResult.message); 
            }
        }
    }

    handleDestroyItem(inventoryIndex) {
        const item = this.player.inventory[inventoryIndex]; // Get item before removing
        if (!item) return;

        // Ensure the item is unequipped first (removeItem now handles this, but double-check is safe)
        this.player.unequipItem(inventoryIndex);

        const removedItem = this.player.removeItem(inventoryIndex);
        if (removedItem) {
            this.addLog(`Destroyed ${removedItem.name}.`);
            this.ui.renderInventory();
            this.ui.renderEquipment(); // Update equipment display if the destroyed item was equipped
            this.ui.updatePlayerStats();
        }
    }

    handleSellItem(inventoryIndex) {
        if (this.state !== 'shop') return;
    
        const item = this.player.inventory[inventoryIndex];
        if (!item) return;
    
        const sellPrice = item.value || 0;
        // Ensure item is unequipped before selling
        this.player.unequipItem(inventoryIndex); 
        this.player.removeItem(inventoryIndex); // removeItem now handles unequip internally, but belt-and-suspenders
        this.player.addGold(sellPrice);
        this.addLog(`You sold ${item.name} for ${sellPrice} gold.`);

        this.ui.renderInventory();
        this.ui.renderEquipment();
        this.ui.updatePlayerStats();
        this.ui.updateShopAffordability(); // Call UI method
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

        // --- Update equipment references --- 
        for (const slot in this.player.equipment) {
            if (this.player.equipment[slot] === sourceIndex) {
                this.player.equipment[slot] = targetIndex; // Update index if source was equipped
            } else if (this.player.equipment[slot] === targetIndex) {
                this.player.equipment[slot] = sourceIndex; // Update index if target was equipped
            }
        }

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
                // Re-render the loot UI using the Loot class handler
                new Loot(this, this.ui).handle(this.pendingLoot);
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
                    new Loot(this, this.ui).handle(this.pendingLoot);
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

        // Check if it was the boss by comparing the name to the known final boss
        const isBossDefeated = defeatedName && MONSTERS['ancient_dragon'] && defeatedName === MONSTERS['ancient_dragon'].name;

        if (isBossDefeated) {
            this.endGame(true);
        } else {
            this.proceedToNextRound();
        }
    }

    // Add new method for mini-boss encounters
    generateMiniBossEvent() {
        // Select a random mini-boss
        const miniBossIndex = this.getRandomInt(0, MINI_BOSSES.length - 1);
        const miniBossId = MINI_BOSSES[miniBossIndex];
        
        this.currentChoices = [{
            text: `Fight ${MONSTERS[miniBossId].name} (Mini-Boss)`,
            encounter: { type: 'mini-boss', monsterId: miniBossId }
        }];
        
        this.addLog(`A powerful enemy approaches...`);
        this.ui.renderChoices(this.currentChoices);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    rollDamage(maxAttack) {
        if (maxAttack <= 0) return 0;
        // Roll between 0 and maxAttack (inclusive)
        return this.getRandomInt(0, maxAttack);
    }
    
    createItem(itemId) {
        const template = ITEMS[itemId];
        if (!template) {
            console.error(`Item template not found for ID: ${itemId}`);
            return null;
        }
        // Simple deep copy for plain objects; use structuredClone for more complex objects if needed
        const newItem = JSON.parse(JSON.stringify(template));
        newItem.baseId = itemId; // Add baseId tracking
        return newItem;
    }

    // *** NEW FUNCTION to continue after transition ***
    continueAfterAreaTransition() {
        if (this.state !== 'area_transition') {
            console.warn("Tried to continue transition, but not in transition state.");
            return;
        }

        this.addLog(`You venture into ${this.pendingAreaTransitionName}!`);
        this.pendingAreaTransitionName = null; // Clear pending name

        this.state = 'choosing'; // Set state back
        this.ui.clearMainArea(); // Ensure transition screen is cleared

        let encounterGenerated = false;
        let currentTier = null;

        // --- Repeat the logic to decide what to show next ---
        for (const tier of AREA_CONFIG) {
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                currentTier = tier;
                break;
            }
        }

        // Boss Check Logic (repeated)
        if (currentTier) {
            const currentAreaData = currentTier.areas?.[this.currentArea];
            if (this.currentRound === 30 && currentAreaData?.finalBoss) {
                 this.generateBossEncounter();
                 encounterGenerated = true;
            } else if (this.currentRound === currentTier.endRound && currentAreaData?.miniBoss) {
                 this.generateBossEncounter();
                 encounterGenerated = true;
            }
        }

        // Generate regular choices if no boss
        if (!encounterGenerated) {
            this.generateEventChoices();
        }

        this.ui.updatePlayerStats();
        this.ui.renderEquipment();
    }

}