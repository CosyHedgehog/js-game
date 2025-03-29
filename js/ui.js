class UI {
    constructor(game) {
        this.game = game; // Reference to the game logic
        this.roundIndicatorArea = document.getElementById('round-indicator-area');
        
        // Cache Loot Area elements
        this.lootArea = document.getElementById('loot-area');
        this.lootGold = document.getElementById('loot-gold');
        this.lootItemsContainer = document.getElementById('loot-items');
        this.lootTakeButton = document.getElementById('loot-take-button'); // Cache the button

        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.endMessage = document.getElementById('end-message');

        // Main Game Area Sections
        this.choicesArea = document.getElementById('choices-area');
        this.combatArea = document.getElementById('combat-area');
        this.shopArea = document.getElementById('shop-area');
        this.restArea = document.getElementById('rest-area');

        // Sidebar Sections --- THIS IS CRITICAL ---
        this.inventoryArea = document.getElementById('inventory-area'); // <<<< ENSURE THIS LINE EXISTS AND IS SPELLED CORRECTLY
        this.equipmentArea = document.getElementById('equipment-area');
        this.playerStatsArea = document.getElementById('player-stats-area');
        // --- End Sidebar Sections ---

        // Inventory Specific
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.itemTooltip = document.getElementById('item-tooltip');
        this.itemContextMenu = document.getElementById('item-context-menu');

        // Equipment Specific
        this.equipSlots = {
            helm: document.getElementById('equip-helm'),
            body: document.getElementById('equip-body'),
            legs: document.getElementById('equip-legs'),
            weapon: document.getElementById('equip-weapon'),
            shield: document.getElementById('equip-shield'),
        };
        this.equipTooltip = document.getElementById('equip-tooltip');

        // Player Stats Specific
        this.statHealth = document.getElementById('stat-health');
        this.statMaxHealth = document.getElementById('stat-max-health');
        this.statAttack = document.getElementById('stat-attack');
        this.statDefense = document.getElementById('stat-defense');
        this.statGold = document.getElementById('stat-gold');

        this.statRound = document.getElementById('stat-round');

        // Combat Specific UI (Initial caching, might need re-caching if innerHTML changes)
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');

        // Shop specific UI (Initial caching)
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');

        // Output Log
        this.outputLogArea = document.getElementById('output-log-area');
        this.outputLog = document.getElementById('output-log');

        // Add global listener to hide context menu on outside click
        // Note: Ensure this listener doesn't run before the elements exist
        document.addEventListener('click', (event) => {
            // Close context menu if clicking outside it AND outside an inventory slot
            // Check if itemContextMenu exists and is not hidden before checking contains
            if (this.itemContextMenu && !this.itemContextMenu.classList.contains('hidden') &&
                !this.itemContextMenu.contains(event.target) &&
                !event.target.closest('.inventory-slot')) {
                this.hideContextMenu();
            }
            // Hide tooltips if needed
            if (this.itemTooltip && !this.itemTooltip.contains(event.target) && !event.target.closest('.inventory-slot, .shop-item span, .equip-slot')) {
                this.hideTooltip(this.itemTooltip);
            }
            if (this.equipTooltip && !this.equipTooltip.contains(event.target) && !event.target.closest('.equip-slot, .inventory-slot')) { // Also hide equip tooltip if hovering over inventory
                this.hideTooltip(this.equipTooltip);
            }
        }, true); // Use capture phase

        // Initial re-caching of dynamic elements just in case structure exists on load
        this.cacheDynamicElements();

        // Assign game reference back to UI if provided (helpful for callbacks)
        if (this.game) {
            this.game.ui = this;
        }

        // Make sure lootTakeButton listener is added (or re-added if needed)
        if (this.lootTakeButton) {
            this.lootTakeButton.onclick = () => this.game.collectLoot();
        } else {
            console.error("UI Error: Loot Take Button not found during constructor.");
        }

        // Add new button references
        this.toggleLogButton = document.getElementById('toggle-log-button');
        this.closeLogButton = document.getElementById('close-log-button');

        // Add click handlers for the log toggle buttons
        if (this.toggleLogButton) {
            this.toggleLogButton.onclick = () => this.showLog();
        }
        if (this.closeLogButton) {
            this.closeLogButton.onclick = () => this.hideLog();
        }
    }

    // --- Make sure cacheDynamicElements exists ---
    cacheDynamicElements() {
        // Elements inside areas that get cleared need re-caching
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        // Re-cache equip slots if they are ever dynamically regenerated (though currently they aren't)
        this.equipSlots = {
            helm: document.getElementById('equip-helm'),
            body: document.getElementById('equip-body'),
            legs: document.getElementById('equip-legs'),
            weapon: document.getElementById('equip-weapon'),
            shield: document.getElementById('equip-shield'),
        };
        // Re-cache stats spans (less likely to be needed but safe)
        this.statHealth = document.getElementById('stat-health');
        this.statMaxHealth = document.getElementById('stat-max-health');
        this.statAttack = document.getElementById('stat-attack');
        this.statDefense = document.getElementById('stat-defense');
        this.statGold = document.getElementById('stat-gold');

        this.statRound = document.getElementById('stat-round');

        // CRITICAL: Ensure inventory area itself is cached if it wasn't in constructor
        if (!this.inventoryArea) {
            this.inventoryArea = document.getElementById('inventory-area');
            if (!this.inventoryArea) {
                console.error("CRITICAL FAILURE: Could not find #inventory-area even in cacheDynamicElements.");
            }
        }
    }

    switchScreen(screenId) {
        // Hide all screens first
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.remove('hidden'); // Show the target screen

            // Ensure correct display property is set (flex for start/end, grid for game)
            if (screenId === 'game-screen') {
                // #game-screen:not(.hidden) rule in CSS handles display:grid
            } else {
                // .screen:not(.hidden) rule in CSS handles display:flex
            }
        }
    }

    // --- Rendering Functions ---

    renderAll() {
        this.renderInventory();
        this.renderEquipment();
        this.updatePlayerStats();
        this.renderLog();
        this.renderRoundIndicator();
        // Don't render choices here, that's done when needed by game logic
    }

    renderInventory() {
        if (!this.inventoryGrid) {
            console.error("UI Error: inventoryGrid not found during renderInventory.");
            return;
        }

        this.inventoryGrid.innerHTML = ''; // Clear existing slots

        this.game.player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            slot.dataset.index = index; // Store index on the element

            // --- Drag and Drop Event Listeners ---

            // 1. dragover: Allow dropping onto this slot
            slot.addEventListener('dragover', (event) => {
                event.preventDefault(); // Necessary to allow dropping
                // Optional: Could add a class here too, but dragenter is often better
            });

            // 2. dragenter: Highlight when draggable enters
            slot.addEventListener('dragenter', (event) => {
                event.preventDefault();
                if (!slot.classList.contains('dragging')) { // Don't highlight the source slot itself
                    slot.classList.add('drag-over');
                }
            });

            // 3. dragleave: Remove highlight when draggable leaves
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            // 4. drop: Handle the actual drop
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over'); // Clean up highlight
                const sourceIndex = event.dataTransfer.getData('text/plain');
                const targetIndex = slot.dataset.index; // Index of the slot being dropped onto

                // Prevent dropping onto non-inventory targets (though less likely here)
                if (sourceIndex === null || sourceIndex === undefined || targetIndex === null || targetIndex === undefined) return;

                // Call the game logic handler
                this.game.handleInventorySwap(sourceIndex, targetIndex);
            });

            // --- End Drag and Drop Event Listeners ---


            // --- Styling and Item-Specific Logic ---
            slot.classList.remove('slot-empty', 'slot-filled', 'dragging'); // Reset classes

            if (item) {
                // --- Item exists (Filled Slot) ---
                slot.textContent = item.name;
                slot.classList.add('slot-filled');

                // Make filled slots draggable
                slot.draggable = true;

                // 5. dragstart: What happens when dragging starts from this slot
                slot.addEventListener('dragstart', (event) => {
                    // Store the index of the item being dragged
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move'; // Indicate it's a move operation
                    // Add visual feedback to the dragged item (slight delay helps visibility)
                    setTimeout(() => slot.classList.add('dragging'), 0);
                    // Immediately hide context menu/tooltips if drag starts
                    this.hideContextMenu();
                    this.hideTooltip(this.itemTooltip);
                    this.hideTooltip(this.equipTooltip);
                });

                // 6. dragend: Cleanup after drag finishes (dropped or cancelled)
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging'); // Remove dragging style from source
                    // Clean up any lingering drag-over styles from ALL slots
                    this.inventoryGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                });

                // Tooltip/Context Menu listeners (only for filled slots)
                slot.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.itemTooltip, e));
                slot.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));
                slot.addEventListener('click', (e) => {
                    // Prevent context menu if a drag operation might be starting (simple check)
                    if (slot.classList.contains('dragging')) return;
                    e.stopPropagation();
                    this.showContextMenu(item, index, e);
                });

            } else {
                // --- Slot is empty ---
                slot.textContent = '';
                slot.classList.add('slot-empty');
                slot.draggable = false; // Empty slots are not draggable

                // Listeners just to hide tooltips/menus if interaction happens
                slot.addEventListener('mouseenter', () => {
                    this.hideTooltip(this.itemTooltip);
                    this.hideTooltip(this.equipTooltip);
                });
                slot.addEventListener('click', () => this.hideContextMenu());
            }
            this.inventoryGrid.appendChild(slot);
        });
    }

    renderEquipment() {
        for (const slotName in this.equipSlots) {
            const item = this.game.player.equipment[slotName];
            const slotElement = this.equipSlots[slotName];

            if (!slotElement) continue; // Skip if element not found

            // --- Cloning to remove old listeners (Keep this technique) ---
            const newElement = slotElement.cloneNode(true); // Clone node
            slotElement.parentNode.replaceChild(newElement, slotElement); // Replace in DOM
            this.equipSlots[slotName] = newElement; // Update cache reference
            // --- End Cloning ---

            // Clean up previous state classes
            newElement.classList.remove('slot-empty', 'slot-filled');

            if (item) {
                // --- Item is equipped ---
                newElement.textContent = item.name; // Show item name
                newElement.classList.add('slot-filled');
                // Add tooltip listeners
                newElement.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.equipTooltip, e));
                newElement.addEventListener('mouseleave', () => this.hideTooltip(this.equipTooltip));
                // Add click listener to unequip
                newElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.game.handleUnequipItem(slotName);
                });

            } else {
                // --- Slot is empty ---
                newElement.textContent = slotName.toUpperCase(); // Show default slot name (HELM, etc.)
                newElement.classList.add('slot-empty');
                // Add listeners to hide tooltips if hovering over empty equip slot
                newElement.addEventListener('mouseenter', () => {
                    this.hideTooltip(this.itemTooltip);
                    this.hideTooltip(this.equipTooltip);
                });
                // No action needed on click for empty equip slot currently
                newElement.addEventListener('click', () => { });
            }
        }
    }

    updatePlayerStats() {
        const player = this.game.player;
        this.statHealth.textContent = player.health;
        this.statMaxHealth.textContent = player.maxHealth;
        this.statAttack.textContent = player.getAttack();
        this.statDefense.textContent = player.getDefense();
        this.statGold.textContent = player.gold;
        // Add round display
        if (this.statRound) {
            this.statRound.textContent = `${this.game.currentRound}/${this.game.maxRounds}`;
        }
    }

    renderLog() {
        // Check if the elements exist before manipulating them
        if (!this.outputLog || !this.outputLogArea) {
            console.error("UI Error: Cannot render log, outputLog or outputLogArea element not found.");
            return;
        }

        this.outputLog.innerHTML = ''; // Clear existing log
        this.game.logMessages.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            this.outputLog.appendChild(li);
        });

        // Scroll to the bottom using the CORRECT property name
        // Also add a check in case the element somehow became invalid later
        if (this.outputLogArea) {
            this.outputLogArea.scrollTop = this.outputLogArea.scrollHeight; // Use this.outputLogArea
        }
    }

    renderChoices(choices) {
        this.clearMainArea();
        this.choicesArea.classList.remove('hidden');
        this.choicesArea.innerHTML = '';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '15px';
        buttonsContainer.style.width = '100%';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.classList.add('choice-button');
            
            // Automatically select the first option
            if (index === 0) {
                button.classList.add('selected');
                // Trigger the selection immediately
                setTimeout(() => this.game.selectChoice(0), 0);
            }
            
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                this.choicesArea.querySelectorAll('.choice-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                // Add selected class to clicked button
                button.classList.add('selected');
                this.game.selectChoice(index);
            });
            buttonsContainer.appendChild(button);
        });

        this.choicesArea.appendChild(buttonsContainer);
    }

    showEncounterConfirmation(choice, index) {
        // Remove any existing confirmation box
        const existingConfirmation = this.choicesArea.querySelector('.encounter-confirmation');
        if (existingConfirmation) {
            existingConfirmation.remove();
        }

        const confirmationBox = document.createElement('div');
        confirmationBox.classList.add('encounter-confirmation');

        const details = document.createElement('div');
        details.classList.add('encounter-details');
        const detailsText = this.game.getEncounterDetails(choice.encounter)
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        details.textContent = detailsText;
        confirmationBox.appendChild(details);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('confirmation-buttons');

        const confirmButton = document.createElement('button');
        let difficultyText = '';
        
        // Add difficulty coloring and text for combat encounters
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
        buttonsContainer.appendChild(confirmButton);
        confirmationBox.appendChild(buttonsContainer);

        this.choicesArea.appendChild(confirmationBox);
    }

    // --- UI State Changes ---

    clearMainArea() {
        this.choicesArea.classList.add('hidden');
        this.combatArea.classList.add('hidden');
        this.shopArea.classList.add('hidden');
        this.restArea.classList.add('hidden');
        this.lootArea.classList.add('hidden'); // <<< HIDE LOOT AREA TOO

        this.choicesArea.innerHTML = '';
        // Reset innerHTML for other areas if needed, or just hide them
        // ... (reset combat area structure, shop, rest if needed) ...
        this.cacheDynamicElements(); // Re-cache anything dynamic inside cleared areas
        this.outputLogArea.classList.add('hidden');
    }

    cacheDynamicElements() {
        // Elements inside areas that get cleared need re-caching
        this.combatPlayerHp = document.getElementById('combat-player-hp');
        this.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.shopItemsContainer = document.getElementById('shop-items');
        this.shopRerollButton = document.getElementById('shop-reroll-button');
        this.lootGold = document.getElementById('loot-gold');
        this.lootItemsContainer = document.getElementById('loot-items');
        this.lootTakeButton = document.getElementById('loot-take-button');
        // Re-attach listener if necessary (e.g., if lootArea innerHTML was cleared)
        if (this.lootTakeButton && !this.lootTakeButton.onclick) {
            this.lootTakeButton.onclick = () => this.game.collectLoot();
        }
    }

    showLootUI(loot) {
        this.clearMainArea();

        if (!this.lootArea) {
            console.error("UI Error: Cannot show loot UI, lootArea element missing.");
            return;
        }

        // Convert gold into a loot item format for consistent display
        let allLootItems = [];
        if (loot.gold > 0) {
            allLootItems.push({
                name: `${loot.gold} Gold`,
                description: "Precious golden coins",
                type: "gold",
                amount: loot.gold
            });
        }
        if (loot.items) {
            // Only show unlooted items
            allLootItems = allLootItems.concat(loot.items.filter(item => !item.looted));
        }

        this.lootArea.innerHTML = `
            <h3>Loot Found!</h3>
            <div id="loot-items" class="loot-items-container">
                <!-- Items will be added here -->
            </div>
            <div class="loot-buttons">
                ${allLootItems.length > 0 ? 
                    '<button id="loot-take-all-button">Take All</button>' : ''
                }
                <button id="loot-continue-button">Continue</button>
            </div>
        `;

        // Display all loot items (including gold) in a consistent format
        const lootItemsContainer = this.lootArea.querySelector('#loot-items');
        if (lootItemsContainer) {
            allLootItems.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('loot-item');
                itemDiv.dataset.index = index;
                itemDiv.dataset.type = item.type || 'item';
                
                itemDiv.innerHTML = `
                    <div class="loot-item-info">
                        <span class="loot-item-icon">${item.spritePath ? '' : 'I'}</span>
                        <span class="loot-item-name">${item.name}</span>
                    </div>
                    <button class="loot-item-button">Take</button>
                `;
                
                // Add tooltip functionality
                const nameSpan = itemDiv.querySelector('.loot-item-name');
                nameSpan.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.itemTooltip, e));
                nameSpan.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));

                // Add take button listener
                const takeButton = itemDiv.querySelector('.loot-item-button');
                takeButton.onclick = () => {
                    if (item.type === 'gold') {
                        this.game.handleIndividualLoot('gold');
                    } else {
                        // Find the actual index in the original items array
                        const itemIndex = loot.items.findIndex((lootItem, idx) => 
                            !lootItem.looted && 
                            lootItem.name === item.name && 
                            lootItem.description === item.description
                        );
                        this.game.handleIndividualLoot('item', itemIndex);
                    }
                };

                lootItemsContainer.appendChild(itemDiv);
            });
        }

        // Add button listeners
        const takeAllButton = this.lootArea.querySelector('#loot-take-all-button');
        if (takeAllButton) {
            takeAllButton.onclick = () => this.game.collectLoot();
        }

        const continueButton = this.lootArea.querySelector('#loot-continue-button');
        if (continueButton) {
            continueButton.onclick = () => this.game.continueLoot();
        }

        this.lootArea.classList.remove('hidden');
    }

    showCombatUI(player, enemy) {
        this.clearMainArea();
        this.combatArea.classList.remove('hidden');
        
        // Set enemy name
        document.getElementById('combat-enemy-name').textContent = enemy.name;
        
        // Initialize health displays
        this.updateCombatantHealth('player', player.health, player.maxHealth);
        this.updateCombatantHealth('enemy', enemy.health, enemy.maxHealth);
        
        // Initialize timer displays
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
            
            // Add damage flash effect
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth; // Force reflow
            healthBar.classList.add('damage-taken');

            // Create damage splat if damage was dealt or fully blocked
            if (damage > 0 || fullBlock) {
                this.createDamageSplat('player', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
            }
        } else if (who === 'enemy') {
            this.combatEnemyHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.enemy-health');
            healthBar.style.width = `${percentage}%`;
            
            // Add damage flash effect
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth; // Force reflow
            healthBar.classList.add('damage-taken');

            // Create damage splat if damage was dealt or fully blocked
            if (damage > 0 || fullBlock) {
                this.createDamageSplat('enemy', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
            }
        }
    }

    updateCombatTimers(playerTime, enemyTime) {
        // Update text
        this.combatPlayerTimer.textContent = playerTime.toFixed(1);
        this.combatEnemyTimer.textContent = enemyTime.toFixed(1);
        
        // Update timer bars
        const playerMaxTime = this.game.player.getAttackSpeed() || this.game.player.defaultAttackSpeed; // Add fallback
        const enemyMaxTime = this.game.currentCombat.enemy.speed;
        
        const playerTimerBar = document.querySelector('.player-timer');
        const enemyTimerBar = document.querySelector('.enemy-timer');
        
        playerTimerBar.style.width = `${(playerTime / playerMaxTime) * 100}%`;
        enemyTimerBar.style.width = `${(enemyTime / enemyMaxTime) * 100}%`;
    }

    showShopUI(items, canReroll) {
        this.clearMainArea();
        this.shopArea.classList.remove('hidden');

        // Update shop HTML structure to match loot screen style
        this.shopArea.innerHTML = `
            <h3>Shop</h3>
            <div id="shop-items" class="shop-items-container">
                <!-- Items will be added here -->
            </div>
            <div class="shop-buttons">
                <button id="shop-reroll-button" class="shop-reroll-button">Reroll (${SHOP_REROLL_COST} Gold)</button>
                <button id="shop-leave-button" class="shop-leave-button">Leave Shop</button>
            </div>
        `;

        const shopItemsContainer = this.shopArea.querySelector('#shop-items');
        
        // Add items using similar structure to loot items
        items.forEach((item, index) => {
            if (!item) return; // Skip if item was already bought

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('shop-item');
            itemDiv.dataset.index = index;
            
            itemDiv.innerHTML = `
                <div class="shop-item-info">
                    <span class="shop-item-icon">I</span>
                    <span class="shop-item-name">${item.name}</span>
                    <span class="shop-item-price">${item.buyPrice} G</span>
                </div>
                <button class="shop-item-button">Buy</button>
            `;
            
            // Add tooltip functionality
            const nameSpan = itemDiv.querySelector('.shop-item-name');
            nameSpan.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.itemTooltip, e));
            nameSpan.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));

            // Add buy button listener
            const buyButton = itemDiv.querySelector('.shop-item-button');
            buyButton.onclick = () => handleBuyItem(this.game, this, index);

            shopItemsContainer.appendChild(itemDiv);
        });

        // Re-attach button listeners
        const rerollButton = this.shopArea.querySelector('#shop-reroll-button');
        const leaveButton = this.shopArea.querySelector('#shop-leave-button');
        
        rerollButton.disabled = !canReroll;
        rerollButton.onclick = () => handleRerollShop(this.game, this);
        leaveButton.onclick = () => {
            this.game.addLog("You leave the shop.");
            this.game.proceedToNextRound();
        };
    }


    showRestUI() {
        this.clearMainArea();
        this.restArea.classList.remove('hidden');
        // Ensure continue button listener is attached
        document.getElementById('rest-continue-button').onclick = () => {
            this.game.proceedToNextRound();
        };
    }


    /**
     * Shows a tooltip, preventing display if the context menu is active.
     * @param {string} text - The text content for the tooltip.
     * @param {HTMLElement} tooltipElement - The tooltip DOM element (itemTooltip or equipTooltip).
     * @param {MouseEvent} event - The mouse event triggering the tooltip.
     */
    showTooltip(text, tooltipElement, event) {
        // --- Prevent Tooltip if Context Menu is Open ---
        if (this.itemContextMenu && !this.itemContextMenu.classList.contains('hidden')) {
            return; // Do nothing if the context menu is visible
        }
        // ----------------------------------------------

        if (!tooltipElement) return; // Safety check

        tooltipElement.innerHTML = text;
        tooltipElement.classList.remove('hidden');

        // Positioning Logic (keep as before)
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
        if (tooltipElement) { // Check if element exists
            tooltipElement.classList.add('hidden');
        }
    }

    /**
     * Displays the context menu for an inventory item.
     * @param {object} item - The item object from the player's inventory.
     * @param {number} index - The inventory index of the item.
     * @param {MouseEvent} event - The click event that triggered the menu.
     */
    showContextMenu(item, index, event) {
        // Hide Tooltips FIRST
        this.hideTooltip(this.itemTooltip);
        this.hideTooltip(this.equipTooltip);

        // Verify Essential Elements
        const slotElement = event.target.closest('.inventory-slot');
        if (!this.inventoryArea || !slotElement) {
            console.error("UI Error: Cannot show context menu - slot or inventory area missing.");
            this.hideContextMenu();
            return;
        }

        // Show Context Menu
        this.hideContextMenu();
        this.itemContextMenu.innerHTML = '';

        // --- Add Action Buttons ---
        // Equip
        if (item.type === 'weapon' || item.type === 'armor') {
            const equipButton = document.createElement('button');
            equipButton.textContent = 'Equip';
            equipButton.onclick = () => this.game.handleEquipItem(index);
            this.itemContextMenu.appendChild(equipButton);
        }
        // Use/Consume
        if (item.type === 'consumable') {
            const useButton = document.createElement('button');
            useButton.textContent = item.useAction || 'Use';
            useButton.onclick = () => this.game.handleUseItem(index);
            this.itemContextMenu.appendChild(useButton);
        }
        // Sell (In Shop)
        if (this.game.state === 'shop') {
            const sellButton = document.createElement('button');
            const sellPrice = item.value || 0;
            sellButton.textContent = `Sell (${sellPrice} G)`;
            sellButton.onclick = () => handleSellItem(this.game, this, index);
            this.itemContextMenu.appendChild(sellButton);
        }
        // Destroy
        const destroyButton = document.createElement('button');
        destroyButton.textContent = 'Destroy';
        // Use a class for styling instead of direct style manipulation if preferred
        destroyButton.classList.add('context-destroy-button'); // Added class
        destroyButton.onclick = () => this.game.handleDestroyItem(index);
        this.itemContextMenu.appendChild(destroyButton);

        // --- Add Cancel Button ---
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('context-cancel-button'); // Added class for styling
        cancelButton.onclick = () => this.hideContextMenu(); // Simply hide the menu
        this.itemContextMenu.appendChild(cancelButton);
        // --- End Adding Buttons ---

        // --- Updated Positioning Logic ---
        const slotRect = slotElement.getBoundingClientRect();
        const inventoryRect = this.inventoryArea.getBoundingClientRect();

        // Calculate position relative to the clicked slot
        let top = slotRect.top - inventoryRect.top + slotRect.height + 5;
        let left = slotRect.left - inventoryRect.left + (slotRect.width / 2);

        // Make menu visible to get its dimensions
        this.itemContextMenu.classList.remove('hidden');
        const menuRect = this.itemContextMenu.getBoundingClientRect();

        // Adjust position if menu would go outside inventory area
        if (left + (menuRect.width / 2) > inventoryRect.width) {
            left = slotRect.left - inventoryRect.left - menuRect.width + slotRect.width;
        }
        if (left - (menuRect.width / 2) < 0) {
            left = menuRect.width / 2;
        }
        if (top + menuRect.height > inventoryRect.height) {
            top = slotRect.top - inventoryRect.top - menuRect.height - 5;
        }

        // Apply final position
        this.itemContextMenu.style.left = `${left}px`;
        this.itemContextMenu.style.top = `${top}px`;
    }

    hideContextMenu() {
        if (this.itemContextMenu) { // Check if element exists
            this.itemContextMenu.classList.add('hidden');
        }
    }



    // --- End Screen ---
    showEndScreen(win) {
        this.switchScreen('end-screen');
        this.endMessage.textContent = win ? "Congratulations! You defeated the Dragon!" : "Game Over. You have fallen.";
    }

    renderRoundIndicator() {
        if (!this.roundIndicatorArea) {
            console.error("UI Error: roundIndicatorArea not found.");
            return;
        }
        if (!this.game) {
            console.error("UI Error: game object not available for round indicator.");
            return;
        }

        this.roundIndicatorArea.innerHTML = ''; // Clear previous orbs

        for (let i = 1; i <= this.game.maxRounds; i++) {
            const orb = document.createElement('div');
            orb.classList.add('round-orb');
            orb.dataset.round = i; // Optional: store round number

            // Highlight the current round
            if (i === this.game.currentRound) {
                orb.classList.add('current-round');
            }

            this.roundIndicatorArea.appendChild(orb);
        }
    }

    createDamageSplat(who, amount, type = 'damage', blocked = 0, fullBlock = false) {
        const combatant = document.querySelector(who === 'player' ? '.player-side' : '.enemy-side');
        if (!combatant) return;

        // Create container if it doesn't exist
        let container = combatant.querySelector('.damage-splat-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'damage-splat-container';
            combatant.appendChild(container);
        }

        // Create the damage splat element
        const splat = document.createElement('div');
        splat.className = `damage-splat ${type}`;
        
        // Position randomly within the container
        const x = Math.random() * 60 - 30; // Random x position between -30 and 30
        splat.style.left = `calc(50% + ${x}px)`;
        splat.style.top = '50%';

        // Set text content based on type and blocked amount
        if (type === 'damage') {
            if (fullBlock) {
                splat.innerHTML = `<span style="color: #aaaaaa">BLOCKED ${blocked}</span>`;
            } else if (blocked > 0) {
                splat.innerHTML = `${amount};` // <span style="color: #aaaaaa"> (${blocked} blocked)</span>`
            } else {
                splat.textContent = amount;
            }
        } else if (type === 'heal') {
            splat.textContent = '+' + amount;
        }

        // Add to container and remove after animation
        container.appendChild(splat);
        setTimeout(() => splat.remove(), 2000);
    }

    showLog() {
        // Hide all other content areas first
        this.choicesArea.classList.add('hidden');
        this.combatArea.classList.add('hidden');
        this.shopArea.classList.add('hidden');
        this.restArea.classList.add('hidden');
        this.lootArea.classList.add('hidden');

        // Show the log area
        this.outputLogArea.classList.remove('hidden');
        this.renderLog(); // Refresh the log content
    }

    hideLog() {
        this.outputLogArea.classList.add('hidden');
        
        // Show the appropriate content area based on game state
        switch (this.game.state) {
            case 'choosing':
                this.choicesArea.classList.remove('hidden');
                break;
            case 'combat':
                this.combatArea.classList.remove('hidden');
                break;
            case 'shop':
                this.shopArea.classList.remove('hidden');
                break;
            case 'rest':
                this.restArea.classList.remove('hidden');
                break;
            case 'looting':
                this.lootArea.classList.remove('hidden');
                break;
        }
    }
}