class UI {
    constructor(game) {
        this.game = game;
        this.draggedItemIndex = null;
        this.draggedItem = null;
        this.lootArea = document.getElementById('loot-area');
        this.lootGold = document.getElementById('loot-gold');
        this.lootItemsContainer = document.getElementById('loot-items');
        this.lootTakeButton = document.getElementById('loot-take-button');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.endMessage = document.getElementById('end-message');
        this.choicesArea = document.getElementById('choices-area');
        this.combatArea = document.getElementById('combat-area');
        this.shopArea = document.getElementById('shop-area');
        this.restArea = document.getElementById('rest-area');
        this.inventoryArea = document.getElementById('inventory-area');
        this.equipmentArea = document.getElementById('equipment-area');
        this.playerStatsArea = document.getElementById('player-stats-area');
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.itemTooltip = document.getElementById('item-tooltip');
        
        // Initialize equipmentTextDisplay as an empty object
        this.equipmentTextDisplay = {}; 
        // Select elements using data-slot in cacheDynamicElements or here
        this.cacheDynamicElements(); 

        this.equipTooltip = document.getElementById('equip-tooltip');
        this.statTooltip = document.getElementById('stat-tooltip');
        this.statHealth = document.getElementById('stat-health-2');
        this.statMaxHealth = document.getElementById('stat-max-health-2');
        this.statAttack = document.getElementById('stat-attack-2');
        this.statDefense = document.getElementById('stat-defense-2');
        this.statSpeed = document.getElementById('stat-speed-2');
        this.statGold = document.getElementById('stat-gold-2');
        this.statRound = document.getElementById('stat-round');
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.combatEnemyBreathTimerContainer = document.querySelector('.enemy-side .breath-timer'); 
        this.combatEnemyBreathTimerText = document.getElementById('combat-enemy-breath-timer');
        this.combatEnemyBreathTimerBar = document.querySelector('.enemy-breath-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        this.outputLogArea = document.getElementById('output-log-area');
        this.outputLog = document.getElementById('output-log');
        this.fishingArea = document.getElementById('fishing-area');
        this.equipSlots = {
            helm: document.getElementById('equip-helm'),
            shield: document.getElementById('equip-shield'),
            body: document.getElementById('equip-body'),
            legs: document.getElementById('equip-legs'),
            ring: document.getElementById('equip-ring')
        };
        document.addEventListener('click', (event) => {
            if (this.itemTooltip && !this.itemTooltip.contains(event.target) && !event.target.closest('.inventory-slot, .shop-item span, .equip-slot')) {
                this.hideTooltip(this.itemTooltip);
            }
            if (this.equipTooltip && !this.equipTooltip.contains(event.target) && !event.target.closest('.equip-slot, .inventory-slot')) {
                this.hideTooltip(this.equipTooltip);
            }
        }, true);
        
        if (this.game) this.game.ui = this;
        if (this.lootTakeButton) this.lootTakeButton.onclick = () => this.game.collectLoot();
        else console.error("UI Error: Loot Take Button not found during constructor.");
        
        this.toggleLogButton = document.getElementById('toggle-log-button');
        if (this.toggleLogButton) this.toggleLogButton.onclick = () => {
            if (this.game) { 
                new Log(this.game, this).showLog();
            } else {
                console.error("Log button clicked but game object is not yet available on UI.");
            }
        };

        this.closeLogButton = document.getElementById('close-log-button');    
        if (this.closeLogButton) this.closeLogButton.onclick = () => {
            if (this.game) { 
                new Log(this.game, this).hideLog();
            } else {
                console.error("Close log button clicked but game object is not yet available on UI.");
            }
        };

        // Cache new combat stat elements
        this.combatPlayerAtk = document.getElementById('combat-player-atk');
        this.combatPlayerDef = document.getElementById('combat-player-def');
        this.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        this.combatEnemyDef = document.getElementById('combat-enemy-def');
        
        // Cache combat timer containers
        this.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        this.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
        // Note: Breath timer container already cached
    }

    cacheDynamicElements() {
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        
        // Populate equipmentTextDisplay using data-slot query
        this.equipmentTextDisplay = {}; // Clear first
        const equipmentDisplay = document.getElementById('equipment-text-display');
        if (equipmentDisplay) {
            const pElements = equipmentDisplay.querySelectorAll('p[data-slot]');
            pElements.forEach(pElement => {
                const slot = pElement.dataset.slot;
                if (slot) {
                    this.equipmentTextDisplay[slot] = pElement; // Store reference to the <p> element
                }
            });
        } else {
            console.error("Could not find #equipment-text-display to cache elements.");
        }

        this.lootGold = document.getElementById('loot-gold');
        this.lootItemsContainer = document.getElementById('loot-items');
        this.lootTakeButton = document.getElementById('loot-take-button');
        if (this.lootTakeButton && !this.lootTakeButton.onclick) {
            this.lootTakeButton.onclick = () => this.game.collectLoot();
        }

        this.statHealth = document.getElementById('stat-health-2');
        this.statMaxHealth = document.getElementById('stat-max-health-2');
        this.statAttack = document.getElementById('stat-attack-2');
        this.statDefense = document.getElementById('stat-defense-2');
        this.statSpeed = document.getElementById('stat-speed-2');
        this.statGold = document.getElementById('stat-gold-2');
        this.statRound = document.getElementById('stat-round');
        if (!this.inventoryArea) {
            this.inventoryArea = document.getElementById('inventory-area');
            if (!this.inventoryArea) {
                console.error("CRITICAL FAILURE: Could not find #inventory-area even in cacheDynamicElements.");
            }
        }

        // Cache stat elements needed for tooltips
        this.statHealthElement = document.getElementById('stat-health-2')?.closest('.stat-item');
        this.statAttackElement = document.getElementById('stat-attack-2')?.closest('.stat-item');
        this.statDefenseElement = document.getElementById('stat-defense-2')?.closest('.stat-item');
        this.statSpeedElement = document.getElementById('stat-speed-2')?.closest('.stat-item');
        this.statGoldElement = document.getElementById('stat-gold-2')?.closest('#inventory-header'); // Find gold in its new parent
        
        // Cache round element for tooltip and indicators
        this.roundAreaElement = document.getElementById('round-area')?.querySelector('.stat-item'); 
        
        // Cache combat stat elements if not already cached by constructor
        if (!this.combatPlayerAtk) this.combatPlayerAtk = document.getElementById('combat-player-atk');
        if (!this.combatPlayerDef) this.combatPlayerDef = document.getElementById('combat-player-def');
        if (!this.combatEnemyAtk) this.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        if (!this.combatEnemyDef) this.combatEnemyDef = document.getElementById('combat-enemy-def');
        if (!this.combatPlayerTimerContainer) this.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        if (!this.combatEnemyTimerContainer) this.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
        // Breath timer container is cached in constructor
    }

    addCombatUITooltipListeners() {
        if (!this.statTooltip) {
            console.error("Stat tooltip element not found. Cannot add combat UI tooltips.");
            return;
        }

        const combatElements = {
            // Target the SPAN containing the label and value
            // playerAtk: { el: this.combatPlayerAtk?.closest('span'), text: "Maximum potential damage per attack." }, 
            // playerDef: { el: this.combatPlayerDef?.closest('span'), text: "Maximum potential damage blocked per hit." }, 
            // enemyAtk: { el: this.combatEnemyAtk?.closest('span'), text: "Enemy's current attack power." }, 
            // enemyDef: { el: this.combatEnemyDef?.closest('span'), text: "Enemy's current defense value." }, 
            playerTimer: { el: this.combatPlayerTimerContainer, text: "Attack every X seconds." }, 
            enemyTimer: { el: this.combatEnemyTimerContainer, text: "Attack every X seconds." }, 
            enemyBreathTimer: { el: this.combatEnemyBreathTimerContainer, text: "Firebreath every X seconds." }
        };

        for (const key in combatElements) {
            const { el, text } = combatElements[key];
            if (el) {
                el.dataset.tooltipTextBase = text; 

                const enterHandler = (e) => {
                    // Get dynamic text first
                    let dynamicText = el.dataset.tooltipTextDynamic;
                    let tooltipText = "No description available."; // Default

                    if (dynamicText) { // Use dynamic if it exists
                        tooltipText = dynamicText;
                    } else { 
                        // Otherwise, get base text directly from the static object
                        tooltipText = combatElements[key]?.text || "No description available."; 
                    }
                    
                    // --- DEBUG LOGGING --- 
                    console.log(`Tooltip Enter: Key=${key}`);
                    console.log(`  Element:`, el);
                    console.log(`  Base Text:`, el.dataset.tooltipTextBase);
                    console.log(`  Dynamic Text:`, el.dataset.tooltipTextDynamic);
                    console.log(`  Tooltip Text After Assignment:`, tooltipText); // Log after assignment
                    // ---------------------

                    // Replace placeholder X with actual speed value for timers
                    if (key === 'playerTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.player?.getAttackSpeed().toFixed(1) || '?');
                    } else if (key === 'enemyTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.currentCombat?.enemy?.currentSpeed.toFixed(1) || '?');
                    } else if (key === 'enemyBreathTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.currentCombat?.enemy?.breathAttackInterval?.toFixed(1) || '?');
                    }

                    this.showTooltip(tooltipText.replace(/\n/g, '<br>'), this.statTooltip, e);
                };
                const leaveHandler = () => {
                    this.hideTooltip(this.statTooltip);
                };

                // Remove potential old listeners
                el.removeEventListener('mouseenter', el._tooltipEnterHandler);
                el.removeEventListener('mouseleave', el._tooltipLeaveHandler);

                el.addEventListener('mouseenter', enterHandler);
                el.addEventListener('mouseleave', leaveHandler);

                // Store handlers for removal
                el._tooltipEnterHandler = enterHandler;
                el._tooltipLeaveHandler = leaveHandler;
            } else {
                console.warn(`Combat Tooltip Listener: Element for key '${key}' not found.`);
            }
        }
    }

    addStatTooltipListeners() {
        const statElements = {
            hp: this.statHealthElement,
            attack: this.statAttackElement,
            defense: this.statDefenseElement,
            speed: this.statSpeedElement,
            gold: this.statGoldElement,
            round: this.roundAreaElement
        };

        for (const key in statElements) {
            const element = statElements[key];
            
            if (element && this.statTooltip) {
                const enterHandler = (e) => {
                    // ALWAYS read from dataset, which is updated by updatePlayerStats
                    const tooltipText = element.dataset.tooltipText || "No description available."; 
                    this.showTooltip(tooltipText.replace(/\\n/g, '<br>'), this.statTooltip, e); 
                };
                const leaveHandler = () => {
                    this.hideTooltip(this.statTooltip);
                };

                // Remove potential old listeners before adding new ones
                // (Basic removal - might need more robust handling if issues persist)
                element.removeEventListener('mouseenter', element._tooltipEnterHandler);
                element.removeEventListener('mouseleave', element._tooltipLeaveHandler);

                element.addEventListener('mouseenter', enterHandler);
                element.addEventListener('mouseleave', leaveHandler);
                
                // Store handlers on the element for potential future removal
                element._tooltipEnterHandler = enterHandler;
                element._tooltipLeaveHandler = leaveHandler;

            } else {
                 if (!element) console.warn(`Tooltip Listener: Element for stat '${key}' not found during listener attachment.`);
                 if (!this.statTooltip) console.warn(`Tooltip Listener: Stat tooltip element not found during listener attachment.`);
            }
        }
        // Call updatePlayerStats once AFTER attaching all listeners to set initial data attributes
        if (this.game && this.game.player) { 
            this.updatePlayerStats(); 
        }
    }

    switchScreen(screenId) {
        if (this.startScreen) this.startScreen.classList.add('hidden');
        if (this.gameScreen) this.gameScreen.classList.add('hidden');
        if (this.endScreen) this.endScreen.classList.add('hidden');
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.remove('hidden');
        }
    }

