class Game {
    constructor() {
        this.ui = new UI();
        this.ui.game = this;

        this.player = new Player();
        this.currentRound = 0;
        this.maxRounds = 30;
        this.state = 'start_screen';
        this.logMessages = [];
        this.currentChoices = [];
        this.currentCombat = null;
        this.currentShopItems = [];
        this.shopCanReroll = false;
        this.pendingLoot = null;
        let initialAreaId = null;
        const firstTier = AREA_CONFIG[0];
        if (firstTier && firstTier.areas) {
            const tier1AreaIds = Object.keys(firstTier.areas);
            if (tier1AreaIds.length > 0) {
                const randomIndex = Math.floor(Math.random() * tier1AreaIds.length);
                initialAreaId = tier1AreaIds[randomIndex];
            }
        }
        if (!initialAreaId) {
            console.error("Could not determine initial area from AREA_CONFIG Tier 1! Defaulting to null.");
        }
        this.currentArea = initialAreaId;
        this.pendingAreaTransitionName = null;
        this.pendingNewAreaId = null;
        this.lastDefeatedEnemyName = null;

        this.shop = new Shop(this, this.ui);
        this.alchemist = new Alchemist(this, this.ui);
        this.armorsmith = new Armoury(this, this.ui);
        this.sharpen = new Sharpen(this, this.ui);
        this.blacksmith = new Blacksmith(this, this.ui);
        // this.trap = new Trap(this, this.ui); // Removed old Trap instance
        this.weaponMerchant = new WeaponMerchant(this, this.ui);

        this.weightedDiscounts = [
            { percent: 30, weight: 2 },
            { percent: 35, weight: 3 },
            { percent: 40, weight: 4 },
            { percent: 45, weight: 3 },
            { percent: 50, weight: 2 },
        ];
        this.totalDiscountWeight = this.weightedDiscounts.reduce((sum, d) => sum + d.weight, 0);

        this.globalTickIntervalId = null;
        this.globalTickRate = 500; // Tick every 500ms
        this.lastGlobalTickTime = Date.now();

        this.addLog = this.addLog.bind(this);

        this.eventHandlers = {
            'MonsterHandler': Monster, 
            'RestHandler': Rest,       
            'ShopHandler': this.shop,  
            'AlchemistHandler': this.alchemist, 
            // 'TreasureHandler': Treasure, // Removed old handler
            'ForgeHandler': Forge,     
            'FishingHandler': Fishing, 
            // 'TrapHandler': this.trap,  // Removed old handler
            'WeaponMerchantHandler': this.weaponMerchant, 
            'ShrineHandler': new Shrine(this, this.ui), 
            'TreasureRoomHandler': new TreasureRoom(this, this.ui) // Added new handler instance
        };
        // --- End Handler Registry ---
    }

    EVENT_PROBABILITY = [
        { type: 'monster', weight: 40 },
        { type: 'rest', weight: 10 }, // DONE
        { type: 'shop', weight: 10 }, // DONE
        { type: 'alchemist', weight: 5 }, // DONE
        // { type: 'treasure_chest', weight: 10 }, // Removed
        { type: 'forge', weight: 10 }, // DONE
        { type: 'fishing', weight: 10 }, // Corrected weight for consistency
        // { type: 'trap', weight: 10 }, // Removed
        { type: 'weapon_merchant', weight: 5 },
        { type: 'treasure_room', weight: 15 }, // Added new event probability
        { type: 'ancient_shrine', weight: 5} // Added shrine probability
    ];

    start() {
        this.devMode();
        // this.normalMode();
        this.lastGlobalTickTime = Date.now();
        if (this.globalTickIntervalId) clearInterval(this.globalTickIntervalId);
        this.globalTickIntervalId = setInterval(() => this.gameTick(), this.globalTickRate);
    }

