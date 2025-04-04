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

        this.roundAreaElement = document.getElementById('round-area');
        // Cache Area Description Element
        this.areaDescriptionElement = document.getElementById('area-description'); 
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

        // --- Add listener for player health bar for POISON tooltip --- 
        const playerHealthBarContainer = document.querySelector('.player-side .health-bar-container');
        
        const poisonEnterHandler = (e) => {
            if (this.game?.player?.activeEffects?.poison) { // Only show if poisoned
                 this.showTooltip("You are poisoned!", this.statTooltip, e);
            }
        };
        const poisonLeaveHandler = () => {
            this.hideTooltip(this.statTooltip);
        };

        // Attach listeners ONLY to the health bar container
        if (playerHealthBarContainer) {
            // Remove potential old listeners
            playerHealthBarContainer.removeEventListener('mouseenter', playerHealthBarContainer._tooltipEnterHandler);
            playerHealthBarContainer.removeEventListener('mouseleave', playerHealthBarContainer._tooltipLeaveHandler);
            // Attach new listeners
            playerHealthBarContainer.addEventListener('mouseenter', poisonEnterHandler);
            playerHealthBarContainer.addEventListener('mouseleave', poisonLeaveHandler);
            // Store handlers for removal
            playerHealthBarContainer._tooltipEnterHandler = poisonEnterHandler;
            playerHealthBarContainer._tooltipLeaveHandler = poisonLeaveHandler;
        } else {
            console.warn("Combat Tooltip Listener: Player health bar container not found.");
        }
        // -------------------------------------------------------------

        // Loop for other combat tooltips (timers, enemy stats)
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
            round: this.roundAreaElement,
            area: this.areaDescriptionElement
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
            
            // --- Unconditional Drop Target Listeners (for ALL slots) ---
            slot.addEventListener('dragover', (event) => {
                event.preventDefault();
                if (!slot.classList.contains('dragging')) { // Prevent self-drop visual
                    slot.classList.add('drag-over');
                }
            });
            slot.addEventListener('dragenter', (event) => {
                event.preventDefault(); // Necessary for drop to work
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const sourceIndex = event.dataTransfer.getData('text/plain');
                const targetIndex = slot.dataset.index;
                if (sourceIndex === null || sourceIndex === undefined || targetIndex === null || targetIndex === undefined || sourceIndex === targetIndex) return;
                this.game.handleInventorySwap(sourceIndex, targetIndex);
            });
            // ------------------------------------------------------------

            slot.classList.remove('slot-empty', 'slot-filled', 'dragging', 'equipped', 'food-stunned'); 

            if (item) {
                slot.textContent = item.name;
                slot.classList.add('slot-filled');
                slot.draggable = true; // Only filled slots are draggable

                // --- Draggable Source Listener (for FILLED slots only) ---
                slot.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move';
                    this.draggedItemIndex = index;
                    this.draggedItem = item;
                    setTimeout(() => slot.classList.add('dragging'), 0);
                    this.hideTooltip(this.itemTooltip); // Hide tooltips during drag
                    this.hideTooltip(this.equipTooltip);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                    // Clean up any lingering drag-over styles on ALL slots
                    this.inventoryGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    this.draggedItemIndex = null;
                    this.draggedItem = null;
                });
                // -------------------------------------------------------
                
                let originalClickHandler = null; 
                let originalActionText = '';   
                let isEquipped = false;
                for (const slotName in this.game.player.equipment) {
                    if (this.game.player.equipment[slotName] === index) {
                        isEquipped = true;
                        break;
                    }
                }

                if (this.game.state === 'shop') {
                    const sellPrice = item.value || 0;
                    originalActionText = `[Sell: ${sellPrice} Gold]`;
                    originalClickHandler = (event) => {
                        event.stopPropagation();
                        this.game.handleSellItem(index);
                        this.createDamageSplat(`.inventory-slot[data-index="${index}"]`, sellPrice + "G", 'sell');
                        this.hideTooltip(this.itemTooltip);
                     };
                    slot.classList.add('shop-sellable');
                } else {
                    if (item.type === 'weapon' || item.type === 'armor') {
                        originalActionText = isEquipped ? '[Unequip]' : '[Equip]';
                        originalClickHandler = (event) => {
                            event.stopPropagation();
                            if (isEquipped) {
                                this.game.handleUnequipItem(index);
                            } else {
                                this.game.handleEquipItem(index);
                            }
                            this.hideTooltip(this.itemTooltip);
                        };
                    } else if (item.type === 'consumable' && item.useAction) {
                        originalActionText = `[${item.useAction}]`;
                        originalClickHandler = (event) => {
                            event.stopPropagation();
                            this.game.handleUseItem(index);
                            this.hideTooltip(this.itemTooltip);
                        };
                    } else {
                        originalActionText = '[No Action]';
                        slot.style.cursor = 'default';
                    }
                    
                    let tooltipHTML = '';
                    if (originalActionText) {
                        tooltipHTML += `<span class="tooltip-action">${originalActionText}</span><br>`;
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

                // --- Stun Check & Visuals --- 
                let isStunnedAndFood = false;
                if (this.game.state === 'combat' && this.game.player.isStunned && item.useAction === 'Eat') {
                    isStunnedAndFood = true;
                    slot.classList.add('food-stunned');
                    slot.style.cursor = 'default'; // Set cursor back to default
                    slot.dataset.isStunnedFood = 'true'; // Set data attribute
                } else {
                    slot.classList.remove('food-stunned'); 
                    delete slot.dataset.isStunnedFood; // Remove data attribute
                }
                // ---------------------------

                // --- Dynamic Tooltip Listener --- 
                slot.removeEventListener('mouseenter', slot._tooltipEnterHandler);
                slot.removeEventListener('mouseleave', slot._tooltipLeaveHandler);
                
                const enterHandler = (e) => {
                    let currentActionText = originalActionText;
                    // Check data attribute *inside* the handler
                    if (slot.dataset.isStunnedFood === 'true') {
                        currentActionText = "[You are stunned!]";
                    }
                    
                    let tooltipHTML = '';
                    if (currentActionText) {
                        tooltipHTML += `<span class="tooltip-action">${currentActionText}</span><br>`;
                    }
                    tooltipHTML += item.description || 'No description';
                    this.showTooltip(tooltipHTML, this.itemTooltip, e);
                };
                const leaveHandler = () => {
                     this.hideTooltip(this.itemTooltip);
                };
                
                slot.addEventListener('mouseenter', enterHandler);
                slot.addEventListener('mouseleave', leaveHandler);
                slot._tooltipEnterHandler = enterHandler;
                slot._tooltipLeaveHandler = leaveHandler;
                // -----------------------------

                // --- Click Handler Attachment --- 
                slot.removeEventListener('click', slot._clickHandler); // Remove previous click listener if any
                if (originalClickHandler && !isStunnedAndFood) { // Attach click handler ONLY if it exists AND not stunned food
                    slot.addEventListener('click', originalClickHandler);
                    slot._clickHandler = originalClickHandler; // Store reference for removal
                    slot.style.cursor = 'pointer'; // Ensure clickable cursor if handler is attached
                } else if (!isStunnedAndFood) {
                    // Ensure default cursor if no handler and not stunned food
                    slot.style.cursor = 'default'; 
                }
                // else: cursor is already set to default by stun check block if isStunnedAndFood
                // ----------------------------

                // --- Equipped Chip etc. --- 
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
                slot.draggable = false; // Empty slots aren't draggable
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

        // *** Update Area Description ***
        if (this.areaDescriptionElement) {
            let areaName = "";
            let areaTooltip = "";
            const round = this.game.currentRound;

            if (round <= 10) {
                areaName = "[Spider Cave]";
                areaTooltip = "You are exploring the spider cave";
            } else if (round <= 20) {
                areaName = "[Ogre Pass]";
                areaTooltip = "You adventure through the ogre pass";
            } else {
                areaName = "[Dragon Nest]";
                areaTooltip = "You brave the dragon nest";
            }

            this.areaDescriptionElement.textContent = areaName;
            this.areaDescriptionElement.dataset.tooltipText = areaTooltip;
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
        // --- Player Stats ---
        if (this.combatPlayerAtk) { 
            this.combatPlayerAtk.textContent = player.getAttack();
        }
        if (this.combatPlayerDef) {
            this.combatPlayerDef.textContent = player.getDefense();
        }
        // *** ADD: Update Player Health Display in Combat UI ***
        if (this.combatPlayerHp) { 
            const playerMaxHp = player.getMaxHealth();
            this.combatPlayerHp.textContent = `${Math.ceil(player.health)}/${playerMaxHp}`;
            const playerHealthBar = document.querySelector('.player-health');
            if (playerHealthBar) {
                playerHealthBar.style.width = `${(player.health / playerMaxHp) * 100}%`;
            }
        }
        
        // --- Enemy Stats ---
        if (this.combatEnemyAtk) {
            this.combatEnemyAtk.textContent = enemy.currentAttack; 
            if (enemy.currentAttack > enemy.attack) {
                this.combatEnemyAtk.classList.add('enraged');
            } else {
                this.combatEnemyAtk.classList.remove('enraged');
            }
        }
        if (this.combatEnemyDef) {
            this.combatEnemyDef.textContent = enemy.currentDefense; 
            if (enemy.scalesHardened) { 
                this.combatEnemyDef.classList.add('hardened');
            } else {
                this.combatEnemyDef.classList.remove('hardened');
            }
        }
        // *** ADD: Update Enemy Health Display in Combat UI ***
        if (this.combatEnemyHp) { 
            const enemyMaxHp = enemy.maxHealth;
            this.combatEnemyHp.textContent = `${Math.ceil(enemy.health)}/${enemyMaxHp}`;
            const enemyHealthBar = document.querySelector('.enemy-health');
            if (enemyHealthBar) {
                 enemyHealthBar.style.width = `${(enemy.health / enemyMaxHp) * 100}%`;
            }
        }

        // --- Status Effects Visuals ---
        // Update player poisoned status visual
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            if (player.activeEffects.poison) {
                playerSide.classList.add('player-poisoned');
            } else {
                playerSide.classList.remove('player-poisoned');
            }
            // *** ADD: Update player burning status visual ***
            if (!player.activeEffects.burning) {
                 playerSide.classList.remove('player-burning');
            }
        }
    }

    showCombatUI(player, enemy) {
        this.clearMainArea();
        this.combatArea.classList.remove('hidden');
        document.getElementById('combat-enemy-name').textContent = enemy.name;

        // --- Set Initial Health Display Directly --- 
        const initialPlayerPercentage = (player.health / player.getMaxHealth()) * 100;
        if (this.combatPlayerHp) this.combatPlayerHp.textContent = `${player.health}/${player.getMaxHealth()}`;
        const playerHealthBar = document.querySelector('.player-health');
        if (playerHealthBar) playerHealthBar.style.width = `${initialPlayerPercentage}%`;

        const initialEnemyPercentage = (enemy.health / enemy.maxHealth) * 100;
        if (this.combatEnemyHp) this.combatEnemyHp.textContent = `${enemy.health}/${enemy.maxHealth}`;
        const enemyHealthBar = document.querySelector('.enemy-health');
        if (enemyHealthBar) enemyHealthBar.style.width = `${initialEnemyPercentage}%`;
        // -------------------------------------------
        
        // Keep calls for initial timer and stats display
        // this.updateCombatantHealth('player', player.health, player.maxHealth); // REMOVE
        // this.updateCombatantHealth('enemy', enemy.health, enemy.maxHealth); // REMOVE
        this.updateCombatTimers(player.attackTimer, enemy.attackTimer);
        this.updateCombatStats(player, enemy); 
    }

    hideCombatUI() {
        this.combatArea.classList.add('hidden');
    }

    updateCombatantHealth(who, current, max, damage = 0, blocked = 0, isHeal = false, fullBlock = false) {
        const percentage = (current / max) * 100;
        let splatType = isHeal ? 'heal' : 'damage';

        if (who === 'player') {
            this.combatPlayerHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.player-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');
            this.createDamageSplat('.player-side', damage, splatType, blocked, fullBlock);
            
        } else if (who === 'enemy') {
            this.combatEnemyHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.enemy-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');
            this.createDamageSplat('.enemy-side', damage, splatType, blocked, fullBlock);
            
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
        // Use type for class and text formatting
        splat.classList.add(type); // Add class based on type (damage, heal, poison, etc.)
        
        if (type === 'damage') {
            if (fullBlock) {
                splat.innerHTML = `<span style="color: #aaaaaa">BLOCKED ${blocked}</span>`;
            } else if (amount === 0) { // NEW: Check for zero damage
                 splat.textContent = "0";
                 splat.classList.add('zero-damage'); // Add specific class for styling
            } else {
                splat.textContent = amount; // Display the numeric damage amount > 0
            }
        } else if (type === 'heal' || type === 'potion-heal') { 
            splat.textContent = '+' + amount;
        } else if (type === 'poison' || type === 'burn') { // New poison type
             splat.textContent = amount; // Show poison damage amount
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

    // --- NEW Boss Encounter Rendering ---
    renderBossEncounter(bossData) {
        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = ''; // Clear previous content

        const bossEncounterDiv = document.createElement('div');
        bossEncounterDiv.className = 'boss-encounter-display';

        // Simplified access to stats
        const hp = bossData.health;
        const attack = bossData.attack;
        const defense = bossData.defense;
        const speed = bossData.speed; // Get speed stat
        // <h2 class="boss-encounter-title">${bossData.name}</h2>

        bossEncounterDiv.innerHTML = `
            <div class="boss-info">
                <h3 class="boss-encounter-name">${bossData.name}</h3>
                <p class="boss-encounter-description">${bossData.description || 'No description available.'}</p>
                <p class="boss-encounter-mechanics">${bossData.mechanics || 'No mechanics available.'}</p>
                <div class="boss-stats">
                    <span class="boss-stat-item">HP: <span class="boss-stat-value">${hp}</span></span>
                    <span class="boss-stat-item">ATK: <span class="boss-stat-value">${attack}</span></span>
                    <span class="boss-stat-item">DEF: <span class="boss-stat-value">${defense}</span></span>
                    <span class="boss-stat-item">SPD: <span class="boss-stat-value">${speed}</span></span>
                </div>
            </div>
            <button id="boss-engage-button" class="boss-engage-button">ENGAGE</button>
        `;

        this.choicesArea.appendChild(bossEncounterDiv);

        // Add listener to the new button
        const engageButton = this.choicesArea.querySelector('#boss-engage-button');
        if (engageButton) {
            engageButton.onclick = () => {
                bossEncounterDiv.classList.add('boss-engage-start');
                setTimeout(() => {
                    this.choicesArea.classList.add('hidden'); // Hide choices area
                    this.game.startEncounter({ type: 'monster', monsterId: bossData.id });
                }, 500); // Match animation duration
            };
        } else {
            console.error("Could not find engage button");
        }
    }
    // ---------------------------------

    // NEW Method to play a temporary animation on the player combat area
    playPlayerAnimation(animationClass, duration) {
        const playerSide = document.querySelector('.player-side');
        if (!playerSide) return;

        // Remove the class if it's already there (e.g., rapid hits)
        playerSide.classList.remove(animationClass);
        
        // Force reflow to restart animation if class is re-added quickly
        void playerSide.offsetWidth;

        // Add the animation class
        playerSide.classList.add(animationClass);

        // Set timeout to remove the class AND potentially add burning class
        setTimeout(() => {
            if (!playerSide) return; // Guard against element disappearing
            
            playerSide.classList.remove(animationClass); // Remove the hit animation class

            // Check if player is burning AFTER hit animation finishes
            if (this.game && this.game.player && this.game.player.activeEffects.burning) {
                 playerSide.classList.add('player-burning'); // Start the pulse
            }
            
        }, duration);
    }
}