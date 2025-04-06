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
        this.treasureArea = document.getElementById('treasure-area');
        this.forgeArea = document.getElementById('forge-area');
        this.mainContent = document.getElementById('main-content');               this.equipmentTextDisplay = {}; 
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
               this.combatEnemyStunTimerContainer = document.querySelector('.enemy-side .stun-timer');
        this.combatEnemyStunTimerText = document.getElementById('combat-enemy-stun-timer');
        this.combatEnemyStunTimerBar = document.querySelector('.enemy-stun-timer');
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

               this.combatPlayerAtk = document.getElementById('combat-player-atk');
        this.combatPlayerDef = document.getElementById('combat-player-def');
        this.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        this.combatEnemyDef = document.getElementById('combat-enemy-def');
        
               this.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        this.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
               this.combatPlayerSpd = document.getElementById('combat-player-spd'); 
        this.combatEnemySpd = document.getElementById('combat-enemy-spd');
       
        this.roundAreaElement = document.getElementById('round-area');
               this.areaDescriptionElement = document.getElementById('area-description'); 

               this.statDps = document.getElementById('stat-dps-2');

               this.tooltipCache = {
            attack: new Map(),            defense: new Map(),            dps: new Map()           };
    }

    cacheDynamicElements() {
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        
               this.equipmentTextDisplay = {};        const equipmentDisplay = document.getElementById('equipment-text-display');
        if (equipmentDisplay) {
            const pElements = equipmentDisplay.querySelectorAll('p[data-slot]');
            pElements.forEach(pElement => {
                const slot = pElement.dataset.slot;
                if (slot) {
                    this.equipmentTextDisplay[slot] = pElement;                }
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

               this.statHealthElement = document.getElementById('stat-health-2')?.closest('.stat-item');
        this.statAttackElement = document.getElementById('stat-attack-2')?.closest('.stat-item');
        this.statDefenseElement = document.getElementById('stat-defense-2')?.closest('.stat-item');
        this.statSpeedElement = document.getElementById('stat-speed-2')?.closest('.stat-item');
        this.statDpsElement = document.getElementById('stat-dps-2')?.closest('.stat-item');
        this.statGoldElement = document.getElementById('stat-gold-2')?.closest('#inventory-header');        
               this.roundAreaElement = document.getElementById('round-area')?.querySelector('.stat-item'); 
        
               if (!this.combatPlayerAtk) this.combatPlayerAtk = document.getElementById('combat-player-atk');
        if (!this.combatPlayerDef) this.combatPlayerDef = document.getElementById('combat-player-def');
        if (!this.combatEnemyAtk) this.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        if (!this.combatEnemyDef) this.combatEnemyDef = document.getElementById('combat-enemy-def');
        if (!this.combatPlayerTimerContainer) this.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        if (!this.combatEnemyTimerContainer) this.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
           }

    addCombatUITooltipListeners() {
        if (!this.statTooltip) {
            console.error("Stat tooltip element not found. Cannot add combat UI tooltips.");
            return;
        }

        const combatElements = {
            playerAtk: { el: this.combatPlayerAtk?.closest('span'), text: "Maximum potential damage per attack." }, 
            playerDef: { el: this.combatPlayerDef?.closest('span'), text: "Maximum potential damage blocked per hit." }, 
            enemyAtk: { el: this.combatEnemyAtk?.closest('span'), text: "Enemy's current attack power." }, 
            enemyDef: { el: this.combatEnemyDef?.closest('span'), text: "Enemy's current defense value." }, 
            playerTimer: { el: this.combatPlayerTimerContainer, text: "Attack every X seconds." }, 
            enemyTimer: { el: this.combatEnemyTimerContainer, text: "Attack every X seconds." }, 
            enemyBreathTimer: { el: this.combatEnemyBreathTimerContainer, text: "Firebreath every X seconds." },
            stunTimer: { el: this.combatEnemyStunTimerContainer, text: "Slams ground every X seconds." }
        };

               const playerHealthBarContainer = document.querySelector('.player-side .health-bar-container');
        
        const poisonEnterHandler = (e) => {
            if (this.game?.player?.activeEffects?.poison) {                 this.showTooltip("You are poisoned!", this.statTooltip, e);
            }
        };
        const poisonLeaveHandler = () => {
            this.hideTooltip(this.statTooltip);
        };

               if (playerHealthBarContainer) {
                       playerHealthBarContainer.removeEventListener('mouseenter', playerHealthBarContainer._tooltipEnterHandler);
            playerHealthBarContainer.removeEventListener('mouseleave', playerHealthBarContainer._tooltipLeaveHandler);
                       playerHealthBarContainer.addEventListener('mouseenter', poisonEnterHandler);
            playerHealthBarContainer.addEventListener('mouseleave', poisonLeaveHandler);
                       playerHealthBarContainer._tooltipEnterHandler = poisonEnterHandler;
            playerHealthBarContainer._tooltipLeaveHandler = poisonLeaveHandler;
        } else {
            console.warn("Combat Tooltip Listener: Player health bar container not found.");
        }
       
               for (const key in combatElements) {
            const { el, text } = combatElements[key];
            if (el) {
                el.dataset.tooltipTextBase = text; 

                const enterHandler = (e) => {
                                       let dynamicText = el.dataset.tooltipTextDynamic;
                    let tooltipText = "No description available.";
                    if (dynamicText) {                        tooltipText = dynamicText;
                    } else { 
                                               tooltipText = combatElements[key]?.text || "No description available."; 
                    }
                    
                    if (key === 'playerTimer') {
                        if (this.game.player.isStunned) {
                            tooltipText = 'You are Stunned!';
                        } else if (this.game.player.pendingActionDelay > 0) {
                            tooltipText = 'You are Eating!';
                        } else {
                            tooltipText = tooltipText.replace('X', this.game?.player?.getAttackSpeed().toFixed(1) || '?');
                        }
                    } else if (key === 'enemyTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.currentCombat?.enemy?.currentSpeed.toFixed(1) || '?');
                    } else if (key === 'enemyBreathTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.currentCombat?.enemy?.breathAttackInterval?.toFixed(1) || '?');
                    } else if (key === 'stunTimer') {
                        tooltipText = tooltipText.replace('X', this.game?.currentCombat?.enemy?.timedStunInterval?.toFixed(1) || '?');
                    }

                    this.showTooltip(tooltipText.replace(/\n/g, '<br>'), this.statTooltip, e);
                };
                const leaveHandler = () => {
                    this.hideTooltip(this.statTooltip);
                };

                               el.removeEventListener('mouseenter', el._tooltipEnterHandler);
                el.removeEventListener('mouseleave', el._tooltipLeaveHandler);

                el.addEventListener('mouseenter', enterHandler);
                el.addEventListener('mouseleave', leaveHandler);

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
            dps: this.statDpsElement,
            round: this.roundAreaElement,
            area: this.areaDescriptionElement
        };

        for (const key in statElements) {
            const element = statElements[key];
            
            if (element && this.statTooltip) {
                const enterHandler = (e) => {
                                       const tooltipText = element.dataset.tooltipText || "No description available."; 
                    this.showTooltip(tooltipText.replace(/\\n/g, '<br>'), this.statTooltip, e); 
                };
                const leaveHandler = () => {
                    this.hideTooltip(this.statTooltip);
                };

                                              element.removeEventListener('mouseenter', element._tooltipEnterHandler);
                element.removeEventListener('mouseleave', element._tooltipLeaveHandler);

                element.addEventListener('mouseenter', enterHandler);
                element.addEventListener('mouseleave', leaveHandler);
                
                               element._tooltipEnterHandler = enterHandler;
                element._tooltipLeaveHandler = leaveHandler;

            } else {
                 if (!element) console.warn(`Tooltip Listener: Element for stat '${key}' not found during listener attachment.`);
                 if (!this.statTooltip) console.warn(`Tooltip Listener: Stat tooltip element not found during listener attachment.`);
            }
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
                if (!slot.classList.contains('dragging')) {                    slot.classList.add('drag-over');
                }
            });
            slot.addEventListener('dragenter', (event) => {
                event.preventDefault();            });
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
           
            slot.classList.remove('slot-empty', 'slot-filled', 'dragging', 'equipped', 'food-stunned'); 

            if (item) {
                slot.classList.remove('slot-empty');
                slot.classList.add('slot-filled');
                               const MAX_NAME_LENGTH = 18;                let displayName = item.name;
                if (item.name.length > MAX_NAME_LENGTH) {
                    displayName = item.name.substring(0, MAX_NAME_LENGTH - 1) + '…';                }
                               slot.textContent = displayName;
                slot.draggable = true;
                               slot.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move';
                    this.draggedItemIndex = index;
                    this.draggedItem = item;
                    setTimeout(() => slot.classList.add('dragging'), 0);
                    this.hideTooltip(this.itemTooltip);                    this.hideTooltip(this.equipTooltip);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                                       this.inventoryGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    this.draggedItemIndex = null;
                    this.draggedItem = null;
                });
                               
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
                    
                    let tooltipContent = '';
                    if (originalActionText) {
                        tooltipContent += `<div class="tooltip-action">${originalActionText}</div>`;
                    }
                    tooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                    tooltipContent += item.description || 'No description';

                                       slot.addEventListener('mouseenter', (e) => {                                               let currentTooltipContent = '';
                        if (currentActionText) {
                            currentTooltipContent += `<div class="tooltip-action">${currentActionText}</div>`;
                        }
                        currentTooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                        currentTooltipContent += item.description || 'No description';

                                               this.showTooltip(currentTooltipContent.replace(/\n/g, '<br>'), this.itemTooltip, e);
                    });
                    
                    if (this.game.state === 'blacksmith' && (item.type === 'weapon' || item.type === 'armor')) {
                        slot.classList.add('blacksmith-valid');
                    } else if (this.game.state === 'armourer' && item.type === 'armor') {
                        slot.classList.add('armourer-valid');
                    } else if (this.game.state === 'sharpen' && item.type === 'weapon') {
                        slot.classList.add('sharpen-valid');
                    }
                }

                               let isStunnedAndFood = false;
                if (this.game.state === 'combat' && this.game.player.isStunned && item.useAction === 'Eat') {
                    isStunnedAndFood = true;
                    slot.classList.add('food-stunned');
                    slot.style.cursor = 'default';                    slot.dataset.isStunnedFood = 'true';                } else {
                    slot.classList.remove('food-stunned'); 
                    delete slot.dataset.isStunnedFood;                }
               
                               slot.removeEventListener('mouseenter', slot._tooltipEnterHandler);
                slot.removeEventListener('mouseleave', slot._tooltipLeaveHandler);
                
                const enterHandler = (e) => {
                    let currentActionText = originalActionText;
                                       if (slot.dataset.isStunnedFood === 'true') {
                        currentActionText = "[You are stunned!]";
                    }
                    
                    let tooltipContent = '';
                    if (currentActionText) {
                        tooltipContent += `<div class="tooltip-action">${currentActionText}</div>`;
                    }
                    tooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                    tooltipContent += item.description || 'No description';

                                       this.showTooltip(tooltipContent.replace(/\n/g, '<br>'), this.itemTooltip, e);
                };
                const leaveHandler = () => {
                     this.hideTooltip(this.itemTooltip);
                };
                
                slot.addEventListener('mouseenter', enterHandler);
                slot.addEventListener('mouseleave', leaveHandler);
                slot._tooltipEnterHandler = enterHandler;
                slot._tooltipLeaveHandler = leaveHandler;
               
                               slot.removeEventListener('click', slot._clickHandler);                if (originalClickHandler && !isStunnedAndFood) {                    slot.addEventListener('click', originalClickHandler);
                    slot._clickHandler = originalClickHandler;                    slot.style.cursor = 'pointer';                } else if (!isStunnedAndFood) {
                                       slot.style.cursor = 'default'; 
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
                slot.draggable = false;            }
            this.inventoryGrid.appendChild(slot);
        });
    }

    renderEquipment() {
        for (const slotName in this.equipmentTextDisplay) {
                       const parentPElement = this.equipmentTextDisplay[slotName]; 
            if (!parentPElement) {
                 console.warn(`UI renderEquipment: Parent <p> element reference missing for ${slotName}`);
                 continue;
            }
            
                       const labelSpan = parentPElement.querySelector('.equip-label'); 
            const unequipButton = parentPElement.querySelector(`.unequip-button[data-slot="${slotName}"]`);
            
            if (!labelSpan || !unequipButton) {
                console.warn(`UI renderEquipment: Label or Unequip button not found within parent P for ${slotName}`);
                continue;
            }

            const equippedItemIndex = this.game.player.equipment[slotName];
            let itemDescription = '';
            let isEquipped = false;

                       parentPElement.onmouseenter = null;
            parentPElement.onmouseleave = null;

            if (equippedItemIndex !== null && this.game.player.inventory[equippedItemIndex]) {
                const item = this.game.player.inventory[equippedItemIndex];
                itemDescription = item.description || 'No description';
                isEquipped = true;

                               parentPElement.onmouseenter = (e) => this.showTooltip(itemDescription, this.equipTooltip, e);
                parentPElement.onmouseleave = () => this.hideTooltip(this.equipTooltip);

                unequipButton.classList.remove('hidden');
                unequipButton.onclick = (e) => {
                    e.stopPropagation();
                    this.game.handleUnequipItem(equippedItemIndex);
                    this.hideTooltip(this.equipTooltip);
                };
            } else {
                               unequipButton.classList.add('hidden');
                unequipButton.onclick = null;
                
                               const defaultText = "Slot empty - equip an item!";
                parentPElement.onmouseenter = (e) => this.showTooltip(defaultText, this.equipTooltip, e);
                parentPElement.onmouseleave = () => this.hideTooltip(this.equipTooltip);
            }

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
        const previousRound = this.statRound?.textContent;

        if (this.statHealth) this.statHealth.textContent = player.health;
        if (this.statMaxHealth) this.statMaxHealth.textContent = player.getMaxHealth();
        
               let attackBase = player.baseAttack + (player.equipment.weapon !== null ? (this.game.player.inventory[player.equipment.weapon]?.stats?.attack || 0) : 0) + (player.equipment.ring !== null ? (this.game.player.inventory[player.equipment.ring]?.stats?.attack || 0) : 0);
        let attackText = `${attackBase}`; 

               const maxAttack = player.getAttack();
        let attackTooltip = this.tooltipCache.attack.get(maxAttack);

        if (!attackTooltip) {
                       attackTooltip = "<b>Max damage<\/b><br><br>Chance to hit:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let hits = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (maxAttack + 1));
                    const defenseRoll = Math.floor(Math.random() * (def + 1));
                    if (attackRoll > defenseRoll) {
                        hits++;
                    }
                }
                const hitChance = (hits / numSimulations) * 100;
                attackTooltip += `${def} Def: <b>${hitChance.toFixed(1)}%</b><br>`;
            }

                       this.tooltipCache.attack.set(maxAttack, attackTooltip);
        }

               if (player.tempAttack > 0) {
            attackText += ` <span class="boosted-stat">(+${player.tempAttack})</span>`;
            attackTooltip = attackTooltip + `<br>Boosted by +${player.tempAttack} (temporary, lasts until combat ends).`;
        }

        if (this.statAttack) this.statAttack.innerHTML = attackText;
        if (this.statAttackElement) this.statAttackElement.dataset.tooltipText = attackTooltip;

               let defenseBase = player.baseDefense;
        Object.values(player.equipment).forEach(index => {
             if (index !== null && this.game.player.inventory[index]?.stats?.defense) {
                 defenseBase += this.game.player.inventory[index].stats.defense;
             }
         });
        let defenseText = `${defenseBase}`;
        
               const maxDefense = player.getDefense();
        let defenseTooltip = this.tooltipCache.defense.get(maxDefense);

        if (!defenseTooltip) {
                       defenseTooltip = "<b>Max block<\/b><br><br>Chance to block:<br>";
            const numSimulations = 2400;

            for (let atk = 0; atk <= 10; atk++) {
                let blocks = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (atk + 1));
                    const defenseRoll = Math.floor(Math.random() * (maxDefense + 1));
                    if (defenseRoll >= attackRoll) {
                        blocks++;
                    }
                }
                const blockChance = (blocks / numSimulations) * 100;
                defenseTooltip += `${atk} Atk: <b>${blockChance.toFixed(1)}%</b><br>`;
            }

                       this.tooltipCache.defense.set(maxDefense, defenseTooltip);
        }

        if (player.tempDefense > 0) {
            defenseText += ` <span class="boosted-stat">(+${player.tempDefense})</span>`;
            defenseTooltip = defenseTooltip + `<br>Boosted by +${player.tempDefense} (temporary, lasts until combat ends).`;
        }
        if (this.statDefense) this.statDefense.innerHTML = defenseText;
        if (this.statDefenseElement) this.statDefenseElement.dataset.tooltipText = defenseTooltip;
        
               const baseSpeed = player.equipment.weapon !== null ? (this.game.player.inventory[player.equipment.weapon]?.speed ?? player.defaultAttackSpeed) : player.defaultAttackSpeed;
        let finalSpeed = Math.max(0.5, baseSpeed - player.tempSpeedReduction);
        let speedText = `${finalSpeed.toFixed(1)}s`;
        let speedTooltip = "Time between your attacks (lower is faster).";
        if (player.tempSpeedReduction > 0) {
            speedText += ` <span class="boosted-stat">(-${player.tempSpeedReduction.toFixed(1)}s)</span>`;
             speedTooltip = `Time between your attacks (lower is faster).\nBoosted by -${player.tempSpeedReduction.toFixed(1)}s (temporary, lasts until combat ends).`;
        }
        if (this.statSpeed) this.statSpeed.innerHTML = speedText;        if (this.statSpeedElement) this.statSpeedElement.dataset.tooltipText = speedTooltip;

               const attackSpeed = player.getAttackSpeed();
        const cacheKey = `${maxAttack}_${attackSpeed}`;
        let dpsTooltip = this.tooltipCache.dps.get(cacheKey);

        if (!dpsTooltip) {
                       dpsTooltip = "<b>Damage per second<\/b><br><br>DPS against:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let totalDamage = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (maxAttack + 1));
                    const defenseRoll = Math.floor(Math.random() * (def + 1));
                    const damage = Math.max(0, attackRoll - defenseRoll);
                    totalDamage += damage;
                }
                const avgDamagePerHit = totalDamage / numSimulations;
                const dpsAgainstDef = attackSpeed > 0 ? (avgDamagePerHit / attackSpeed) : 0;
                dpsTooltip += `${def} Def: <b>${dpsAgainstDef.toFixed(2)}</b><br>`;
            }

                       this.tooltipCache.dps.set(cacheKey, dpsTooltip);
        }

        if (this.statDpsElement) this.statDpsElement.dataset.tooltipText = dpsTooltip;

               if (this.statGold) this.statGold.textContent = player.gold;
        if (this.statGoldElement) this.statGoldElement.dataset.tooltipText = "Your current wealth.";        if (this.statHealthElement) this.statHealthElement.dataset.tooltipText = "Current Health / Maximum Health";        if (this.statDps) this.statDps.textContent = (player.getAttack() / player.getAttackSpeed()).toFixed(1);
        
        if (this.statRound && this.game && this.roundAreaElement) { 
           const currentRound = this.game.currentRound;
           const currentRoundText = `${currentRound}`;
           const maxRoundsElement = document.getElementById('stat-max-rounds');
           
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
           
                     let roundTooltipText = `Current Round: ${currentRound} / ${this.game.maxRounds}`;
           if (currentRound === 10 || currentRound === 20) {
               roundTooltipText = `MINI-BOSS APPROACHING! (Round ${currentRound})`;           } else if (currentRound === 30) {
               roundTooltipText = `FINAL BOSS! The Ancient Dragon awaits... (Round ${currentRound})`;           }
           
                     this.roundAreaElement.dataset.tooltipText = roundTooltipText;
        }

               if (this.areaDescriptionElement) {
            let areaName = "Unknown Area";            let areaTooltip = "You are somewhere mysterious...";            const currentAreaId = this.game.currentArea;
            let currentTier = null;

                       const roundForLookup = this.game.currentRound === 0 ? 1 : this.game.currentRound;

                       for (const tier of AREA_CONFIG) {
                if (roundForLookup >= tier.startRound && roundForLookup <= tier.endRound) {
                    currentTier = tier;
                    break;
                }
            }

                       if (currentTier && currentTier.areas && currentTier.areas[currentAreaId]) {
                areaName = currentTier.areas[currentAreaId].name;
                areaTooltip = currentTier.areas[currentAreaId].tooltip;
            } else if (currentAreaId) { 
                console.warn(`Area info not found in AREA_CONFIG for: ${currentAreaId} in current tier (lookup round: ${roundForLookup}).`);
            }

            this.areaDescriptionElement.textContent = areaName;
            this.areaDescriptionElement.dataset.tooltipText = areaTooltip;
        }

               const attack = this.game.player.getAttack();
        const speed = this.game.player.getAttackSpeed();
        const dps = speed > 0 ? (attack / speed) : 0;
               this.statDps.textContent = dps.toFixed(1);
    }

    renderChoices(choices) {
        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = '';

        const choicesContainer = document.createElement('div');
        choicesContainer.classList.add('choices-container');

        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.classList.add('choice-card');
            if (index === 0) {
                card.classList.add('selected');
                setTimeout(() => this.game.selectChoice(0), 0);
            }
            
            const encounter = choice.encounter;
            let difficultyText = '';
            let difficultyClass = '';
            
            const cardContent = document.createElement('div');
            cardContent.classList.add('choice-card-content');

            if (encounter.type === 'monster') {
                card.classList.add('choice-monster');
                const monster = MONSTERS[encounter.monsterId];
                if (monster && monster.difficulty) {
                    difficultyClass = 'difficulty-' + monster.difficulty;                    difficultyText = monster.difficulty.toUpperCase();                } else {
                    difficultyClass = 'difficulty-unknown'; 
                    difficultyText = '???';
                    console.warn(`Monster ${encounter.monsterId} is missing the difficulty property.`);
                }

                               const difficultyBadge = document.createElement('div');
                difficultyBadge.className = `difficulty-badge ${difficultyClass}`;
                difficultyBadge.textContent = difficultyText;
                cardContent.appendChild(difficultyBadge);
            }

                       const eventIcon = document.createElement('span');
            eventIcon.className = 'event-icon';
            if (choice.encounter.type === 'monster') {
                const monster = MONSTERS[choice.encounter.monsterId];
                eventIcon.textContent = monster.icon || '⚔️';            } else {
                switch (choice.encounter.type) {
                    case 'rest': eventIcon.textContent = '🏕️'; break;
                    case 'shop': eventIcon.textContent = '🏪'; break;
                    case 'forge': eventIcon.textContent = '⚒️'; break;
                    case 'fishing': eventIcon.textContent = '🎣'; break;
                    case 'blacksmith': eventIcon.textContent = '🔨'; break;
                    case 'sharpen': eventIcon.textContent = '⚔️'; break;
                    case 'armorsmith': eventIcon.textContent = '🛡️'; break;
                    case 'alchemist': eventIcon.textContent = '⚗️'; break;
                    case 'trap': eventIcon.textContent = '⚡'; break;
                    case 'treasure_chest': eventIcon.textContent = '💎'; break;
                    default: eventIcon.textContent = '❓';
                }
            }
            cardContent.appendChild(eventIcon);

                       const title = document.createElement('h3');
            title.classList.add('choice-title');
            title.textContent = choice.text;
            cardContent.appendChild(title);

            const description = document.createElement('div');
            description.classList.add('choice-description');

                       if (encounter.type === 'monster') {
                const monster = MONSTERS[encounter.monsterId];
                if (monster) {
                    let descriptionHTML = '';
                                       if (monster.description) {
                        descriptionHTML += `<div class="monster-description-summary">${monster.description}</div>`;
                    }

                                       descriptionHTML += `<div class="monster-stats-summary">
                        <div>⚔️ Atk: ${monster.attack}</div>
                        <div>🛡️ Def: ${monster.defense}</div>
                        <div>⚡ Spd: ${monster.speed}s</div>
                        <div>💰 Gold: ${monster.goldDrop[0]}-${monster.goldDrop[1]}</div>
                    </div>`;
                                       if (monster.mechanics) {
                        descriptionHTML += `<div class="monster-mechanics-summary">✨ ${monster.mechanics}</div>`;
                    }
                    description.innerHTML = descriptionHTML;
            } else {
                    description.innerHTML = "Error: Monster data not found.";
                }
            } else {
                               description.innerHTML = this.game.getEncounterDetails(encounter);
            }
            cardContent.appendChild(description);

                       const startButton = document.createElement('button');
            startButton.className = 'choice-start-button';

                       switch (encounter.type) {
                case 'monster': 
                    startButton.textContent = 'Fight';
                                       if (difficultyClass) { 
                        startButton.classList.add(difficultyClass);
                    }
                    break;
                case 'rest': startButton.textContent = 'Rest'; break;
                case 'shop': startButton.textContent = 'Enter Shop'; break;
                case 'forge': startButton.textContent = 'Enter Workshop'; break;
                case 'fishing': startButton.textContent = 'Go Fishing'; break;
                case 'blacksmith': startButton.textContent = 'Visit Blacksmith'; break;
                case 'sharpen': startButton.textContent = 'Use Stone'; break;
                case 'armorsmith': startButton.textContent = 'Use Tools'; break;
                case 'alchemist': startButton.textContent = 'Enter Shop'; break;
                case 'trap': startButton.textContent = 'Investigate'; break;
                case 'treasure_chest': startButton.textContent = 'Open Chest'; break;
                default: startButton.textContent = 'Start';
            }
            startButton.onclick = (e) => {
                e.stopPropagation();
                this.confirmChoice(index);
            };

            cardContent.appendChild(startButton);

            card.appendChild(cardContent);
            
                       card.addEventListener('click', () => {
                this.choicesArea.querySelectorAll('.choice-card').forEach(c => {
                    c.classList.remove('selected');
                });
                card.classList.add('selected');
                this.game.selectChoice(index);
            });

            choicesContainer.appendChild(card);
        });

        this.choicesArea.appendChild(choicesContainer);
    }

    confirmChoice(index) {
        const selectedChoice = this.game.currentChoices[index];
        const choicesArea = document.getElementById('choices-area');
        
               if (this.roundAreaElement) { 
            this.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
        }

               if (this.game.currentRound === 10 || this.game.currentRound === 20 || this.game.currentRound === 30) {
            choicesArea.classList.add('encounter-starting');
        }
        
               const delay = (this.game.currentRound === 10 || this.game.currentRound === 20 || this.game.currentRound === 30) ? 500 : 50;

        setTimeout(() => {
            choicesArea.classList.remove('encounter-starting');            this.game.startEncounter(selectedChoice.encounter); 
        }, delay);
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
        this.treasureArea.classList.add('hidden');
        this.forgeArea.classList.add('hidden');
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
               const areaTransitionScreen = document.getElementById('area-transition-screen');
        if (areaTransitionScreen) {
            areaTransitionScreen.remove();
        }
           }

    updateCombatStats(player, enemy) {
               if (this.combatPlayerAtk) { 
            this.combatPlayerAtk.textContent = `⚔️ ${player.getAttack()}`;
        }
        if (this.combatPlayerDef) {
            this.combatPlayerDef.textContent = `🛡️ ${player.getDefense()}`;
        }
               if (this.combatPlayerSpd) { 
            this.combatPlayerSpd.textContent = `⚡️ ${player.getAttackSpeed().toFixed(1)}s`;
        }
               if (this.combatPlayerHp) { 
            const playerMaxHp = player.getMaxHealth();
            this.combatPlayerHp.textContent = `${Math.ceil(player.health)}/${playerMaxHp}`;
            const playerHealthBar = document.querySelector('.player-health');
            if (playerHealthBar) {
                playerHealthBar.style.width = `${(player.health / playerMaxHp) * 100}%`;
            }
        }
        
               if (this.combatEnemyAtk) {
            this.combatEnemyAtk.textContent = `⚔️ ${enemy.currentAttack}`;
            if (enemy.currentAttack > enemy.attack) {
                this.combatEnemyAtk.classList.add('enraged');
            } else {
                this.combatEnemyAtk.classList.remove('enraged');
            }
        }
        if (this.combatEnemyDef) {
            this.combatEnemyDef.textContent = `🛡️ ${enemy.currentDefense}`;
            if (enemy.scalesHardened) { 
                this.combatEnemyDef.classList.add('hardened');
            } else if (enemy.packTacticsActive) {
                this.combatEnemyDef.classList.add('hardened');
            } else {
                this.combatEnemyDef.classList.remove('hardened');
            }
        }
               if (this.combatEnemySpd) { 
            this.combatEnemySpd.textContent = `⚡️ ${enemy.currentSpeed.toFixed(1)}s`;
                              }
               if (this.combatEnemyHp) { 
            const enemyMaxHp = enemy.maxHealth;
            this.combatEnemyHp.textContent = `${Math.ceil(enemy.health)}/${enemyMaxHp}`;
            const enemyHealthBar = document.querySelector('.enemy-health');
            if (enemyHealthBar) {
                 enemyHealthBar.style.width = `${(enemy.health / enemyMaxHp) * 100}%`;
            }
        }

                      const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            if (player.activeEffects.poison) {
                playerSide.classList.add('player-poisoned');
            } else {
                playerSide.classList.remove('player-poisoned');
            }
                       if (!player.activeEffects.burning) {
                 playerSide.classList.remove('player-burning');
            }
        }

               this.addStatTooltipListeners('.player-side .combat-stats', this.statTooltip);

               const regenTimerContainer = this.combatArea.querySelector('.regen-timer');
        if (regenTimerContainer) {
            regenTimerContainer.addEventListener('mouseenter', (e) => {
                this.showTooltip("The giant is regenerating.", this.statTooltip, e);
            });
            regenTimerContainer.addEventListener('mouseleave', () => {
                this.hideTooltip(this.statTooltip);
            });
        }

               this.updateCombatTimers(
            player.attackTimer, 
            enemy.attackTimer, 
            player.pendingActionDelay, 
            enemy.breathAttackTimer, 
            enemy.breathAttackInterval, 
            enemy.timedStunTimer, 
            enemy.timedStunInterval, 
            enemy.regenerationTimer, 
            enemy.regenerationInterval);
    }

    showCombatUI(player, enemy) {
        this.clearMainArea();
        this.combatArea.classList.remove('hidden');
        document.getElementById('combat-enemy-name').textContent = enemy.name;

               const initialPlayerPercentage = (player.health / player.getMaxHealth()) * 100;
        if (this.combatPlayerHp) this.combatPlayerHp.textContent = `${player.health}/${player.getMaxHealth()}`;
        const playerHealthBar = document.querySelector('.player-health');
        if (playerHealthBar) playerHealthBar.style.width = `${initialPlayerPercentage}%`;

        const initialEnemyPercentage = (enemy.health / enemy.maxHealth) * 100;
        if (this.combatEnemyHp) this.combatEnemyHp.textContent = `${enemy.health}/${enemy.maxHealth}`;
        const enemyHealthBar = document.querySelector('.enemy-health');
        if (enemyHealthBar) enemyHealthBar.style.width = `${initialEnemyPercentage}%`;
               
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

    updateCombatTimers(playerTimer, enemyTimer, playerDelay = 0, 
                         enemyBreathTimer, enemyBreathInterval, 
                         enemyStunTimer, enemyStunInterval,
                         enemyRegenTimer, enemyRegenInterval) {        const playerTimerEl = document.getElementById('combat-player-timer');
        const playerTimerBar = document.querySelector('.player-timer');
        const enemyTimerEl = document.getElementById('combat-enemy-timer');
        const enemyTimerBar = document.querySelector('.enemy-timer');
        const enemyBreathTimerEl = document.getElementById('combat-enemy-breath-timer');
        const enemyBreathTimerContainer = document.querySelector('.breath-timer');
        const enemyBreathTimerBar = document.querySelector('.enemy-breath-timer');
        const enemyStunTimerEl = document.getElementById('combat-enemy-stun-timer');
        const enemyStunTimerContainer = document.querySelector('.stun-timer');
        const enemyStunTimerBar = document.querySelector('.enemy-stun-timer');
               const enemyRegenTimerEl = document.getElementById('combat-enemy-regen-timer');
        const enemyRegenTimerContainer = document.querySelector('.regen-timer');
        const enemyRegenTimerBar = document.querySelector('.enemy-regen-timer');

        if (playerTimerEl) playerTimerEl.textContent = playerTimer.toFixed(1);
        if (playerTimerBar) {
            const playerTotalTime = this.game.player.getAttackSpeed();
            const playerProgress = 1 - (playerTimer / playerTotalTime);
            playerTimerBar.style.width = `${Math.min(100, playerProgress * 100)}%`;
                       const playerContainer = playerTimerBar.closest('.attack-timer');
            if (playerContainer) {
                if (playerDelay > 0) {
                    playerContainer.classList.add('player-delayed');
                    playerTimerEl.textContent = `Delayed ${playerDelay.toFixed(1)}s`;

                    if (this.game.player.isStunned) {
                        playerTimerBar.style.width = `${(playerDelay / this.game.player.activeEffects.stun.duration) * 100}%`;
                    } else {
                        playerTimerBar.style.width = `${(playerDelay /2) * 100}%`;
                    }

                    playerTimerBar.style.backgroundColor = '#ffd700';
                } else {
                    playerContainer.classList.remove('player-delayed');
                    playerTimerBar.style.width = `${1 - (playerTimer - this.game.player.getAttackSpeed)}%`;
                    playerTimerBar.style.backgroundColor = '';
                }
            }
        }

        if (enemyTimerEl) enemyTimerEl.textContent = enemyTimer.toFixed(1);
        if (enemyTimerBar) {
            const enemyTotalTime = this.game.currentCombat.enemy.speed;            const enemyProgress = 1 - (enemyTimer / enemyTotalTime);
            enemyTimerBar.style.width = `${Math.min(100, enemyProgress * 100)}%`;
        }

               if (enemyBreathTimerContainer) {
            if (enemyBreathInterval !== null && enemyBreathInterval > 0) {
                enemyBreathTimerContainer.classList.remove('hidden');
                if (enemyBreathTimerEl) enemyBreathTimerEl.textContent = enemyBreathTimer.toFixed(1);
                if (enemyBreathTimerBar) {
                    const breathProgress = 1 - (enemyBreathTimer / enemyBreathInterval);
                    enemyBreathTimerBar.style.width = `${Math.min(100, breathProgress * 100)}%`;
                }
            } else {
                enemyBreathTimerContainer.classList.add('hidden');
            }
        }
        
               if (enemyStunTimerContainer) {
            if (enemyStunInterval !== null && enemyStunInterval > 0) {
                enemyStunTimerContainer.classList.remove('hidden');
                if (enemyStunTimerEl) enemyStunTimerEl.textContent = enemyStunTimer.toFixed(1);
                if (enemyStunTimerBar) {
                    const stunProgress = 1 - (enemyStunTimer / enemyStunInterval);
                    enemyStunTimerBar.style.width = `${Math.min(100, stunProgress * 100)}%`;
            }
        } else {
                enemyStunTimerContainer.classList.add('hidden');
            }
        }
        
               if (enemyRegenTimerContainer) {
            if (enemyRegenInterval !== null && enemyRegenInterval > 0) {
                enemyRegenTimerContainer.classList.remove('hidden');
                if (enemyRegenTimerEl) enemyRegenTimerEl.textContent = enemyRegenTimer.toFixed(1);
                if (enemyRegenTimerBar) {
                    const regenProgress = 1 - (enemyRegenTimer / enemyRegenInterval);
                    enemyRegenTimerBar.style.width = `${Math.min(100, regenProgress * 100)}%`;
                }
            } else {
                enemyRegenTimerContainer.classList.add('hidden');
             }
        }
    }

    showTooltip(text, tooltipElement, event) {
        if (!tooltipElement) {
                       return;        }
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
        if (tooltipElement) {            tooltipElement.classList.add('hidden');
        }
    }

    updateShopAffordability() {
        if (!this.game || this.game.state !== 'shop') return;        
        const shopArea = document.getElementById('shop-area');
        if (!shopArea || shopArea.classList.contains('hidden')) return;

               const shopItems = shopArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const index = parseInt(shopItemDiv.dataset.index);
            if (isNaN(index) || !this.game.currentShopItems || !this.game.currentShopItems[index]) return;            
            const item = this.game.currentShopItems[index];
            const buyButton = shopItemDiv.querySelector('.shop-item-button');
            
            if (item && buyButton) {
                const canAfford = this.game.player.gold >= item.buyPrice;
                buyButton.disabled = !canAfford;
            }
        });
        
               const rerollButton = document.getElementById('shop-reroll-button');
        if (rerollButton) {            const canAffordReroll = this.game.player.gold >= 3;            rerollButton.disabled = !this.game.shopCanReroll || !canAffordReroll;
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
        splat.style.position = 'absolute'; 
        
        splat.style.left = '50%';

        if (!selector.startsWith('.inventory-slot')) {
        const x = Math.random() * 60 - 20;
            splat.style.setProperty('--splat-offset-x', `${x}px`);
        }
        
               if (selector.startsWith('.inventory-slot')) { 
            splat.style.top = '25%';            splat.classList.add('inventory-splat');        } else if (selector.includes('.trap-area-option')) { 
            splat.style.top = '30%';        } else if (selector === '#rest-area .rest-campfire-container') {
            splat.style.top = '30%'; 
        } else if (selector === '.escape-message-container') {            splat.style.top = '1%';        } else if (selector === '#trap-area') {
            const y = Math.random() * 60 - 20;
            splat.style.top = `calc(30% + ${y}px)`;
        }
               splat.classList.add(type);        
        if (type === 'damage') {
            if (fullBlock) {
                splat.innerHTML = `<span style="color: #aaaaaa">BLOCKED ${blocked}</span>`;
            } else if (amount === 0) {                 splat.textContent = "0";
                 splat.classList.add('zero-damage');            } else {
                splat.textContent = amount;            }
        } else if (type === 'heal' || type === 'potion-heal') { 
            splat.textContent = '+' + amount;
        } else if (type === 'poison' || type === 'burn') {             splat.textContent = amount;        } else if (type === 'buff-attack') {
            splat.textContent = `+${amount} Atk`;
        } else if (type === 'buff-defense') {
            splat.textContent = `+${amount} Def`;
        } else if (type === 'buff-speed') {
                       splat.textContent = `-${amount.toFixed(1)}s Spd`; 
        } else {
            splat.textContent = '+' + amount;
        }

        container.appendChild(splat);
        setTimeout(() => splat.remove(), 2000);
    }

       renderBossEncounter(bossData) {
        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = '';

        const choicesContainer = document.createElement('div');
        choicesContainer.classList.add('choices-container');
        choicesContainer.classList.add('boss-only');
        const card = document.createElement('div');
        
               const isFinalBoss = bossData.isBoss === true;
        const isMiniBoss = bossData.isMiniBoss === true;
        card.classList.add('choice-card');
        if (isFinalBoss) {
            card.classList.add('boss-card');
        } else if (isMiniBoss) {
            card.classList.add('miniboss-card');
        }
        card.classList.add('selected');       
        const cardContent = document.createElement('div');
        cardContent.classList.add('choice-card-content');

               const difficultyBadge = document.createElement('div');
        difficultyBadge.className = 'difficulty-badge';
               if (isFinalBoss) {
            difficultyBadge.style.backgroundColor = '#f44336';        difficultyBadge.textContent = 'BOSS';
        } else if (isMiniBoss) {
            difficultyBadge.style.backgroundColor = '#FF9800';            difficultyBadge.textContent = 'MINI-BOSS';
        } else {
                       difficultyBadge.style.display = 'none'; 
        }
               cardContent.appendChild(difficultyBadge);

               const eventIcon = document.createElement('span');
        eventIcon.className = 'event-icon';
        eventIcon.textContent = bossData.icon;
        cardContent.appendChild(eventIcon);

               const title = document.createElement('h3');
        title.classList.add('choice-title');
        title.textContent = bossData.name;
        cardContent.appendChild(title);

               const description = document.createElement('div');
        description.classList.add('choice-description');
        description.innerHTML = `
            <div class="monster-description">
                <div class="monster-desc-text-wrapper">
                <p>${bossData.description || 'No description available.'}</p>
                </div>
                <div class="monster-stats-grid">
                    <div class="monster-stat">
                        <span class="stat-icon">❤️ Health</span>
                        <span class="stat-value">${bossData.health}</span>
                        <span class="stat-label">Health</span>
                </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚔️ Attack</span>
                        <span class="stat-value">${bossData.attack}</span>
                        <span class="stat-label">Attack</span>
            </div>
                    <div class="monster-stat">
                        <span class="stat-icon">🛡️ Defense</span>
                        <span class="stat-value">${bossData.defense}</span>
                        <span class="stat-label">Defense</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚡ Speed</span>
                        <span class="stat-value">${bossData.speed}s</span>
                        <span class="stat-label">Speed</span>
                    </div>
                </div>
                ${bossData.mechanics ? `<div class="monster-special">${bossData.mechanics}</div>` : ''}
            </div>
        `;
        cardContent.appendChild(description);

               const startButton = document.createElement('button');
        startButton.className = 'choice-start-button';
               if (isFinalBoss) {
            startButton.textContent = 'Fight';
        } else if (isMiniBoss) {
            startButton.textContent = 'Fight';
        } else {
            startButton.textContent = 'Fight';        }
               startButton.onclick = () => {
            card.classList.add('boss-engage-start');
                setTimeout(() => {
                this.choicesArea.classList.add('hidden');
                    this.game.startEncounter({ type: 'monster', monsterId: bossData.id });
            }, 500);
        };
        cardContent.appendChild(startButton);

        card.appendChild(cardContent);
        choicesContainer.appendChild(card);
        this.choicesArea.appendChild(choicesContainer);
    }
   
       playPlayerAnimation(animationClass, duration) {
        const playerSide = document.querySelector('.player-side');
        if (!playerSide) return;

               playerSide.classList.remove(animationClass);
        
               void playerSide.offsetWidth;

               playerSide.classList.add(animationClass);

               setTimeout(() => {
            if (!playerSide) return;            
            playerSide.classList.remove(animationClass);
                       if (this.game && this.game.player && this.game.player.activeEffects.burning) {
                 playerSide.classList.add('player-burning');            }
            
        }, duration);
    }

    renderLoot(lootItems, goldAmount) {
        this.clearMainArea();        this.lootArea.innerHTML = '';        this.lootArea.classList.remove('hidden');
        
        let lootHTML = `<h3>Loot Dropped</h3>`;
        const lootDisplayArea = document.createElement('div');
        lootDisplayArea.className = 'loot-display-area';

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'loot-items-container';

        const descriptionBox = document.createElement('div');
        descriptionBox.id = 'loot-item-description';
        descriptionBox.textContent = 'Hover over an item to see details.';

        if (goldAmount > 0) {
            const goldContainer = document.createElement('div');
            goldContainer.className = 'loot-gold-container';
            goldContainer.innerHTML = `<span><i class="fas fa-coins"></i> Gold: ${goldAmount}</span>`;
            const takeGoldButton = document.createElement('button');
            takeGoldButton.textContent = 'Take Gold';
            takeGoldButton.className = 'loot-gold-button';
            takeGoldButton.onclick = () => {
                this.game.player.addGold(goldAmount);
                this.game.addLog(`Took ${goldAmount} gold.`);
                goldContainer.remove();                this.updatePlayerStats();
            };
            goldContainer.appendChild(takeGoldButton);
            itemsContainer.appendChild(goldContainer);        }

        if (lootItems.length === 0 && goldAmount <= 0) {
            itemsContainer.innerHTML += '<p class="loot-empty-message">No loot dropped.</p>';
        } else {
            lootItems.forEach((item, index) => {
                if (!item) return;                const itemElement = document.createElement('div');
                itemElement.className = 'loot-item';
                itemElement.dataset.lootIndex = index;
                itemElement.innerHTML = `
                    <span>${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                    <button class="loot-item-button">Take</button>
                `;

                               itemElement.addEventListener('mouseenter', () => {
                    descriptionBox.textContent = item.description || 'No description available.';
                    itemElement.classList.add('selected');
                });
                itemElement.addEventListener('mouseleave', () => {
                                                          itemElement.classList.remove('selected');
                });

                               const takeButton = itemElement.querySelector('.loot-item-button');
                takeButton.onclick = (event) => {
                    event.stopPropagation();                    const added = this.game.player.addItem(item);
                    if (added) {
                        this.game.addLog(`Took ${item.name}.`);
                        itemElement.remove();                        this.renderInventory();                                               if (descriptionBox.textContent === (item.description || 'No description available.')) {
                             descriptionBox.textContent = 'Hover over an item to see details.';
                        }
                    } else {
                        this.game.addLog('Inventory is full!');
                                           }
                };
                itemsContainer.appendChild(itemElement);
            });
        }
        
        lootDisplayArea.appendChild(itemsContainer);
        lootDisplayArea.appendChild(descriptionBox);
        lootHTML += lootDisplayArea.outerHTML;        
               lootHTML += `
            <div class="loot-buttons">
                <button id="loot-take-all-button">Take All</button>
                <button id="loot-continue-button">Continue</button>
            </div>
        `;

        this.lootArea.innerHTML = lootHTML;

               document.getElementById('loot-take-all-button')?.addEventListener('click', () => this.handleTakeAllLoot());
        document.getElementById('loot-continue-button')?.addEventListener('click', () => this.game.proceedToNextRound());
    }

    handleTakeAllLoot() {
           }

       renderBossEncounter(bossData, bossId) {        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = '';

        const choicesContainer = document.createElement('div');
        choicesContainer.classList.add('choices-container');
        choicesContainer.classList.add('boss-only');
    const card = document.createElement('div');
        
               const isFinalBoss = bossData.isBoss === true;
        const isMiniBoss = bossData.isMiniBoss === true;
        card.classList.add('choice-card');
        if (isFinalBoss) {
            card.classList.add('boss-card');
        } else if (isMiniBoss) {
            card.classList.add('miniboss-card');
        }
        card.classList.add('selected');       
        const cardContent = document.createElement('div');
        cardContent.classList.add('choice-card-content');

               const difficultyBadge = document.createElement('div');
        difficultyBadge.className = 'difficulty-badge';
               if (isFinalBoss) {
            difficultyBadge.style.backgroundColor = '#f44336';            difficultyBadge.textContent = 'BOSS';
        } else if (isMiniBoss) {
            difficultyBadge.style.backgroundColor = '#FF9800';            difficultyBadge.textContent = 'MINI-BOSS';
        } else {
                       difficultyBadge.style.display = 'none'; 
        }
               cardContent.appendChild(difficultyBadge);

               const eventIcon = document.createElement('span');
        eventIcon.className = 'event-icon';
        eventIcon.textContent = bossData.icon;
        cardContent.appendChild(eventIcon);

               const title = document.createElement('h3');
        title.classList.add('choice-title');
        title.textContent = bossData.name;
        cardContent.appendChild(title);

               const description = document.createElement('div');
        description.classList.add('choice-description');
        description.innerHTML = `
            <div class="monster-description">
                <div class="monster-desc-text-wrapper">
                    <p>${bossData.description || 'No description available.'}</p>
                </div>
                <div class="monster-stats-grid">
                    <div class="monster-stat">
                        <span class="stat-icon">❤️ Health</span>
                        <span class="stat-value">${bossData.health}</span>
                        <span class="stat-label">Health</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚔️ Attack</span>
                        <span class="stat-value">${bossData.attack}</span>
                        <span class="stat-label">Attack</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">🛡️ Defense</span>
                        <span class="stat-value">${bossData.defense}</span>
                        <span class="stat-label">Defense</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚡ Speed</span>
                        <span class="stat-value">${bossData.speed}s</span>
                        <span class="stat-label">Speed</span>
                    </div>
                </div>
                ${bossData.mechanics ? `<div class="monster-special">${bossData.mechanics}</div>` : ''}
            </div>
        `;
        cardContent.appendChild(description);

               const startButton = document.createElement('button');
        startButton.className = 'choice-start-button';
               if (isFinalBoss) {
            startButton.textContent = 'Fight Final Boss';
        } else if (isMiniBoss) {
            startButton.textContent = 'Fight Mini-Boss';
        } else {
            startButton.textContent = 'Fight';        }
               startButton.onclick = () => {
            card.classList.add('boss-engage-start');
            setTimeout(() => {
                this.choicesArea.classList.add('hidden');
                               this.game.startEncounter({ type: 'monster', monsterId: bossId }); 
            }, 500);
        };
        cardContent.appendChild(startButton);

        card.appendChild(cardContent);
        choicesContainer.appendChild(card);
        this.choicesArea.appendChild(choicesContainer);
    }

    showAreaTransitionScreen(areaName) {
        this.clearMainArea();
        const transitionDiv = document.createElement('div');
        transitionDiv.id = 'area-transition-screen';
        transitionDiv.className = 'area-transition-container';
        const title = document.createElement('h2');
        title.textContent = `Entering ${areaName}...`;

                     
        const continueButton = document.createElement('button');
        continueButton.id = 'area-transition-continue-button';
        continueButton.textContent = 'Venture Forth';
        continueButton.onclick = () => {
                       transitionDiv.classList.add('fade-out');
            
                       continueButton.disabled = true;

                       setTimeout(() => {
                               this.game.continueAfterAreaTransition();
            }, 500);        };

        transitionDiv.appendChild(title);
               transitionDiv.appendChild(continueButton);

        this.mainContent.appendChild(transitionDiv);
    }

       updateRoundDisplay(currentRound, maxRounds) {
        if (this.statRound) {
            this.statRound.textContent = currentRound;
        }
               const maxRoundEl = document.getElementById('stat-max-rounds');
        if (maxRoundEl && maxRoundEl.textContent !== maxRounds.toString()) {
            maxRoundEl.textContent = maxRounds;
        }

               if (this.roundAreaElement) {
            this.roundAreaElement.classList.remove('round-pulsing');            void this.roundAreaElement.offsetWidth;            this.roundAreaElement.classList.add('round-pulsing');
        }
    }

} // End UI Class