    normalMode() {
        this.player.addItem(this.createItem('wooden_sword'));
        this.player.addItem(this.createItem('bread'));
        this.player.addItem(this.createItem('bread'));
        this.player.addItem(this.createItem('wooden_shield'));
        this.player.addItem(this.createItem('bread'));

        this.player.equipItem(0);
        this.player.equipItem(3);
        this.state = 'area_transition';
        this.ui.renderArea(AREA_CONFIG[0].areas[this.currentArea].name);
        this.ui.gameScreen?.classList.remove('hidden');
        this.ui.renderAll();
        this.addLog("Game started with your chosen equipment.");
    }

    devMode() {
        this.currentRound = 19;
        // this.state = 'choosing';
        this.currentArea = "twisted_forest";

        this.player.health = 13;
        this.player.maxHealth = 13;
        this.player.gold = 0;
        this.player.baseAttack = 2;
        this.player.baseDefense = 2;


        // this.includeRings();
        this.includeWeapons();
        // this.includeArmor();
        // this.includePotions();
        // this.includeFood();
        // this.includeToots();

        this.ui.gameScreen?.classList.remove('hidden');

        this.generateEventChoices();

        this.ui.renderAll();
        this.addLog("Game started with your chosen equipment.");

    }

    includeToots() {
        this.player.addItem(this.createItem('fishing_rod'));
        this.player.addItem(this.createItem('thief_tools'));
        this.player.addItem(this.createItem('blacksmith_hammer'));
    }

    includeFood() {
        this.player.addItem(this.createItem('small_fish'));
        this.player.addItem(this.createItem('medium_fish'));
        this.player.addItem(this.createItem('large_fish'));
        this.player.addItem(this.createItem('cooked_meat'));
        this.player.addItem(this.createItem('bread'));
    }

    includeRings() {
        this.player.addItem(this.createItem('ring_of_strength'));
        this.player.addItem(this.createItem('ring_of_vitality'));
        this.player.addItem(this.createItem('ring_of_protection'));
        this.player.addItem(this.createItem('ring_of_swiftness'));
        this.player.addItem(this.createItem('ring_of_might'));
        this.player.addItem(this.createItem('ring_of_fortitude'));
        this.player.addItem(this.createItem('ring_of_warding'));
        this.player.addItem(this.createItem('ring_of_ferocity'));
    }

    includeWeapons() {
        this.player.addItem(this.createItem('wooden_dagger'));
        this.player.addItem(this.createItem('iron_dagger'));
        this.player.addItem(this.createItem('steel_dagger'));

        this.player.addItem(this.createItem('wooden_sword'));
        this.player.addItem(this.createItem('iron_sword'));
        this.player.addItem(this.createItem('steel_sword'));

        this.player.addItem(this.createItem('wooden_hammer'));
        this.player.addItem(this.createItem('iron_hammer'));
        this.player.addItem(this.createItem('steel_hammer'));
    }

    includeArmor() {
        this.player.addItem(this.createItem('wooden_shield'));
        this.player.addItem(this.createItem('iron_shield'));
        this.player.addItem(this.createItem('steel_shield'));

        this.player.addItem(this.createItem('leather_helm'));
        this.player.addItem(this.createItem('iron_helm'));
        this.player.addItem(this.createItem('steel_helm'));

        this.player.addItem(this.createItem('leather_armor'));
        this.player.addItem(this.createItem('iron_armor'));
        this.player.addItem(this.createItem('steel_armor'));

        this.player.addItem(this.createItem('leather_legs'));
        this.player.addItem(this.createItem('iron_legs'));
        this.player.addItem(this.createItem('steel_legs'));
    }

    includePotions() {
        this.player.addItem(this.createItem('health_potion'));
        this.player.addItem(this.createItem('greater_health_potion'));

        this.player.addItem(this.createItem('restoration_potion'));
        this.player.addItem(this.createItem('greater_restoration_potion'));

        this.player.addItem(this.createItem('attack_potion'));
        this.player.addItem(this.createItem('greater_attack_potion'));

        this.player.addItem(this.createItem('defense_potion'));
        this.player.addItem(this.createItem('greater_defense_potion'));

        this.player.addItem(this.createItem('speed_potion'));
        this.player.addItem(this.createItem('greater_speed_potion'));
    }