    renderAll() {
        this.renderInventory();
        this.renderEquipment();
        this.updatePlayerStats();
        new Log(this.game, this).renderLog();
    }

    renderInventory() {
        if (!this.inventoryGrid) {
            console.error("UI Error: inventoryGrid not found during renderInventory.");
            return;
        }
        this.inventoryGrid.innerHTML = '';
        this.game.player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            slot.dataset.index = index;
            
            slot.addEventListener('dragover', (event) => {
                event.preventDefault();
            });
            slot.addEventListener('dragenter', (event) => {
                event.preventDefault();
                if (!slot.classList.contains('dragging')) {
                    slot.classList.add('drag-over');
                }
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const sourceIndex = event.dataTransfer.getData('text/plain');
                const targetIndex = slot.dataset.index;
                if (sourceIndex === null || sourceIndex === undefined || targetIndex === null || targetIndex === undefined) return;
                this.game.handleInventorySwap(sourceIndex, targetIndex);
            });
            slot.classList.remove('slot-empty', 'slot-filled', 'dragging', 'equipped');

            if (item) {
                slot.textContent = item.name;
                slot.classList.add('slot-filled');
                slot.draggable = true;
                
                let clickHandler = null;
                let actionText = '';
                let isEquipped = false;
                for (const slotName in this.game.player.equipment) {
                    if (this.game.player.equipment[slotName] === index) {
                        isEquipped = true;
                        break;
                    }
                }

                if (this.game.state === 'shop') {
                    const sellPrice = item.value || 0;
                    actionText = `[Sell: ${sellPrice} Gold]`;
                    clickHandler = (event) => {
                        event.stopPropagation();
                        this.game.handleSellItem(index);
                        this.createDamageSplat(`.inventory-slot[data-index="${index}"]`, sellPrice + "G", 'sell');
                        this.hideTooltip(this.itemTooltip);
                    };
                    slot.classList.add('shop-sellable');

                    let tooltipHTML = '';
                    if (actionText) {
                        tooltipHTML += `<span class="tooltip-action">${actionText}</span><br>`;
                    }
                    tooltipHTML += item.description || 'No description';

                    slot.addEventListener('mouseenter', (e) => { 
                        this.showTooltip(tooltipHTML, this.itemTooltip, e)
                    }); 
                    slot.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));         
                } else {
                    if (item.type === 'weapon' || item.type === 'armor') {
                        actionText = isEquipped ? '[Unequip]' : '[Equip]';
                        clickHandler = (event) => {
                            event.stopPropagation();
                            if (isEquipped) {
                                this.game.handleUnequipItem(index);
                            } else {
                                this.game.handleEquipItem(index);
                            }
                            this.hideTooltip(this.itemTooltip);
                        };
                    } else if (item.type === 'consumable' && item.useAction) {
                        actionText = `[${item.useAction}]`;
                        clickHandler = (event) => {
                            event.stopPropagation();
                            this.game.handleUseItem(index);
                            this.hideTooltip(this.itemTooltip);
                        };
                    } else {
                        actionText = '[No Action]';
                        slot.style.cursor = 'default';
                    }
                    
                    let tooltipHTML = '';
                    if (actionText) {
                        tooltipHTML += `<span class="tooltip-action">${actionText}</span><br>`;
                    }
                    tooltipHTML += item.description || 'No description';

                    slot.addEventListener('mouseenter', (e) => { 
                        this.showTooltip(tooltipHTML, this.itemTooltip, e)
                    }); 
                    slot.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));                 
                    
                    if (this.game.state === 'blacksmith' && (item.type === 'weapon' || item.type === 'armor')) {
                        slot.classList.add('blacksmith-valid');
                    } else if (this.game.state === 'armourer' && item.type === 'armor') {
                        slot.classList.add('armourer-valid');
                    } else if (this.game.state === 'sharpen' && item.type === 'weapon') {
                        slot.classList.add('sharpen-valid');
                    }
                }

                slot.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move';
                    this.draggedItemIndex = index;
                    this.draggedItem = item;
                    setTimeout(() => slot.classList.add('dragging'), 0);
                    this.hideTooltip(this.itemTooltip);
                    this.hideTooltip(this.equipTooltip);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                    this.inventoryGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    this.draggedItemIndex = null;
                    this.draggedItem = null;
                });
                if (clickHandler) {
                    slot.addEventListener('click', clickHandler);
                }
                
                if (isEquipped) {
                    slot.classList.add('equipped');
                    const chip = document.createElement('span');
                    chip.classList.add('equipped-slot-chip');
                    for (const slotName in this.game.player.equipment) {
                        if (this.game.player.equipment[slotName] === index) {
                            chip.textContent = slotName;
                            break;
                        }
                    }
                    slot.appendChild(chip);
                } else {
                    slot.classList.remove('equipped');
                    if (item.type === 'consumable' && item.useAction === 'Eat') {
                        const foodChip = document.createElement('span');
                        foodChip.classList.add('food-action-chip');
                        foodChip.textContent = 'Food';
                        slot.appendChild(foodChip);
                    } else if (item.type === 'tool') {
                        const toolChip = document.createElement('span');
                        toolChip.classList.add('tool-action-chip');
                        toolChip.textContent = 'Tool';
                        slot.appendChild(toolChip);
                    } else if (item.type === 'consumable' && item.isPotion) {
                        const potionChip = document.createElement('span');
                        potionChip.classList.add('potion-action-chip');
                        potionChip.textContent = 'Potion';
                        slot.appendChild(potionChip);
                    }
                }

            } else {
                slot.textContent = '';
                slot.classList.add('slot-empty');
                slot.draggable = false;
            }
            this.inventoryGrid.appendChild(slot);
        });
    }

    renderEquipment() {
        for (const slotName in this.equipmentTextDisplay) {
            // Now, parentPElement is directly the element we stored
            const parentPElement = this.equipmentTextDisplay[slotName]; 
            if (!parentPElement) {
                 console.warn(`UI renderEquipment: Parent <p> element reference missing for ${slotName}`);
                 continue;
            }
            
            // Find label and button within this <p> element
            const labelSpan = parentPElement.querySelector('.equip-label'); 
            const unequipButton = parentPElement.querySelector(`.unequip-button[data-slot="${slotName}"]`);
            
            if (!labelSpan || !unequipButton) {
                console.warn(`UI renderEquipment: Label or Unequip button not found within parent P for ${slotName}`);
                continue;
            }

            const equippedItemIndex = this.game.player.equipment[slotName];
            let itemDescription = '';
            let isEquipped = false;

            // Reset listeners on the <p> element
            parentPElement.onmouseenter = null;
            parentPElement.onmouseleave = null;

            if (equippedItemIndex !== null && this.game.player.inventory[equippedItemIndex]) {
                const item = this.game.player.inventory[equippedItemIndex];
                itemDescription = item.description || 'No description';
                isEquipped = true;

                // Attach hover listener for equipped item
                parentPElement.onmouseenter = (e) => this.showTooltip(itemDescription, this.equipTooltip, e);
                parentPElement.onmouseleave = () => this.hideTooltip(this.equipTooltip);

                unequipButton.classList.remove('hidden');
                unequipButton.onclick = (e) => {
                    e.stopPropagation();
                    this.game.handleUnequipItem(equippedItemIndex);
                    this.hideTooltip(this.equipTooltip);
                };
            } else {
                // No item equipped, hide button and ADD default tooltip
                unequipButton.classList.add('hidden');
                unequipButton.onclick = null;
                
                // ADD default tooltip for empty slot
                const defaultText = "Slot empty - equip an item!";
                parentPElement.onmouseenter = (e) => this.showTooltip(defaultText, this.equipTooltip, e);
                parentPElement.onmouseleave = () => this.hideTooltip(this.equipTooltip);
            }

            // Add/remove 'equipped' class to the parent <p> AND the label span
            if (isEquipped) {
                parentPElement.classList.add('equipped');
                labelSpan.classList.add('equipped'); 
            } else {
                parentPElement.classList.remove('equipped');
                labelSpan.classList.remove('equipped'); 
            }
        }
    }

    updatePlayerStats() {
        const player = this.game.player;
        const previousRound = this.statRound?.textContent; // Store previous round text

        if (this.statHealth) this.statHealth.textContent = player.health;
        if (this.statMaxHealth) this.statMaxHealth.textContent = player.getMaxHealth();
        
        // Attack
        let attackBase = player.baseAttack + (player.equipment.weapon !== null ? (this.game.player.inventory[player.equipment.weapon]?.stats?.attack || 0) : 0) + (player.equipment.ring !== null ? (this.game.player.inventory[player.equipment.ring]?.stats?.attack || 0) : 0);
        let attackText = `${attackBase}`; 
        let attackTooltip = "Maximum potential damage per attack.";
        if (player.tempAttack > 0) {
            attackText += ` <span class="boosted-stat">(+${player.tempAttack})</span>`;
            attackTooltip = `Maximum potential damage per attack.\nBoosted by +${player.tempAttack} (temporary, lasts until combat ends).`;
        }
        if (this.statAttack) this.statAttack.innerHTML = attackText; // Use innerHTML to render span
        if (this.statAttackElement) this.statAttackElement.dataset.tooltipText = attackTooltip; // Store dynamic tooltip text

        // Defense
        let defenseBase = player.baseDefense;
        Object.values(player.equipment).forEach(index => {
             if (index !== null && this.game.player.inventory[index]?.stats?.defense) {
                 defenseBase += this.game.player.inventory[index].stats.defense;
             }
         });
        let defenseText = `${defenseBase}`;
        let defenseTooltip = "Maximum potential damage blocked per hit.";
        if (player.tempDefense > 0) {
            defenseText += ` <span class="boosted-stat">(+${player.tempDefense})</span>`;
            defenseTooltip = `Maximum potential damage blocked per hit.\nBoosted by +${player.tempDefense} (temporary, lasts until combat ends).`;
        }
        if (this.statDefense) this.statDefense.innerHTML = defenseText; // Use innerHTML
        if (this.statDefenseElement) this.statDefenseElement.dataset.tooltipText = defenseTooltip;
        
        // Speed
        const baseSpeed = player.equipment.weapon !== null ? (this.game.player.inventory[player.equipment.weapon]?.speed ?? player.defaultAttackSpeed) : player.defaultAttackSpeed;
        let finalSpeed = Math.max(0.5, baseSpeed - player.tempSpeedReduction);
        let speedText = `${finalSpeed.toFixed(1)}s`;
        let speedTooltip = "Time between your attacks (lower is faster).";
        if (player.tempSpeedReduction > 0) {
            speedText += ` <span class="boosted-stat">(-${player.tempSpeedReduction.toFixed(1)}s)</span>`;
             speedTooltip = `Time between your attacks (lower is faster).\nBoosted by -${player.tempSpeedReduction.toFixed(1)}s (temporary, lasts until combat ends).`;
        }
        if (this.statSpeed) this.statSpeed.innerHTML = speedText; // Use innerHTML
        if (this.statSpeedElement) this.statSpeedElement.dataset.tooltipText = speedTooltip;

        // Gold & Round (Update normally, keep existing tooltip logic if needed)
        if (this.statGold) this.statGold.textContent = player.gold;
        if (this.statGoldElement) this.statGoldElement.dataset.tooltipText = "Your current wealth."; // Update gold tooltip text
        if (this.statHealthElement) this.statHealthElement.dataset.tooltipText = "Current Health / Maximum Health"; // Update HP tooltip text
        
        if (this.statRound && this.game && this.roundAreaElement) { 
           const currentRound = this.game.currentRound;
           const currentRoundText = `${currentRound}`;
           const maxRoundsElement = document.getElementById('stat-max-rounds');
           
           // --- Round Update & Animation --- 
           if (this.statRound.textContent !== currentRoundText) {
               this.statRound.textContent = currentRoundText; 
               this.roundAreaElement.classList.remove('round-pulsing'); 
               void this.roundAreaElement.offsetWidth; 
               this.roundAreaElement.classList.add('round-pulsing');
               setTimeout(() => {
                   this.roundAreaElement.classList.remove('round-pulsing');
               }, 700); 
           }
           if (maxRoundsElement) maxRoundsElement.textContent = this.game.maxRounds;
           
           // --- Boss Indicators & Dynamic Tooltip --- 
           let roundTooltipText = `Current Round: ${currentRound} / ${this.game.maxRounds}`; // Default tooltip

           if (currentRound === 10 || currentRound === 20) {
               roundTooltipText = `MINI-BOSS APPROACHING! (Round ${currentRound})`; // Boss round tooltip
           } else if (currentRound === 30) {
               roundTooltipText = `FINAL BOSS! The Ancient Dragon awaits... (Round ${currentRound})`; // Final boss tooltip
           }
           
           // Set the dynamic tooltip text
           this.roundAreaElement.dataset.tooltipText = roundTooltipText;
        }
    }

    renderChoices(choices) {
        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = '';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexWrap = 'wrap';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '15px';
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.padding = '10px';
        buttonsContainer.style.maxWidth = '500px'

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.classList.add('choice-button');
            button.style.flex = '0 1 auto';
            button.style.minWidth = '200px';
            button.style.maxWidth = '300px';
            if (index === 0) {
                button.classList.add('selected');
                setTimeout(() => this.game.selectChoice(0), 0);
            }
            
            button.addEventListener('click', () => {
                this.choicesArea.querySelectorAll('.choice-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
                this.game.selectChoice(index);
            });
            buttonsContainer.appendChild(button);
        });

        this.choicesArea.appendChild(buttonsContainer);
    }

    showEncounterConfirmation(choice, index) {
        const existingConfirmation = this.choicesArea.querySelector('.encounter-confirmation');
        if (existingConfirmation) {
            existingConfirmation.remove();
        }

        const confirmationBox = document.createElement('div');
        confirmationBox.classList.add('encounter-confirmation');

        const details = document.createElement('div');
        details.classList.add('encounter-details');
        
        let buttonDisabled = false;
        let requirementHTML = '';
        
        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');

        if (choice.encounter.type === 'fishing') {
            if (!hasFishingRod) {
                requirementHTML = '<div style="color: #ff4444; margin-bottom: 10px;">Requires: Fishing Rod</div>';
                buttonDisabled = true;
            }
        } else if (choice.encounter.type === 'blacksmith' || choice.encounter.type === 'armorsmith') {
            if (!hasHammer) {
                requirementHTML = '<div style="color: #ff4444; margin-bottom: 10px;">Requires: Blacksmith Hammer</div>';
                buttonDisabled = true;
            }
        }
        details.innerHTML = requirementHTML + this.game.getEncounterDetails(choice.encounter);
        confirmationBox.appendChild(details);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('confirmation-buttons');

        const confirmButton = document.createElement('button');
        let difficultyText = '';
        
        if (choice.encounter.type === 'monster' || choice.encounter.type === 'mini-boss' || choice.encounter.type === 'boss') {
            const monster = MONSTERS[choice.encounter.monsterId];
            const playerAttack = this.game.player.getAttack();
            if (monster.defense >= playerAttack) {
                confirmButton.classList.add('difficulty-hard');
                difficultyText = 'HARD';
            } else if (monster.defense >= playerAttack - 2) {
                confirmButton.classList.add('difficulty-medium');
                difficultyText = 'DIFFICULT';
            } else {
                confirmButton.classList.add('difficulty-easy');
                difficultyText = 'EASY';
            }
            confirmButton.textContent = `Start (${difficultyText})`;
        } else {
            confirmButton.textContent = 'Start';
        }

        confirmButton.classList.add('confirm-button');
        confirmButton.onclick = () => this.confirmChoice(index);
        if (buttonDisabled) {
            confirmButton.disabled = true;
        }
        buttonsContainer.appendChild(confirmButton);
        confirmationBox.appendChild(buttonsContainer);

        this.choicesArea.appendChild(confirmationBox);
    }

    clearMainArea() {
        this.choicesArea.classList.add('hidden');
        if (this.combatArea) {
             this.combatArea.classList.add('hidden');
             this.combatArea.classList.remove('combat-ending'); 
        }
        this.shopArea.classList.add('hidden');
        this.restArea.classList.add('hidden');
        this.lootArea.classList.add('hidden');
        this.fishingArea.classList.add('hidden');
        this.outputLogArea.classList.add('hidden');
        if (this.toggleLogButton) this.toggleLogButton.textContent = 'Show Log';

        const trapArea = document.getElementById('trap-area');
        if (trapArea) {
            trapArea.classList.add('hidden');
        }
        const blacksmithArea = document.getElementById('blacksmith-area');
        if (blacksmithArea) {
            blacksmithArea.remove();
        }
        const sharpenArea = document.getElementById('sharpen-area');
        if (sharpenArea) {
            sharpenArea.remove();
        }
        const armourerArea = document.getElementById('armourer-area');
        if (armourerArea) {
            armourerArea.remove();
        }
        const alchemistArea = document.getElementById('alchemist-area');
        if (alchemistArea) {
            alchemistArea.remove();
        }
        const startingPackArea = document.getElementById('starting-pack-area');
        if (startingPackArea) {
            startingPackArea.remove();
        }
        this.choicesArea.innerHTML = '';
        this.cacheDynamicElements();
    }

    updateCombatStats(player, enemy) {
        if (this.combatPlayerAtk) { 
            this.combatPlayerAtk.textContent = player.getAttack();
             // Remove tooltip reset logic
             // const playerAtkParent = this.combatPlayerAtk.closest('span');
             // if (playerAtkParent) playerAtkParent.dataset.tooltipTextDynamic = null; 
        }
        if (this.combatPlayerDef) {
            this.combatPlayerDef.textContent = player.getDefense();
            // Remove tooltip reset logic
            // const playerDefParent = this.combatPlayerDef.closest('span');
            // if (playerDefParent) playerDefParent.dataset.tooltipTextDynamic = null; 
        }
        
        if (this.combatEnemyAtk) {
            this.combatEnemyAtk.textContent = enemy.currentAttack; 
            // const atkParent = this.combatEnemyAtk.closest('span'); // Remove tooltip logic
            if (enemy.currentAttack > enemy.attack) {
                this.combatEnemyAtk.classList.add('enraged');
                 // if (atkParent) atkParent.dataset.tooltipTextDynamic = "Enemy is ENRAGED! Attack is significantly higher.";
            } else {
                this.combatEnemyAtk.classList.remove('enraged');
                 // if (atkParent) atkParent.dataset.tooltipTextDynamic = null; 
            }
        }
        
        if (this.combatEnemyDef) {
            this.combatEnemyDef.textContent = enemy.currentDefense; 
            // const defParent = this.combatEnemyDef.closest('span'); // Remove tooltip logic
            if (enemy.scalesHardened) { 
                this.combatEnemyDef.classList.add('hardened');
                 // if (defParent) defParent.dataset.tooltipTextDynamic = "Enemy scales are HARDENED! Defense is increased.";
            } else {
                this.combatEnemyDef.classList.remove('hardened');
                 // if (defParent) defParent.dataset.tooltipTextDynamic = null; 
            }
        }
    }

    showCombatUI(player, enemy) {
        this.clearMainArea();
        this.combatArea.classList.remove('hidden');
        document.getElementById('combat-enemy-name').textContent = enemy.name;
        this.updateCombatantHealth('player', player.health, player.maxHealth);
        this.updateCombatantHealth('enemy', enemy.health, enemy.maxHealth);
        this.updateCombatTimers(player.attackTimer, enemy.attackTimer);
        this.updateCombatStats(player, enemy); // Call the new function here
    }

    hideCombatUI() {
        this.combatArea.classList.add('hidden');
    }

    updateCombatantHealth(who, current, max, damage = 0, blocked = 0, isHeal = false, fullBlock = false) {
        const percentage = (current / max) * 100;
        if (who === 'player') {
            this.combatPlayerHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.player-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');
            if (damage > 0 || fullBlock) {
                this.createDamageSplat('.player-side', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
            }
        } else if (who === 'enemy') {
            this.combatEnemyHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.enemy-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');
            if (damage > 0 || fullBlock) {
                this.createDamageSplat('.enemy-side', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
            }
        }
    }

    updateCombatTimers(playerTime, enemyTime, playerDelay = 0, enemyBreathTime = null, enemyBreathInterval = null) {
        // Player Timer Update (handle delay)
        this.combatPlayerTimer.textContent = playerDelay > 0 ? 
            `Delayed: ${playerDelay.toFixed(1)}s` : 
            playerTime.toFixed(1);
        const playerMaxTime = this.game.player.getAttackSpeed();
        const playerTimerBar = document.querySelector('.player-timer');
        if (playerDelay > 0) {
            playerTimerBar.style.width = `${(playerDelay / 2) * 100}%`;
            playerTimerBar.style.backgroundColor = '#ffd700'; // Gold color for delay
        } else {
            playerTimerBar.style.width = `${(1 - (playerTime / playerMaxTime)) * 100}%`; // Fill up as timer decreases
            playerTimerBar.style.backgroundColor = ''; // Reset to default
        }

        // Enemy Attack Timer Update
        this.combatEnemyTimer.textContent = enemyTime.toFixed(1);
        const enemyMaxTime = this.game.currentCombat.enemy.currentSpeed; // Use currentSpeed
        const enemyTimerBar = document.querySelector('.enemy-timer');
        enemyTimerBar.style.width = `${(1 - (enemyTime / enemyMaxTime)) * 100}%`; // Fill up

        // Enemy Breath Timer Update (Conditional)
        if (this.combatEnemyBreathTimerContainer && this.combatEnemyBreathTimerText && this.combatEnemyBreathTimerBar) {
            if (enemyBreathTime !== null && enemyBreathInterval !== null) {
                this.combatEnemyBreathTimerContainer.classList.remove('hidden');
                this.combatEnemyBreathTimerText.textContent = enemyBreathTime.toFixed(1);
                const breathPercentage = (1 - (enemyBreathTime / enemyBreathInterval)) * 100;
                this.combatEnemyBreathTimerBar.style.width = `${breathPercentage}%`;
            } else {
                this.combatEnemyBreathTimerContainer.classList.add('hidden');
            }
        } else {
            // Log error if elements aren't found, only once maybe?
             if (!this._breathTimerErrorLogged) { // Prevent console spam
                 console.error("UI Error: Breath timer elements not found during update.");
                 this._breathTimerErrorLogged = true;
             }
        }
    }

    showTooltip(text, tooltipElement, event) {
        if (!tooltipElement) {
            //console.warn("Attempted to show tooltip with null element.");
            return; // Add safety check
        }
        tooltipElement.innerHTML = text;
        tooltipElement.classList.remove('hidden');

        let top = event.clientY + 15;
        let left = event.clientX + 15;
        tooltipElement.style.left = '0px';
        tooltipElement.style.top = '0px';
        const rect = tooltipElement.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (left + rect.width > vw - 20) { left = event.clientX - rect.width - 15; }
        if (top + rect.height > vh - 20) { top = event.clientY - rect.height - 15; }
        left = Math.max(10, left);
        top = Math.max(10, top);
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
    }

    hideTooltip(tooltipElement) {
        if (tooltipElement) { // Check if element exists before hiding
            tooltipElement.classList.add('hidden');
        }
    }

    updateShopAffordability() {
        if (!this.game || this.game.state !== 'shop') return; // Add safety checks
        
        const shopArea = document.getElementById('shop-area');
        if (!shopArea || shopArea.classList.contains('hidden')) return;

        // Update buy buttons based on player gold
        const shopItems = shopArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const index = parseInt(shopItemDiv.dataset.index);
            if (isNaN(index) || !this.game.currentShopItems || !this.game.currentShopItems[index]) return; // More checks
            
            const item = this.game.currentShopItems[index];
            const buyButton = shopItemDiv.querySelector('.shop-item-button');
            
            if (item && buyButton) {
                const canAfford = this.game.player.gold >= item.buyPrice;
                buyButton.disabled = !canAfford;
            }
        });
        
        // Update reroll button based on player gold and reroll status
        const rerollButton = document.getElementById('shop-reroll-button');
        if (rerollButton) { // Check if button exists
            const canAffordReroll = this.game.player.gold >= 3; // Assuming cost is 3
            rerollButton.disabled = !this.game.shopCanReroll || !canAffordReroll;
        }
    }

    showEndScreen(win) {
        const backdrop = document.createElement('div');
        backdrop.className = 'escape-backdrop';
        document.body.appendChild(backdrop);

        const container = document.createElement('div');
        container.className = 'game-over-container';

        let content = '';
        if (win) {
            content = `
                <h2>Victory!</h2>
                <p>You have defeated the Ancient Dragon and saved the realm!</p>
                <p>Congratulations on completing your quest.</p>
            `;
        } else {
            content = `
                <h2>Game Over</h2>
                <p>Your journey has come to an end...</p>
                <p>Better luck on your next adventure!</p>
            `;
        }

        content += `<button onclick="window.location.reload()">Play Again</button>`;
        container.innerHTML = content;
        document.body.appendChild(container);
    }

    createDamageSplat(selector, amount, type = 'damage', blocked = 0, fullBlock = false) {
        const container = document.querySelector(selector);
        if (!container) {
            console.error(`Damage splat container not found with selector: ${selector}`);
            return;
        }

        const splat = document.createElement('div');
        splat.className = `damage-splat ${type}`;
        splat.style.position = 'absolute'; // Ensure absolute positioning
        
        const x = Math.random() * 60 - 20;
        splat.style.left = `calc(50% + ${x}px)`;
        
        if (selector.includes('.inventory-slot')) { 
            splat.style.top = '25%'; // Start higher within inventory slot
        } else if (selector.includes('.trap-area-option')) { 
            splat.style.top = '30%'; // Position within the trap card
        } else if (selector === '#rest-area .rest-campfire-container') {
            splat.style.top = '30%'; 
        } else if (selector === '.escape-message-container') { // NEW: Handle escape message
            splat.style.top = '1%'; // Position near the top of the message box
        } else if (selector === '#trap-area') {
            const y = Math.random() * 60 - 20;
            splat.style.top = `calc(30% + ${y}px)`;
        }
        if (type === 'damage') {
            if (fullBlock) {
                splat.innerHTML = `<span style="color: #aaaaaa">BLOCKED ${blocked}</span>`;
            } else if (blocked > 0) {
                splat.textContent = amount;
            } else {
                splat.textContent = amount;
            }
        } else if (type === 'heal' || type === 'potion-heal') { 
            splat.textContent = '+' + amount;
        } else if (type === 'buff-attack') {
            splat.textContent = `+${amount} Atk`;
        } else if (type === 'buff-defense') {
            splat.textContent = `+${amount} Def`;
        } else if (type === 'buff-speed') {
            // Speed buff is a reduction, so show as negative
            splat.textContent = `-${amount.toFixed(1)}s Spd`; 
        } else {
            splat.textContent = '+' + amount;
        }

        container.appendChild(splat);
        console.log("[createDamageSplat] Damage splat appended:", splat);
        // Re-enable removal
        setTimeout(() => splat.remove(), 2000);
    }

    confirmChoice(index) {
        const selectedChoice = this.game.currentChoices[index];
        const choicesArea = document.getElementById('choices-area');
        
        // Remove boss indicator animations before starting
        if (this.roundAreaElement) { 
            this.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
        }

        // Only add epic animation for boss rounds
        if (this.game.currentRound === 10 || this.game.currentRound === 20 || this.game.currentRound === 30) {
            choicesArea.classList.add('encounter-starting');
        }
        
        // Delay slightly even without animation for smoother transition
        const delay = (this.game.currentRound === 10 || this.game.currentRound === 20 || this.game.currentRound === 30) ? 500 : 50;

        setTimeout(() => {
            choicesArea.classList.remove('encounter-starting'); // Remove class regardless (safe if not added)
            this.game.startEncounter(selectedChoice.encounter); 
        }, delay);
    }
}