class Game {
    constructor(ui) {
        this.lastDefeatedEnemyName = null;
        this.ui = ui;
        this.player = null;
        this.currentRound = 0;
        this.maxRounds = 30;
        this.state = 'start_screen'; this.logMessages = [];
        this.currentChoices = [];
        this.currentCombat = null;
        this.currentShopItems = [];
        this.shopCanReroll = false;
        this.pendingLoot = null; this.currentArea = Math.random() < 0.5 ? 'spider_cave' : 'wolf_den';
        this.pendingAreaTransitionName = null; this.pendingNewAreaId = null;
        if (this.ui) { this.ui.game = this; }
    }

    EVENT_PROBABILITY = [
        { type: 'monster', weight: 30 },
        { type: 'rest', weight: 10 }, { type: 'shop', weight: 100 },
        { type: 'alchemist', weight: 10 },
        { type: 'treasure_chest', weight: 10 }, { type: 'forge', weight: 10 },
        { type: 'fishing', weight: 10 },
        { type: 'trap', weight: 10 }
    ];

    startGame() {
        this.ui.renderAll();
    }

    addLog(message) {
        this.logMessages.push(message);
        if (this.logMessages.length > 200) {
            this.logMessages.shift();
        }
        new Log(this, this.ui).renderLog();
    }

    proceedToNextRound() {
        if (this.state === 'win' || this.state === 'game_over') {
            return;
        }

        const nextRound = this.currentRound + 1;

        let encounterGenerated = false;
        let currentTier = null;
        for (const tier of AREA_CONFIG) {
            if (nextRound >= tier.startRound && nextRound <= tier.endRound) {
                currentTier = tier;
                break;
            }
        }

        let needsAreaTransition = false;
        let newAreaName = null;
        if (currentTier && currentTier.areas) {
            const validAreaIds = Object.keys(currentTier.areas);
            if (validAreaIds.length > 0 && !validAreaIds.includes(this.currentArea)) {
                needsAreaTransition = true;
                const newAreaIndex = Math.floor(Math.random() * validAreaIds.length);
                const newAreaId = validAreaIds[newAreaIndex];
                newAreaName = currentTier.areas[newAreaId]?.name || newAreaId.replace('_', ' ');
                this.pendingNewAreaId = newAreaId; this.pendingAreaTransitionName = newAreaName;
            }
        } else if (nextRound === 1 && (!this.currentArea || (currentTier && !currentTier.areas))) {
            const firstTier = AREA_CONFIG[0];
            if (firstTier && firstTier.areas) {
                const firstTierAreaIds = Object.keys(firstTier.areas);
                if (firstTierAreaIds.length > 0) {
                    const newAreaIndex = Math.floor(Math.random() * firstTierAreaIds.length);
                    const newAreaId = firstTierAreaIds[newAreaIndex];
                    needsAreaTransition = true;
                    newAreaName = firstTier.areas[newAreaId]?.name || newAreaId.replace('_', ' ');
                    this.pendingNewAreaId = newAreaId;
                    this.pendingAreaTransitionName = newAreaName;
                }
            }
        }

        if (needsAreaTransition) {
            this.state = 'area_transition';
            this.ui.clearMainArea();
            this.ui.showAreaTransitionScreen(this.pendingAreaTransitionName);
            return;
        }

        this.currentRound++; this.addLog(`--- Round ${this.currentRound} ---`);
        this.ui.updateRoundDisplay(this.currentRound, this.maxRounds);
        this.state = 'choosing';
        this.ui.clearMainArea();

        let tierForThisRound = null;
        for (const tier of AREA_CONFIG) {
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                tierForThisRound = tier;
                break;
            }
        }

        if (tierForThisRound) {
            const currentAreaData = tierForThisRound.areas?.[this.currentArea];
            if (this.currentRound === 30 && currentAreaData?.finalBoss) {
                this.generateBossEncounter();
                encounterGenerated = true;
            } else if (this.currentRound === tierForThisRound.endRound && currentAreaData?.miniBoss) {
                this.generateBossEncounter();
                encounterGenerated = true;
            }
        }