    addLog(message) {
        this.logMessages.push(message);
        if (this.logMessages.length > 200) {
            this.logMessages.shift();
        }
        new Log(this, this.ui).renderLog();
    }

    proceedToNextRound() {
        if (this.state === 'win' || this.state === 'game_over') return;

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
            this.ui.renderArea(this.pendingAreaTransitionName);
            return;
        }

        this.currentRound++; this.addLog(`--- Round ${this.currentRound} ---`);
        this.ui.renderRound(this.currentRound, this.maxRounds);
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

        // Always collect gold first
        if (this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            this.addLog(`Collected ${this.pendingLoot.gold} gold.`);
            this.pendingLoot.gold = 0; // Mark gold as collected
        }

        let itemsTaken = 0;
        if (this.pendingLoot.items) {
            const itemsToLoot = this.pendingLoot.items.filter(item => !item.looted);
            for (let i = 0; i < itemsToLoot.length; i++) {
                const item = itemsToLoot[i];
                if (this.player.addItem(item)) {
                    item.looted = true; // Mark item as collected in the original pendingLoot array
                    itemsTaken++;
                    this.addLog(`Picked up ${item.name}.`);
                } else {
                    this.addLog(`Inventory full! Could not pick up ${item.name}.`);
                    break; // Stop trying to add items if inventory is full
                }
            }
        }

        // Refresh the loot UI to show remaining items/update buttons
        new Loot(this, this.ui).handle(this.pendingLoot);

        // If all loot was successfully taken, automatically continue
        if (this.isAllLootCollected()) {
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
            // const encounterKey = encounter.type;

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
        // Calculate total weight from EVENTS_DATA
        const eventTypes = Object.keys(EVENTS_DATA);
        // Filter out types with 0 or undefined weight just in case
        const validEventTypes = eventTypes.filter(type => EVENTS_DATA[type] && EVENTS_DATA[type].weight > 0);
        const totalWeight = validEventTypes.reduce((sum, type) => sum + EVENTS_DATA[type].weight, 0);

        if (totalWeight <= 0) {
             console.error("Total event weight is zero or negative. Check EVENTS_DATA.");
             return { type: 'rest' }; // Fallback
        }

        let randomRoll = Math.random() * totalWeight;
        let chosenEventType = null;

        for (const type of validEventTypes) {
            if (randomRoll < EVENTS_DATA[type].weight) {
                chosenEventType = type;
                break;
            }
            randomRoll -= EVENTS_DATA[type].weight;
        }

        if (!chosenEventType) {
            console.warn("No event type chosen based on weights, defaulting to rest.");
            chosenEventType = 'rest'; // Fallback
        }

        let chosenEncounter = { type: chosenEventType };

        // --- Handle specific event setup ---
        if (chosenEventType === 'monster') {
            // Monster selection logic remains the same (area, difficulty)
            let monsterPoolIds = [];
            let currentTier = null;
            // Find current tier based on this.currentRound
             for (const tier of AREA_CONFIG) {
                 if (this.currentRound >= tier.startRound && this.currentRound <= tier.endRound) {
                     currentTier = tier;
                     break;
                 }
             }

            if (currentTier && currentTier.areas && currentTier.areas[this.currentArea] && currentTier.areas[this.currentArea].monsters) {
                monsterPoolIds = currentTier.areas[this.currentArea].monsters;
            } else {
                 console.warn(`Could not determine monster pool for round ${this.currentRound} and area ${this.currentArea}.`);
                 monsterPoolIds = [];
             }

            if (monsterPoolIds.length > 0) {
                 // Select monsterId based on difficulty weighting
                 const easyMonsters = monsterPoolIds.filter(id => MONSTERS[id]?.difficulty === 'easy');
                 const mediumMonsters = monsterPoolIds.filter(id => MONSTERS[id]?.difficulty === 'medium');
                 const hardMonsters = monsterPoolIds.filter(id => MONSTERS[id]?.difficulty === 'hard');
                 const difficultyRoll = Math.random() * 100;
                 let selectedMonsterId = null;

                 if (difficultyRoll < 60 && easyMonsters.length > 0) {
                     selectedMonsterId = easyMonsters[this.getRandomInt(0, easyMonsters.length - 1)];
                 } else if (difficultyRoll < 90 && mediumMonsters.length > 0) { // 60 + 30
                     selectedMonsterId = mediumMonsters[this.getRandomInt(0, mediumMonsters.length - 1)];
                 } else if (hardMonsters.length > 0) { // 90 + 10
                      selectedMonsterId = hardMonsters[this.getRandomInt(0, hardMonsters.length - 1)];
                 }

                 // Fallbacks if preferred difficulty pool is empty
                 if (!selectedMonsterId) {
                    if (mediumMonsters.length > 0) {
                         selectedMonsterId = mediumMonsters[this.getRandomInt(0, mediumMonsters.length - 1)];
                    } else if (easyMonsters.length > 0) {
                         selectedMonsterId = easyMonsters[this.getRandomInt(0, easyMonsters.length - 1)];
                    } else if (hardMonsters.length > 0) { // Should have been caught above, but safe fallback
                         selectedMonsterId = hardMonsters[this.getRandomInt(0, hardMonsters.length - 1)];
                    } else {
                         // Last resort: pick any monster if categorized lists failed
                         console.warn(`Could not select monster by difficulty for round ${this.currentRound} in area ${this.currentArea}. Picking randomly from pool.`);
                         selectedMonsterId = monsterPoolIds[this.getRandomInt(0, monsterPoolIds.length - 1)];
                    }
                 }
                chosenEncounter.monsterId = selectedMonsterId;
            } else {
                console.error(`Monster pool empty for round ${this.currentRound}! Cannot select monster.`);
                chosenEncounter = { type: 'rest' }; // Fallback to rest if no monsters
            }
        } else if (EVENTS_DATA[chosenEventType]?.needsDiscount) {
            // Add discount if the event definition requires it
            chosenEncounter.discountPercent = this.getRandomMerchantDiscount();
        }

        return chosenEncounter;
    }

