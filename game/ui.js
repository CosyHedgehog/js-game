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
        this.equipmentTextDisplay = {
            weapon: document.getElementById('equip-text-weapon'),
            shield: document.getElementById('equip-text-shield'),
            helm: document.getElementById('equip-text-helm'),
            body: document.getElementById('equip-text-body'),
            legs: document.getElementById('equip-text-legs'),
            ring: document.getElementById('equip-text-ring')
        };
        this.equipTooltip = document.getElementById('equip-tooltip');
        this.statHealth = document.getElementById('stat-health');
        this.statMaxHealth = document.getElementById('stat-max-health');
        this.statAttack = document.getElementById('stat-attack');
        this.statDefense = document.getElementById('stat-defense');
        this.statSpeed = document.getElementById('stat-speed');
        this.statGold = document.getElementById('stat-gold');
        this.statRound = document.getElementById('stat-round');
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
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
        
        this.cacheDynamicElements();

        if (this.game) this.game.ui = this;
        if (this.lootTakeButton) this.lootTakeButton.onclick = () => this.game.collectLoot();
        else console.error("UI Error: Loot Take Button not found during constructor.");
        
        this.toggleLogButton = document.getElementById('toggle-log-button');
        if (this.toggleLogButton) this.toggleLogButton.onclick = () => new Log(this.game, this).showLog();

        this.closeLogButton = document.getElementById('close-log-button');    
        if (this.closeLogButton) this.closeLogButton.onclick = () => new Log(this.game, this).hideLog();
    }

    cacheDynamicElements() {
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        this.equipmentTextDisplay = {
            weapon: document.getElementById('equip-text-weapon'),
            shield: document.getElementById('equip-text-shield'),
            helm: document.getElementById('equip-text-helm'),
            body: document.getElementById('equip-text-body'),
            legs: document.getElementById('equip-text-legs'),
            ring: document.getElementById('equip-text-ring')
        };
        this.statHealth = document.getElementById('stat-health');
        this.statMaxHealth = document.getElementById('stat-max-health');
        this.statAttack = document.getElementById('stat-attack');
        this.statDefense = document.getElementById('stat-defense');
        this.statGold = document.getElementById('stat-gold');
        this.statRound = document.getElementById('stat-round');
        if (!this.inventoryArea) {
            this.inventoryArea = document.getElementById('inventory-area');
            if (!this.inventoryArea) {
                console.error("CRITICAL FAILURE: Could not find #inventory-area even in cacheDynamicElements.");
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
                if (this.game.state === 'shop') {
                    slot.classList.add('sell-price');
                    slot.classList.add('shop-sellable');
                } else if (this.game.state === 'blacksmith') {
                    if (item.type === 'weapon' || item.type === 'armor') {
                        slot.classList.add('blacksmith-valid');
                    }
                } else if (this.game.state === 'armourer') {
                    if (item.type === 'armor') {
                        slot.classList.add('armourer-valid');
                    }
                } else if (this.game.state === 'sharpen') {
                    if (item.type === 'weapon') {
                        slot.classList.add('sharpen-valid');
                    }
                }
                slot.classList.add('slot-filled');
                slot.draggable = true;
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

                let tooltipText = item.description || 'No description';
                let actionPrefix = '';
                let isEquipped = false;
                for (const slotName in this.game.player.equipment) {
                    if (this.game.player.equipment[slotName] === index) {
                        isEquipped = true;
                        break;
                    }
                }
                if (item.type === 'weapon' || item.type === 'armor') {
                    actionPrefix = isEquipped ? '[Unequip]' : '[Equip]';
                } else if (item.type === 'consumable' && item.useAction) {
                    actionPrefix = `[${item.useAction}]`;
                }
                tooltipText = actionPrefix ? `<span class="tooltip-action">${actionPrefix}</span><br>${tooltipText}` : tooltipText;

                slot.addEventListener('mouseenter', (e) => this.showTooltip(tooltipText, this.itemTooltip, e));
                slot.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));
                slot.addEventListener('click', (e) => {
                    if (slot.classList.contains('dragging')) return;
                    e.stopPropagation();
                    if (item.type === 'weapon' || item.type === 'armor') {
                        if (isEquipped) {
                            this.game.handleUnequipItem(index);
                        } else {
                            this.game.handleEquipItem(index);
                        }
                    } else if (item.type === 'consumable' && item.useAction) {
                        this.game.handleUseItem(index);
                        this.hideTooltip(this.itemTooltip);
                    } else if (this.game.state === 'shop') {
                        const sellPrice = item.value || 0;
                        this.game.addLog(`Click again to confirm sell ${item.name} for ${sellPrice}G?`);
                        console.log("Selling via left-click disabled for now.");
                    }
                });

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
                    // Check if it's food to add the 'Eat' chip
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
                slot.onmouseenter = null;
                slot.onmouseleave = null;
                slot.onclick = null;
            }
            this.inventoryGrid.appendChild(slot);
        });
    }

    renderEquipment() {
        for (const slotName in this.equipmentTextDisplay) {
            const element = this.equipmentTextDisplay[slotName];
            if (!element) {
                console.warn(`UI renderEquipment: Text display element not found for ${slotName}`);
                continue;
            }

            const equippedItemIndex = this.game.player.equipment[slotName];
            let itemName = '-';
            let itemDescription = '';

            // Find the corresponding unequip button
            const unequipButton = document.querySelector(`#equipment-text-display .unequip-button[data-slot="${slotName}"]`);

            if (equippedItemIndex !== null && this.game.player.inventory[equippedItemIndex]) {
                const item = this.game.player.inventory[equippedItemIndex];
                itemName = item.name;
                itemDescription = item.description || 'No description';

                element.onmouseenter = (e) => this.showTooltip(itemDescription, this.equipTooltip, e);
                element.onmouseleave = () => this.hideTooltip(this.equipTooltip);

                // Show and setup unequip button
                if (unequipButton) {
                    unequipButton.classList.remove('hidden');
                    unequipButton.onclick = (e) => {
                        e.stopPropagation(); // Prevent row hover effect if clicking button
                        this.game.handleUnequipItem(equippedItemIndex); // Unequip using the item's index
                    };
                }
            } else {
                element.onmouseenter = null;
                element.onmouseleave = null;

                // Hide unequip button
                if (unequipButton) {
                    unequipButton.classList.add('hidden');
                    unequipButton.onclick = null; // Remove listener
                }
            }

            // Update the text content of the value span
            element.textContent = itemName;
            element.title = ''; // Keep removing browser tooltip
        }
    }

    updatePlayerStats() {
        const player = this.game.player;
        this.statHealth.textContent = player.health;
        this.statMaxHealth.textContent = player.getMaxHealth();
        
        let attackText = player.getAttack();
        if (player.tempAttack > 0) {
            attackText += ` (+${player.tempAttack})`;
        }
        this.statAttack.textContent = attackText;

        let defenseText = player.getDefense();
        if (player.tempDefense > 0) {
            defenseText += ` (+${player.tempDefense})`;
        }
        this.statDefense.textContent = defenseText;
        
        let speedValue = player.getAttackSpeed();
        let speedText = `${speedValue.toFixed(1)}s`;
        if (player.tempSpeedReduction > 0) {
            speedText += ` (-${player.tempSpeedReduction.toFixed(1)}s)`;
        }
        this.statSpeed.textContent = speedText;

        this.statGold.textContent = player.gold;
        if (this.statRound) {
            this.statRound.textContent = `${this.game.currentRound}/${this.game.maxRounds}`;
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
        confirmButton.onclick = () => this.game.confirmChoice(index);
        if (buttonDisabled) {
            confirmButton.disabled = true;
        }
        buttonsContainer.appendChild(confirmButton);
        confirmationBox.appendChild(buttonsContainer);

        this.choicesArea.appendChild(confirmationBox);
    }

    clearMainArea() {
        this.choicesArea.classList.add('hidden');
        this.combatArea.classList.add('hidden');
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

    cacheDynamicElements() {
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        this.lootGold = document.getElementById('loot-gold');
        this.lootItemsContainer = document.getElementById('loot-items');
        this.lootTakeButton = document.getElementById('loot-take-button');
        if (this.lootTakeButton && !this.lootTakeButton.onclick) {
            this.lootTakeButton.onclick = () => this.game.collectLoot();
        }
    }

    showCombatUI(player, enemy) {
        this.clearMainArea();
        this.combatArea.classList.remove('hidden');
        document.getElementById('combat-enemy-name').textContent = enemy.name;
        this.updateCombatantHealth('player', player.health, player.maxHealth);
        this.updateCombatantHealth('enemy', enemy.health, enemy.maxHealth);
        this.updateCombatTimers(player.attackTimer, enemy.attackTimer);
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

    updateCombatTimers(playerTime, enemyTime, playerDelay = 0) {
        this.combatPlayerTimer.textContent = playerDelay > 0 ? 
            `Delayed: ${playerDelay.toFixed(1)}s` : 
            playerTime.toFixed(1);
        this.combatEnemyTimer.textContent = enemyTime.toFixed(1);
        const playerMaxTime = this.game.player.getAttackSpeed();
        const enemyMaxTime = this.game.currentCombat.enemy.speed;
        const playerTimerBar = document.querySelector('.player-timer');
        const enemyTimerBar = document.querySelector('.enemy-timer');
        if (playerDelay > 0) {
            playerTimerBar.style.width = `${(playerDelay / 2) * 100}%`;
            playerTimerBar.style.backgroundColor = '#ffd700';
        } else {
            playerTimerBar.style.width = `${(playerTime / playerMaxTime) * 100}%`;
            playerTimerBar.style.backgroundColor = '';
        }
        enemyTimerBar.style.width = `${(enemyTime / enemyMaxTime) * 100}%`;
    }

    showTooltip(text, tooltipElement, event) {
        if (!tooltipElement) return;

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
        if (tooltipElement) {
            tooltipElement.classList.add('hidden');
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
        console.log(`[createDamageSplat] Called with selector: "${selector}", amount: ${amount}, type: ${type}`);
        const container = document.querySelector(selector);
        console.log('[createDamageSplat] Found container:', container); // Log the result
        
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
        }

        container.appendChild(splat);
        console.log("[createDamageSplat] Damage splat appended:", splat);
        // Re-enable removal
        setTimeout(() => splat.remove(), 2000);
    }

    confirmChoice(index) {
        const selectedChoice = this.currentChoices[index];
        const choicesArea = document.getElementById('choices-area');
        choicesArea.classList.add('encounter-starting');
        setTimeout(() => {
            choicesArea.classList.remove('encounter-starting');
            this.startEncounter(selectedChoice.encounter);
        }, 500);
    }
}