        if (!encounterGenerated) {
            this.generateEventChoices();
        }

        this.ui.updatePlayerStats();
        this.ui.renderEquipment();
        this.ui.renderInventory();
    }

    enterLootState(gold, items) {
        items.forEach(item => {
            if (item.selected === undefined) {
                item.selected = true;
            }
        });
        this.pendingLoot = { gold, items };
        this.state = 'looting';
        this.addLog("Examining loot...");
        new Loot(this, this.ui).handle(this.pendingLoot);
    }

    collectLoot() {
        if (!this.pendingLoot) return;

        const unLootedItems = this.pendingLoot.items ?
            this.pendingLoot.items.filter(item => !item.looted).length : 0;

        const freeSlots = this.player.inventory.filter(slot => slot === null).length;

        if (unLootedItems > freeSlots) {
            this.addLog(`Not enough inventory space! You need ${unLootedItems} free slots.`);
            return;
        }

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

        this.ui.updatePlayerStats();
        this.ui.renderInventory();

        if (allItemsCollected) {
            this.continueLoot();
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
        while (this.currentChoices.length < numChoices && usedEncounters.size < this.EVENT_PROBABILITY.length) {
            const encounter = this.getRandomEvent();

            const encounterKey = encounter.type === 'monster' ? encounter.monsterId : encounter.type;

            if (!usedEncounters.has(encounterKey)) {
                usedEncounters.add(encounterKey);
                this.currentChoices.push({
                    text: this.getEncounterText(encounter),
                    encounter: encounter
                });
            } else if (usedEncounters.size >= this.EVENT_PROBABILITY.length) {
                console.warn("Ran out of unique event types to generate choices.");
                break;
            }
        }

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

                if (chosenEncounter.type === 'monster') {
                    let monsterPool = [];
                    let currentTier = null;

                    for (const tier of AREA_CONFIG) {
                        if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                            currentTier = tier;
                            break;
                        }
                    }

                    if (currentTier && currentTier.areas && currentTier.areas[this.currentArea] && currentTier.areas[this.currentArea].monsters) {
                        monsterPool = currentTier.areas[this.currentArea].monsters;
                    } else {
                        console.warn(`Could not determine monster pool for round ${this.currentRound} and area ${this.currentArea} using AREA_CONFIG.`);
                        monsterPool = [];
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

        if (!chosenEncounter) {
            console.warn("No encounter chosen based on weights, defaulting to rest.");
            chosenEncounter = { type: 'rest' };
        }

        return chosenEncounter;
    }

    getEncounterText(encounter) {
        switch (encounter.type) {
            case 'monster':
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

    generateBossEncounter() {
        let bossId = null;
        let currentTier = null;

        for (const tier of AREA_CONFIG) {
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

        const currentAreaData = currentTier.areas?.[this.currentArea];

        if (this.currentRound === 30 && currentAreaData?.finalBoss) {
            bossId = currentAreaData.finalBoss;
        } else if (currentTier.endRound === this.currentRound && currentAreaData?.miniBoss) {
            bossId = currentAreaData.miniBoss;
        }


        if (bossId && MONSTERS[bossId]) {
            const bossData = MONSTERS[bossId];
            this.ui.renderBossEncounter(bossData, bossId);
        } else {
            console.error(`Could not determine or find boss data for round ${this.currentRound} in area ${this.currentArea}.`);
            this.generateEventChoices();
        }
    }

    selectChoice(index) {
        if (this.state !== 'choosing' || index < 0 || index >= this.currentChoices.length) {
            return;
        }
    }

    confirmChoice(index) {
        const selectedChoice = this.currentChoices[index];
        this.startEncounter(selectedChoice.encounter);
    }

    getEncounterDetails(encounter) {
        switch (encounter.type) {
            case 'monster':
            case 'mini-boss':
            case 'boss': {
                const monster = MONSTERS[encounter.monsterId];
                if (!monster) return "Error: Monster data not found.";
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


    handleEquipItem(index) {
        const result = this.player.equipItem(index);
        if (result.success) {
            this.addLog(`Equipped ${result.item.name}.`);

            if (this.state === 'combat' && this.currentCombat && result.item.type === 'weapon') {
                this.player.attackTimer = this.player.getAttackSpeed();
                this.currentCombat.ui.updateCombatTimers(
                    this.player.attackTimer,
                    this.currentCombat.enemy.attackTimer,
                    0, this.currentCombat.enemy.breathAttackTimer, this.currentCombat.enemy.breathAttackInterval);
            }

            this.ui.renderInventory(); this.ui.renderEquipment();
            this.ui.updatePlayerStats();
        } else {
            this.addLog(`Equip failed: ${result.message}`);
        }
    }

    handleUnequipItem(index) {
        const result = this.player.unequipItem(index);
        if (result.success) {
            this.addLog(`Unequipped ${result.item.name}.`);
            this.ui.renderInventory(); this.ui.renderEquipment();
            this.ui.updatePlayerStats();
        } else {
            this.addLog(`Unequip failed: ${result.message}`);
        }
    }

    handleUseItem(inventoryIndex) {
        if (inventoryIndex < 0 || inventoryIndex >= this.player.inventory.length) {
            console.error(`Invalid inventory index: ${inventoryIndex}`);
            return;
        }

        const item = this.player.inventory[inventoryIndex];
        if (!item) {
            console.warn(`No item found at index: ${inventoryIndex}`);
            return;
        }

        const useResult = this.player.useItem(inventoryIndex);

        if (this.state === 'combat' && this.currentCombat) {
            this.currentCombat.handlePlayerItemUse(useResult);
        } else {
            if (useResult.success) {
                this.addLog(useResult.message);

                this.ui.renderInventory();

                if (useResult.item?.healAmount !== undefined) {
                    const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                    const amountToShow = useResult.healedAmount || 0; const splatType = useResult.item?.isPotion ? 'potion-heal' : 'heal';
                    this.ui.createDamageSplat(slotSelector, amountToShow, splatType);
                } else if (useResult.buffType) {
                    const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                    const buffAmount = useResult.buffAmount;
                    const buffSplatType = `buff-${useResult.buffType}`; this.ui.createDamageSplat(slotSelector, buffAmount, buffSplatType);
                }

                this.ui.updatePlayerStats();
            } else {
                this.addLog(useResult.message);
            }
        }
    }

    handleDestroyItem(inventoryIndex) {
        const item = this.player.inventory[inventoryIndex]; if (!item) return;

        this.player.unequipItem(inventoryIndex);

        const removedItem = this.player.removeItem(inventoryIndex);
        if (removedItem) {
            this.addLog(`Destroyed ${removedItem.name}.`);
            this.ui.renderInventory();
            this.ui.renderEquipment(); this.ui.updatePlayerStats();
        }
    }

    handleSellItem(inventoryIndex) {
        if (this.state !== 'shop') return;

        const item = this.player.inventory[inventoryIndex];
        if (!item) return;

        const sellPrice = item.value || 0;
        this.player.unequipItem(inventoryIndex);
        this.player.removeItem(inventoryIndex); this.player.addGold(sellPrice);
        this.addLog(`You sold ${item.name} for ${sellPrice} gold.`);

        this.ui.renderInventory();
        this.ui.renderEquipment();
        this.ui.updatePlayerStats();
        this.ui.updateShopAffordability();
    }

    handleInventorySwap(sourceIndexStr, targetIndexStr) {
        const sourceIndex = parseInt(sourceIndexStr, 10);
        const targetIndex = parseInt(targetIndexStr, 10);

        if (isNaN(sourceIndex) || isNaN(targetIndex) ||
            sourceIndex < 0 || sourceIndex >= this.player.inventory.length ||
            targetIndex < 0 || targetIndex >= this.player.inventory.length ||
            sourceIndex === targetIndex) {
            console.warn(`Invalid inventory swap attempt: ${sourceIndexStr} -> ${targetIndexStr}`);
            return;
        }

        const temp = this.player.inventory[sourceIndex];
        this.player.inventory[sourceIndex] = this.player.inventory[targetIndex];
        this.player.inventory[targetIndex] = temp;

        for (const slot in this.player.equipment) {
            if (this.player.equipment[slot] === sourceIndex) {
                this.player.equipment[slot] = targetIndex;
            } else if (this.player.equipment[slot] === targetIndex) {
                this.player.equipment[slot] = sourceIndex;
            }
        }


        this.ui.renderInventory();
    }

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
            clearInterval(this.currentCombat.intervalId);
        }
    }

    handleIndividualLoot(type, index) {
        if (!this.pendingLoot) return;

        if (type === 'gold' && this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            this.addLog(`Collected ${this.pendingLoot.gold} gold.`);
            this.pendingLoot.gold = 0;

            this.ui.updatePlayerStats();

            if (this.isAllLootCollected()) {
                this.continueLoot();
            } else {
                new Loot(this, this.ui).handle(this.pendingLoot);
            }
        } else if (type === 'item' && this.pendingLoot.items[index]) {
            const item = this.pendingLoot.items[index];
            if (item.looted) {
                return;
            }
            const freeSlot = this.player.findFreeInventorySlot();
            if (freeSlot === -1) {
                this.addLog("Inventory is full!");
                return;
            }
            if (this.player.addItem(item)) {
                item.looted = true;
                this.addLog(`Picked up ${item.name}.`);
                this.ui.updatePlayerStats();
                this.ui.renderInventory();
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

    isAllLootCollected() {
        if (!this.pendingLoot) return true;

        if (this.pendingLoot.gold > 0) return false;

        if (this.pendingLoot.items && this.pendingLoot.items.length > 0) {
            const hasUnlootedItems = this.pendingLoot.items.some(item => !item.looted);
            return !hasUnlootedItems;
        }

        return true;
    }

    continueLoot() {
        this.pendingLoot = null;

        const defeatedName = this.lastDefeatedEnemyName;
        this.lastDefeatedEnemyName = null;

        const isBossDefeated = defeatedName && MONSTERS['ancient_dragon'] && defeatedName === MONSTERS['ancient_dragon'].name;

        if (isBossDefeated) {
            this.endGame(true);
        } else {
            this.proceedToNextRound();
        }
    }

    generateMiniBossEvent() {
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
        return this.getRandomInt(0, maxAttack);
    }

    createItem(itemId) {
        const template = ITEMS[itemId];
        if (!template) {
            console.error(`Item template not found for ID: ${itemId}`);
            return null;
        }
        const newItem = JSON.parse(JSON.stringify(template));
        newItem.baseId = itemId; return newItem;
    }

    continueAfterAreaTransition() {
        if (this.state !== 'area_transition') {
            console.warn("Tried to continue transition, but not in transition state.");
            return;
        }

        this.currentRound++;

        if (this.pendingNewAreaId) {
            this.currentArea = this.pendingNewAreaId;
        }

        this.addLog(`--- Round ${this.currentRound} ---`);
        this.addLog(`You venture into ${this.pendingAreaTransitionName}!`);
        this.ui.updateRoundDisplay(this.currentRound, this.maxRounds);
        this.pendingAreaTransitionName = null; this.pendingNewAreaId = null;
        this.state = 'choosing'; this.ui.clearMainArea();
        let encounterGenerated = false;
        let currentTier = null;

        for (const tier of AREA_CONFIG) {
            if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                currentTier = tier;
                break;
            }
        }

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


        if (!encounterGenerated) {
            this.generateEventChoices();
        }

        this.ui.updatePlayerStats();
        this.ui.renderEquipment();
    }
}