    getEncounterText(encounter) {
        const eventType = encounter.type;

        if (eventType === 'monster') {
            // Handle monster name dynamically
            return MONSTERS[encounter.monsterId]?.name || 'Unknown Monster';
        }

        // Get text from the data file using the event type as the key
        const eventData = EVENTS_DATA[eventType];
        return eventData?.choiceText || 'Unknown Encounter';
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
        const eventType = encounter.type;

        if (eventType === 'monster') {
            // Monster details generation remains dynamic
            const monster = MONSTERS[encounter.monsterId];
            if (!monster) return "Error: Monster data not found.";
            let details = `${monster.name}\\n` + // Use double backslash for newline in template literal passed to UI
                `Health: ${monster.health} // Attack: ${monster.attack} // Defense: ${monster.defense} // Attack Speed: ${monster.speed}s // ` +
                `Gold Drop: ${monster.goldDrop[0]}-${monster.goldDrop[1]}\\n\\n`;
            if (monster.description) {
                details += `${monster.description}\\n\\n`;
            }
            details += `This will start a combat encounter. Are you ready to fight?`;
            return details;
        }

        const eventData = EVENTS_DATA[eventType];
        if (!eventData || !eventData.detailsTemplate) {
            return "Details not available for this encounter.";
        }

        // Simple templating for dynamic values
        let details = eventData.detailsTemplate;
        // Replace placeholders (use double backslash for literal \n if needed by UI)
        details = details.replace(/\{\{playerGold\}\}/g, this.player.gold);
        // Handle optional discount text
        if (eventType === 'weapon_merchant' && encounter.discountPercent) {
             const discountHtml = `<span style="color: #4CAF50; font-weight:bold;">Offering ${encounter.discountPercent}% OFF today!</span>\\n\\n`;
             details = details.replace(/\{\{discountText\}\}/g, discountHtml);
        } else {
            details = details.replace(/\{\{discountText\}\}/g, ''); // Remove placeholder if no discount
        }
         // Add more replacements here if other templates need dynamic data (e.g., {{currentRound}})

        // Ensure newlines from the template are preserved for HTML display if needed
        details = details.replace(/\\n/g, '<br>'); // Example conversion for HTML display

        return details;
    }

    startEncounter(encounter) {
        this.ui.choicesArea.innerHTML = '';
        this.ui.choicesArea.classList.add('hidden');

        const eventType = encounter.type;
        const handlerId = EVENTS_DATA[eventType]?.handler; // Get handler ID from data

        if (!handlerId) {
            this.addLog(`Unknown encounter type or handler ID for: ${eventType}`);
            this.proceedToNextRound();
            return;
        }

        // --- Use the registry ---
        const handler = this.eventHandlers[handlerId];

        if (!handler) {
            this.addLog(`Handler not found in registry for ID: ${handlerId}`);
            this.proceedToNextRound();
            return;
        }

        try {
            // Check if the handler is a class (needs instantiation) or an instance
            // A common check for classes: it's a function and its prototype has a constructor pointing back to itself
            if (typeof handler === 'function' && handler.prototype?.constructor === handler) {
                // It's likely a class constructor (e.g., Rest, Fishing, Monster, Forge, Treasure)
                if (handlerId === 'MonsterHandler') {
                    // Monster needs the monsterId passed to handle
                    if (encounter.monsterId) {
                        new handler(this, this.ui).handle(encounter.monsterId);
                    } else {
                        console.error("Monster encounter chosen but no monsterId provided.");
                        this.proceedToNextRound(); // Fallback
                    }
                } else {
                    // Instantiate and call handle for other classes
                    new handler(this, this.ui).handle();
                }
            } else if (handler && typeof handler.handle === 'function') {
                // It's likely an instance with a handle method (e.g., this.shop, this.alchemist, this.trap, this.weaponMerchant)
                 if (handlerId === 'WeaponMerchantHandler') {
                     // WeaponMerchant needs the full encounter object for discount
                     handler.handle(encounter);
                 } else {
                    // Other instances just need handle called
                    handler.handle();
                 }
            } else {
                // Handler exists in registry but doesn't fit expected patterns
                this.addLog(`Invalid handler registered for ID: ${handlerId}`);
                console.error(`Invalid handler for ${handlerId}:`, handler);
                this.proceedToNextRound();
            }
        } catch (error) {
             this.addLog(`Error executing handler for ${handlerId}: ${error.message}`);
             console.error(`Error in handler ${handlerId}:`, error);
             // Optional: Add more robust error handling, maybe don't proceed?
             this.proceedToNextRound();
        }
        // --- End registry usage ---
    }

    handleEquipItem(index) {
        const result = this.player.equipItem(index);
        if (result.success) {
            this.addLog(`Equipped ${result.item.name}.`);

            // reset attack timer to 0
            // this.player.attackTimer = this.player.getAttackSpeed();

            if (this.state === 'combat' && this.currentCombat && result.item.type === 'weapon') {
                this.player.attackTimer = this.player.getAttackSpeed();
                this.currentCombat.ui.updateCombatTimers(
                    this.player.attackTimer,
                    this.currentCombat.enemy.attackTimer,
                    0,
                    this.currentCombat.enemy.breathAttackTimer,
                    this.currentCombat.enemy.breathAttackInterval,
                    this.currentCombat.enemy.timedStunTimer,
                    this.currentCombat.enemy.timedStunInterval,
                    this.currentCombat.enemy.regenerationTimer,
                    this.currentCombat.enemy.regenerationInterval,
                    this.currentCombat.enemy.slimeAttackTimer,
                    this.currentCombat.enemy.slimeInterval,
                    this.currentCombat.enemy.formSwitchTimer,
                    this.currentCombat.enemy.formSwitchInterval,
                    this.currentCombat.enemy.currentForm
                );
            }

            this.ui.renderInventory();
            this.ui.renderEquipment();
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
                    const amountToShow = useResult.healedAmount || 0;
                    const splatType = useResult.item?.isPotion ? 'potion-heal' : 'heal';
                    this.ui.createDamageSplat(slotSelector, amountToShow, splatType);
                } else if (useResult.item?.healOverTime != undefined) {
                    const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                    const amountToShow = useResult.item?.healOverTime.heal;
                    const splatType = useResult.item?.isPotion ? 'potion-heal' : 'heal';
                    this.ui.createDamageSplat(slotSelector, amountToShow, splatType);
                } else if (useResult.buffType) {
                    const slotSelector = `.inventory-slot[data-index="${inventoryIndex}"]`;
                    const buffAmount = useResult.buffAmount;
                    const buffSplatType = `buff-${useResult.buffType}`;
                    this.ui.createDamageSplat(slotSelector, buffAmount, buffSplatType);
                }

                this.ui.updatePlayerStats();

                // If currently looting, refresh loot UI to update button states
                if (this.state === 'looting' && this.pendingLoot) {
                    new Loot(this, this.ui).handle(this.pendingLoot);
                }
            } else {
                this.addLog(useResult.message);
            }
        }
    }

    handleDestroyItem(inventoryIndex) {
        const item = this.player.inventory[inventoryIndex]; if (!item) return;

        this.player.unequipItem(inventoryIndex); // Unequip first if necessary

        const removedItem = this.player.removeItem(inventoryIndex);
        if (removedItem) {
            this.addLog(`Destroyed ${removedItem.name}.`);
            this.ui.renderInventory();
            this.ui.renderEquipment(); 
            this.ui.updatePlayerStats();

            // If currently looting, refresh loot UI to update button states
            if (this.state === 'looting' && this.pendingLoot) {
                new Loot(this, this.ui).handle(this.pendingLoot);
            }
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
        new Shop(this, this.ui).updateShopAffordability();
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

        // --- Handle Slime Status Swap --- 
        const sourceSlimeDuration = this.player.slimedItems[sourceIndex];
        const targetSlimeDuration = this.player.slimedItems[targetIndex];

        // Clear existing slime status for both slots temporarily
        if (sourceSlimeDuration !== undefined) delete this.player.slimedItems[sourceIndex];
        if (targetSlimeDuration !== undefined) delete this.player.slimedItems[targetIndex];

        // Re-apply slime status to the new slots
        if (sourceSlimeDuration !== undefined) {
            this.player.slimedItems[targetIndex] = sourceSlimeDuration;
        }
        if (targetSlimeDuration !== undefined) {
            this.player.slimedItems[sourceIndex] = targetSlimeDuration;
        }
        // --- End Slime Status Swap --- 

        // Swap items in inventory array
        const temp = this.player.inventory[sourceIndex];
        this.player.inventory[sourceIndex] = this.player.inventory[targetIndex];
        this.player.inventory[targetIndex] = temp;

        // Update equipped item indices
        for (const slot in this.player.equipment) {
            if (this.player.equipment[slot] === sourceIndex) {
                this.player.equipment[slot] = targetIndex;
            } else if (this.player.equipment[slot] === targetIndex) {
                this.player.equipment[slot] = sourceIndex;
            }
        }

        this.ui.renderInventory();
    }

    requestItemDeletion(index) {
        const item = this.player.inventory[index];
        if (!item) {
            console.warn(`Deletion requested for empty slot index: ${index}`);
            return; // No item to delete
        }

        this.handleDestroyItem(index); // Call existing destroy logic directly
    }

    endGame(playerWon) {
        this.ui.showEndScreen(playerWon);


        if (this.currentCombat && this.currentCombat.intervalId) {
            clearInterval(this.currentCombat.intervalId);
            this.currentCombat = null;
        }
        // Clear the global tick interval
        if (this.globalTickIntervalId) {
            clearInterval(this.globalTickIntervalId);
            this.globalTickIntervalId = null;
        }
    }

    handleIndividualLoot(type, index) {
        if (!this.pendingLoot) return;

        let itemTaken = false;
        let itemName = '';

        if (type === 'gold' && this.pendingLoot.gold > 0) {
            this.player.addGold(this.pendingLoot.gold);
            itemName = `${this.pendingLoot.gold} Gold`;
            this.addLog(`Collected ${itemName}.`);
            this.pendingLoot.gold = 0;
            itemTaken = true;
        } else if (type === 'item' && this.pendingLoot.items && index >= 0 && index < this.pendingLoot.items.length) {
            const item = this.pendingLoot.items[index];
            if (item && !item.looted) {
                itemName = item.name;
                if (this.player.addItem(item)) {
                    item.looted = true;
                    this.addLog(`Picked up ${itemName}.`);
                    itemTaken = true;
                } else {
                    this.addLog(`Inventory full! Could not pick up ${itemName}.`);
                }
            }
        }

        // Refresh the loot UI regardless of success to update button states etc.
        new Loot(this, this.ui).handle(this.pendingLoot);

        // Check if all loot is now collected after taking this item
        if (this.isAllLootCollected()) {
            // If everything is taken, automatically proceed
            this.continueLoot(); 
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

        // Clear locked height when leaving loot screen
        const lootArea = this.ui.lootArea;
        if (lootArea && lootArea.dataset.lockedHeight) {
            delete lootArea.dataset.lockedHeight;
            lootArea.style.height = ''; // Remove inline style
        }

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
        this.ui.renderRound(this.currentRound, this.maxRounds);
        this.pendingAreaTransitionName = null;
        this.pendingNewAreaId = null;
        this.state = 'choosing';
        this.ui.clearMainArea();
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

    getRandomMerchantDiscount() {
        let randomWeight = Math.random() * this.totalDiscountWeight;
        for (const discountInfo of this.weightedDiscounts) {
            randomWeight -= discountInfo.weight;
            if (randomWeight <= 0) {
                return discountInfo.percent;
            }
        }
        return 10; // Fallback just in case
    }

    gameTick() {
        const now = Date.now();
        const delta = now - this.lastGlobalTickTime;
        this.lastGlobalTickTime = now;
        const tickSeconds = delta / 1000;

        if (this.player.healOverTimeEffects && this.player.healOverTimeEffects.length > 0 && this.player.health > 0) {
            let totalHeal =0;
            let healThisTick = false;
            for (let i = this.player.healOverTimeEffects.length - 1; i >= 0; i--) {
                const hot = this.player.healOverTimeEffects[i];
                hot.timeLeft = Math.max(0, hot.timeLeft - tickSeconds);
                hot.tickCooldown = Math.max(0, hot.tickCooldown - tickSeconds);
                if (hot.tickCooldown <= 0 && hot.timeLeft > 0) {
                    const actualHeal = this.player.heal(hot.heal); // Use hot.heal instead of hot.rate
                    if (actualHeal >= 0) { // Log even if heal is 0 (e.g., full health)
                        this.addLog(`<span style="color: #66bb6a; font-style: italic;">Restoration heals you for ${actualHeal} HP.</span>`);
                    }
                    hot.tickCooldown = hot.interval; // Reset cooldown for next tick
                    totalHeal += actualHeal;
                    healThisTick = true;
                }
                if (hot.timeLeft <= 0) {
                    this.addLog(`<span style="font-style: italic;">A restoration effect wears off.</span>`);
                    this.player.healOverTimeEffects.splice(i, 1);
                    this.ui.updatePlayerStats();
                }
            }
            if (this.currentCombat && healThisTick) {
                this.ui.updateCombatantHealth('player', this.player.health, this.player.getMaxHealth(), totalHeal, 0, true);
            }
            this.ui.updatePlayerStats(); // Update stats after heal
        }
    }
}