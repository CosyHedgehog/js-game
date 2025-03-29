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
        this.lootArea.classList.add('hidden');
        
        // Add these lines to remove both blacksmith and sharpen areas
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

        const shrineArea = document.getElementById('shrine-area');
        if (shrineArea) {
            shrineArea.remove();
        }

        const wanderingMerchantArea = document.getElementById('wandering-merchant-area');
        if (wanderingMerchantArea) {
            wanderingMerchantArea.remove();
        }
        

        this.choicesArea.innerHTML = '';
        this.cacheDynamicElements();
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
            if (!item) return;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('shop-item');
            itemDiv.dataset.index = index;
            
            itemDiv.innerHTML = `
                <div class="shop-item-info">
                    <span class="shop-item-icon">I</span>
                    <span class="shop-item-name">${item.name}</span>
                    <span class="shop-item-price">${item.buyPrice} G</span>
                </div>
                <button class="shop-item-button" ${this.game.player.gold < item.buyPrice ? 'disabled' : ''}>Buy</button>
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
        
        // Make menu visible to get its dimensions
        this.itemContextMenu.classList.remove('hidden');
        const menuRect = this.itemContextMenu.getBoundingClientRect();

        // Calculate position relative to viewport
        let left = slotRect.left;
        let top = slotRect.bottom + 5; // 5px gap below the slot

        // Adjust if menu would go off screen
        if (left + menuRect.width > window.innerWidth) {
            left = slotRect.right - menuRect.width;
        }
        if (top + menuRect.height > window.innerHeight) {
            top = slotRect.top - menuRect.height - 5; // Show above instead
        }

        // Keep menu on screen
        left = Math.max(5, Math.min(left, window.innerWidth - menuRect.width - 5));
        top = Math.max(5, Math.min(top, window.innerHeight - menuRect.height - 5));

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
        // If log is already visible, hide it instead
        if (!this.outputLogArea.classList.contains('hidden')) {
            this.hideLog();
            return;
        }

        // Hide all other content areas first
        this.choicesArea.classList.add('hidden');
        this.combatArea.classList.add('hidden');
        this.shopArea.classList.add('hidden');
        this.restArea.classList.add('hidden');
        this.lootArea.classList.add('hidden');
        

        // Show the log area
        this.outputLogArea.classList.remove('hidden');
        // Update button text
        if (this.toggleLogButton) {
            this.toggleLogButton.textContent = 'Hide Log';
        }
        this.renderLog(); // Refresh the log content
    }

    hideLog() {
        this.outputLogArea.classList.add('hidden');
        // Reset button text
        if (this.toggleLogButton) {
            this.toggleLogButton.textContent = 'Show Log';
        }
        
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

    confirmChoice(index) {
        const selectedChoice = this.currentChoices[index];
        const choicesArea = document.getElementById('choices-area');
        
        // Add starting animation
        choicesArea.classList.add('encounter-starting');
        
        // Wait for animation to complete before starting encounter
        setTimeout(() => {
            choicesArea.classList.remove('encounter-starting');
            this.startEncounter(selectedChoice.encounter);
        }, 500); // Match this with the animation duration
    }

    showBlacksmithUI() {
        this.clearMainArea();
        
        // Create blacksmith area HTML
        const blacksmithArea = document.createElement('div');
        blacksmithArea.id = 'blacksmith-area';
        blacksmithArea.innerHTML = `
            <h3>Blacksmith's Forge</h3>
            <p>Select two items of the same type to combine their power.</p>
            <div class="forge-container">
                <div class="forge-slot" id="forge-slot-1">
                    <div class="forge-slot-label">Item 1</div>
                    <div class="forge-slot-content">Click to select item</div>
                </div>
                <div class="forge-symbol">+</div>
                <div class="forge-slot" id="forge-slot-2">
                    <div class="forge-slot-label">Item 2</div>
                    <div class="forge-slot-content">Click to select item</div>
                </div>
                <div class="forge-symbol">=</div>
                <div class="forge-result">
                    <button id="forge-button" disabled>Forge Items</button>
                    <div id="forge-preview" class="hidden"></div>
                </div>
            </div>
            <button id="blacksmith-leave-button">Leave Forge</button>
        `;

        // Add to main area
        document.getElementById('main-content').appendChild(blacksmithArea);
        blacksmithArea.classList.remove('hidden');

        // Add event listeners
        const forgeSlot1 = document.getElementById('forge-slot-1');
        const forgeSlot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const leaveButton = document.getElementById('blacksmith-leave-button');

        // Handle slot clicks
        forgeSlot1.onclick = () => this.showForgeItemSelection(1);
        forgeSlot2.onclick = () => this.showForgeItemSelection(2);

        // Handle forge button - Fix: Bind the handler to 'this'
        forgeButton.onclick = () => {
            const slot1 = document.getElementById('forge-slot-1');
            const slot2 = document.getElementById('forge-slot-2');
            
            if (slot1.dataset.itemIndex && slot2.dataset.itemIndex) {
                this.handleForgeItems();
            }
        };

        // Handle leave button
        leaveButton.onclick = () => {
            this.game.addLog("You leave the Blacksmith's forge.");
            this.game.proceedToNextRound();
        };
    }

    showForgeItemSelection(slotNum) {
        // Get the other slot's selected item
        const otherSlotNum = slotNum === 1 ? 2 : 1;
        const otherSlot = document.getElementById(`forge-slot-${otherSlotNum}`);
        const otherSlotIndex = otherSlot.dataset.itemIndex;
        const otherItem = otherSlotIndex ? this.game.player.inventory[parseInt(otherSlotIndex)] : null;
        
        // Filter items: must be weapon or armor, and not already selected in other slot
        const items = this.game.player.inventory.filter((item, idx) => {
            if (!item || !(item.type === 'weapon' || item.type === 'armor')) {
                return false;
            }

            // If other slot has an item selected
            if (otherItem) {
                // Must be same type and slot as other item
                if (item.type !== otherItem.type || item.slot !== otherItem.slot) {
                    return false;
                }
                // Must not be the exact same item instance
                if (idx === parseInt(otherSlotIndex)) {
                    return false;
                }
            }

            return true;
        });
        
        const menu = document.createElement('div');
        menu.classList.add('forge-selection-menu');
        
        if (items.length === 0) {
            const noItemsMsg = document.createElement('div');
            noItemsMsg.textContent = otherItem ? 
                'No other matching items available' : 
                'No forgeable items in inventory';
            noItemsMsg.style.padding = '10px';
            menu.appendChild(noItemsMsg);
        } else {
            items.forEach(item => {
                const itemButton = document.createElement('button');
                itemButton.classList.add('forge-item-option');
                itemButton.textContent = `${item.name} (${this.getItemStats(item)})`;
                // Find the actual inventory index of this item
                const inventoryIndex = this.game.player.inventory.indexOf(item);
                itemButton.onclick = () => this.selectForgeItem(item, inventoryIndex, slotNum);
                menu.appendChild(itemButton);
            });
        }

        // Position and show menu
        const slot = document.getElementById(`forge-slot-${slotNum}`);
        const rect = slot.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        
        // Remove any existing menus
        document.querySelectorAll('.forge-selection-menu').forEach(m => m.remove());
        document.body.appendChild(menu);

        // Click outside to close
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !slot.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }

    getItemStats(item) {
        const stats = [];
        if (item.stats.attack) stats.push(`Atk: ${item.stats.attack}`);
        if (item.stats.defense) stats.push(`Def: ${item.stats.defense}`);
        if (item.speed) stats.push(`Spd: ${item.speed}`);
        return stats.join(', ');
    }

    selectForgeItem(item, inventoryIndex, slotNum) {
        const slot = document.getElementById(`forge-slot-${slotNum}`);
        const content = slot.querySelector('.forge-slot-content');
        content.textContent = `${item.name} (${this.getItemStats(item)})`;
        
        // Store selected item data
        slot.dataset.itemIndex = inventoryIndex;
        slot.dataset.itemType = item.type;
        slot.dataset.itemSlot = item.slot;

        // Remove selection menu
        document.querySelector('.forge-selection-menu')?.remove();

        // Check if we can forge
        this.updateForgeButton();
    }

    updateForgeButton() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const forgePreview = document.getElementById('forge-preview');

        const item1Index = slot1.dataset.itemIndex;
        const item2Index = slot2.dataset.itemIndex;

        if (item1Index && item2Index) {
            const item1 = this.game.player.inventory[item1Index];
            const item2 = this.game.player.inventory[item2Index];

            const canForge = item1 && item2 && 
                            item1.type === item2.type && 
                            item1.slot === item2.slot &&
                            item1Index !== item2Index;

            forgeButton.disabled = !canForge;

            if (canForge) {
                const previewItem = this.previewForgedItem(item1, item2);
                forgePreview.textContent = `Result: ${previewItem.name} (${this.getItemStats(previewItem)})`;
                forgePreview.classList.remove('hidden');
            } else {
                forgePreview.classList.add('hidden');
            }
        } else {
            forgeButton.disabled = true;
            forgePreview.classList.add('hidden');
        }
    }

    previewForgedItem(item1, item2) {
        // Create the forged item with proper stats structure
        const forgedItem = {
            name: `Reinforced ${item1.name}`,
            type: item1.type,
            slot: item1.slot,
            stats: {
                attack: (item1.stats.attack || 0) + (item2.stats.attack || 0),
                defense: (item1.stats.defense || 0) + (item2.stats.defense || 0)
            },
            speed: item1.speed ? Math.max(item1.speed * 0.9, item2.speed * 0.9) : undefined,
            hands: item1.hands, // Preserve hands property for weapons
            description: `A strengthened version of ${item1.name}.\n` +
                        `Attack: +${(item1.stats.attack || 0) + (item2.stats.attack || 0)}\n` +
                        `Defense: +${(item1.stats.defense || 0) + (item2.stats.defense || 0)}` +
                        (item1.speed ? `\nSpeed: ${(Math.max(item1.speed * 0.9, item2.speed * 0.9)).toFixed(1)}s` : '') +
                        (item1.hands ? `\n${item1.hands}-Handed` : '')
        };

        return forgedItem;
    }

    handleForgeItems() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        
        const item1Index = parseInt(slot1.dataset.itemIndex);
        const item2Index = parseInt(slot2.dataset.itemIndex);
        
        const item1 = this.game.player.inventory[item1Index];
        const item2 = this.game.player.inventory[item2Index];
        
        if (!item1 || !item2) return;

        // Create new forged item with proper stats
        const forgedItem = {
            ...this.previewForgedItem(item1, item2),
            value: Math.floor((item1.value + item2.value) * 1.5) // Increase value of forged item
        };
        
        // Remove original items
        this.game.player.inventory[item1Index] = null;
        this.game.player.inventory[item2Index] = null;
        
        // Add new item
        this.game.player.addItem(forgedItem);
        
        // Update UI
        this.game.addLog(`The Blacksmith combines your ${item1.name} and ${item2.name} into a ${forgedItem.name}!`);
        this.game.ui.renderInventory();
        
        // Reset forge slots
        slot1.querySelector('.forge-slot-content').textContent = 'Click to select item';
        slot2.querySelector('.forge-slot-content').textContent = 'Click to select item';
        delete slot1.dataset.itemIndex;
        delete slot2.dataset.itemIndex;
        
        // Disable forge button
        const forgeButton = document.getElementById('forge-button');
        forgeButton.disabled = true;
        
        // Hide preview
        const forgePreview = document.getElementById('forge-preview');
        forgePreview.classList.add('hidden');
    }

    showSharpenUI() {
        this.clearMainArea();
        
        // Get reference to main-content instead of undefined mainArea
        const mainContent = document.getElementById('main-content');
        
        const sharpenArea = document.createElement('div');
        sharpenArea.id = 'sharpen-area';
        
        // Create weapon slot
        const slotContainer = document.createElement('div');
        slotContainer.className = 'sharpen-container';
        
        const weaponSlot = document.createElement('div');
        weaponSlot.className = 'sharpen-slot';
        weaponSlot.innerHTML = `
            <div class="sharpen-slot-label">Select Weapon</div>
            <div class="sharpen-slot-content">Click to choose</div>
        `;
        weaponSlot.onclick = () => this.showSharpenItemSelection();
        
        // Preview area
        const previewArea = document.createElement('div');
        previewArea.id = 'sharpen-preview';
        previewArea.textContent = 'Select a weapon to preview enhancement';
        
        // Sharpen button
        const sharpenButton = document.createElement('button');
        sharpenButton.id = 'sharpen-button';
        sharpenButton.textContent = 'Enhance Weapon (+1 Attack)';
        sharpenButton.disabled = true;
        sharpenButton.onclick = () => this.handleSharpenItem();
        
        // Leave button
        const leaveButton = document.createElement('button');
        leaveButton.id = 'sharpen-leave-button';
        leaveButton.textContent = 'Leave';
        leaveButton.onclick = () => {
            this.game.addLog("You leave without using the sharpening stone.");
            this.game.proceedToNextRound();
        };
        
        slotContainer.appendChild(weaponSlot);
        sharpenArea.appendChild(slotContainer);
        sharpenArea.appendChild(previewArea);
        sharpenArea.appendChild(sharpenButton);
        sharpenArea.appendChild(leaveButton);
        
        // Append to main-content instead of undefined mainArea
        mainContent.appendChild(sharpenArea);
    }

    showSharpenItemSelection() {
        // Filter inventory to only show weapons
        const weapons = this.game.player.inventory.filter((item, idx) => {
            return item && item.type === 'weapon';
        });
        
        const menu = document.createElement('div');
        menu.classList.add('sharpen-selection-menu');
        
        if (weapons.length === 0) {
            const noItemsMsg = document.createElement('div');
            noItemsMsg.textContent = 'No weapons in inventory';
            noItemsMsg.style.padding = '10px';
            menu.appendChild(noItemsMsg);
        } else {
            weapons.forEach(item => {
                const itemButton = document.createElement('button');
                itemButton.classList.add('sharpen-item-option');
                itemButton.textContent = `${item.name} (${this.getItemStats(item)})`;
                const inventoryIndex = this.game.player.inventory.indexOf(item);
                itemButton.onclick = () => this.selectSharpenItem(item, inventoryIndex);
                menu.appendChild(itemButton);
            });
        }
        
        // Position and show menu
        const slot = document.querySelector('.sharpen-slot');
        const rect = slot.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        
        // Remove any existing menus
        document.querySelectorAll('.sharpen-selection-menu').forEach(m => m.remove());
        document.body.appendChild(menu);
        
        // Click outside to close
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !slot.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }

    selectSharpenItem(item, inventoryIndex) {
        const slot = document.querySelector('.sharpen-slot');
        slot.dataset.itemIndex = inventoryIndex;
        slot.querySelector('.sharpen-slot-content').textContent = item.name;
        
        // Update preview
        const previewArea = document.getElementById('sharpen-preview');
        const newAttack = (item.stats.attack || 0) + 1;
        previewArea.textContent = `${item.name} → Attack: ${item.stats.attack} → ${newAttack}`;
        
        // Enable sharpen button
        document.getElementById('sharpen-button').disabled = false;
        
        // Remove selection menu
        document.querySelector('.sharpen-selection-menu')?.remove();
    }

    handleSharpenItem() {
        const slot = document.querySelector('.sharpen-slot');
        const itemIndex = parseInt(slot.dataset.itemIndex);
        const item = this.game.player.inventory[itemIndex];
        
        if (!item || item.type !== 'weapon') {
            this.game.addLog("Invalid item selected.");
            return;
        }
        
        // Enhance the weapon
        item.stats.attack += 1;
        item.name = `Sharpened ${item.name}`;
        item.description = item.description.replace(/Attack: \+\d+/, `Attack: +${item.stats.attack}`);
        
        this.game.addLog(`Enhanced ${item.name}! Attack power increased by 1.`);
        this.renderInventory();
        
        // Proceed to next round
        this.clearMainArea();
        this.game.proceedToNextRound();
    }

    showArmourerUI() {
        this.clearMainArea();
        
        const mainContent = document.getElementById('main-content');
        
        const armourerArea = document.createElement('div');
        armourerArea.id = 'armourer-area';
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'armourer-container';
        
        const armorSlot = document.createElement('div');
        armorSlot.className = 'armourer-slot';
        armorSlot.innerHTML = `
            <div class="armourer-slot-label">Select Armor</div>
            <div class="armourer-slot-content">Click to choose</div>
        `;
        armorSlot.onclick = () => this.showArmourerItemSelection();
        
        const previewArea = document.createElement('div');
        previewArea.id = 'armourer-preview';
        previewArea.textContent = 'Select armor to preview enhancement';
        
        const enhanceButton = document.createElement('button');
        enhanceButton.id = 'armourer-button';
        enhanceButton.textContent = 'Enhance Armor (+1 Defense)';
        enhanceButton.disabled = true;
        enhanceButton.onclick = () => this.handleArmourEnhancement();
        
        const leaveButton = document.createElement('button');
        leaveButton.id = 'armourer-leave-button';
        leaveButton.textContent = 'Leave';
        leaveButton.onclick = () => {
            this.game.addLog("You leave without using the Armourer's tools.");
            this.game.proceedToNextRound();
        };
        
        slotContainer.appendChild(armorSlot);
        armourerArea.appendChild(slotContainer);
        armourerArea.appendChild(previewArea);
        armourerArea.appendChild(enhanceButton);
        armourerArea.appendChild(leaveButton);
        
        mainContent.appendChild(armourerArea);
    }

    showArmourerItemSelection() {
        const armors = this.game.player.inventory.filter((item) => {
            return item && item.type === 'armor';
        });
        
        const menu = document.createElement('div');
        menu.classList.add('armourer-selection-menu');
        
        if (armors.length === 0) {
            const noItemsMsg = document.createElement('div');
            noItemsMsg.textContent = 'No armor in inventory';
            noItemsMsg.style.padding = '10px';
            menu.appendChild(noItemsMsg);
        } else {
            armors.forEach(item => {
                const itemButton = document.createElement('button');
                itemButton.classList.add('armourer-item-option');
                itemButton.textContent = `${item.name} (${this.getItemStats(item)})`;
                const inventoryIndex = this.game.player.inventory.indexOf(item);
                itemButton.onclick = () => this.selectArmourItem(item, inventoryIndex);
                menu.appendChild(itemButton);
            });
        }
        
        const slot = document.querySelector('.armourer-slot');
        const rect = slot.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        
        document.querySelectorAll('.armourer-selection-menu').forEach(m => m.remove());
        document.body.appendChild(menu);
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !slot.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }

    selectArmourItem(item, inventoryIndex) {
        const slot = document.querySelector('.armourer-slot');
        slot.dataset.itemIndex = inventoryIndex;
        slot.querySelector('.armourer-slot-content').textContent = item.name;
        
        const previewArea = document.getElementById('armourer-preview');
        const newDefense = (item.stats.defense || 0) + 1;
        previewArea.textContent = `${item.name} → Defense: ${item.stats.defense} → ${newDefense}`;
        
        document.getElementById('armourer-button').disabled = false;
        
        document.querySelector('.armourer-selection-menu')?.remove();
    }

    handleArmourEnhancement() {
        const slot = document.querySelector('.armourer-slot');
        const itemIndex = parseInt(slot.dataset.itemIndex);
        const item = this.game.player.inventory[itemIndex];
        
        if (!item || item.type !== 'armor') {
            this.game.addLog("Invalid item selected.");
            return;
        }
        
        item.stats.defense += 1;
        item.name = `Reinforced ${item.name}`;
        item.description = item.description.replace(/Defense: \+\d+/, `Defense: +${item.stats.defense}`);
        
        this.game.addLog(`Enhanced ${item.name}! Defense increased by 1.`);
        this.renderInventory();
        
        this.clearMainArea();
        this.game.proceedToNextRound();
    }

    showShrineUI() {
        this.clearMainArea();
        
        const mainContent = document.getElementById('main-content');
        
        const shrineArea = document.createElement('div');
        shrineArea.id = 'shrine-area';
        shrineArea.innerHTML = `
            <h3>Mystic Shrine</h3>
            <p>The shrine hums with mysterious energy. What offering will you make?</p>
            <div class="shrine-options">
                <button id="minor-blessing" ${this.game.player.gold < 5 ? 'disabled' : ''}>
                    Minor Blessing (5 gold)
                    <div class="blessing-desc">Random effect: +1 Attack, +1 Defense, or +5 Max HP</div>
                </button>
                <button id="major-blessing" ${this.game.player.gold < 15 ? 'disabled' : ''}>
                    Major Blessing (15 gold)
                    <div class="blessing-desc">Random effect: +2 Attack, +2 Defense, or +10 Max HP</div>
                </button>
                <button id="divine-favor" ${this.game.player.gold < 30 ? 'disabled' : ''}>
                    Divine Favor (30 gold)
                    <div class="blessing-desc">Random effect: +3 Attack, +3 Defense, or +20 Max HP</div>
                </button>
            </div>
            <button id="shrine-leave-button">Leave Shrine</button>
        `;
        
        mainContent.appendChild(shrineArea);
        
        // Add event listeners
        document.getElementById('minor-blessing').onclick = () => this.handleBlessing('minor');
        document.getElementById('major-blessing').onclick = () => this.handleBlessing('major');
        document.getElementById('divine-favor').onclick = () => this.handleBlessing('divine');
        document.getElementById('shrine-leave-button').onclick = () => {
            this.game.addLog("You leave the shrine without making an offering.");
            this.game.proceedToNextRound();
        };
    }

    handleBlessing(type) {
        const costs = { minor: 5, major: 15, divine: 30 };
        const cost = costs[type];
        
        if (this.game.player.gold < cost) {
            this.game.addLog("You don't have enough gold for this blessing!");
            return;
        }
        
        this.game.player.spendGold(cost);
        
        // Random effect (attack, defense, or max health)
        const effect = Math.floor(Math.random() * 3);
        const amounts = {
            minor: [1, 1, 5],
            major: [2, 2, 10],
            divine: [3, 3, 20]
        };
        
        const [atkAmt, defAmt, hpAmt] = amounts[type];
        
        let blessingMessage = '';
        switch(effect) {
            case 0: // Attack boost
                this.game.player.baseAttack += atkAmt;
                blessingMessage = `The shrine grants you power! Base Attack +${atkAmt}`;
                break;
            case 1: // Defense boost
                this.game.player.baseDefense += defAmt;
                blessingMessage = `The shrine fortifies you! Base Defense +${defAmt}`;
                break;
            case 2: // Max HP boost
                this.game.player.maxHealth += hpAmt;
                this.game.player.health += hpAmt;
                blessingMessage = `The shrine empowers your vitality! Maximum Health +${hpAmt}`;
                break;
        }
        
        this.game.addLog(blessingMessage);
        this.updatePlayerStats();
        
        // Show confirmation box
        const shrineArea = document.getElementById('shrine-area');
        shrineArea.innerHTML = `
            <h3>Blessing Received!</h3>
            <p>${blessingMessage}</p>
            <p>You spent ${cost} gold for this blessing.</p>
            <button id="shrine-confirm-button">Continue</button>
        `;
        
        // Add event listener to the confirm button
        document.getElementById('shrine-confirm-button').onclick = () => {
            this.clearMainArea(); // Clear the shrine area
            this.game.proceedToNextRound();
        };
    }

    showAlchemistUI(items) {
        const mainContent = document.getElementById('main-content');
        const alchemistArea = document.createElement('div');
        alchemistArea.id = 'alchemist-area';
        alchemistArea.innerHTML = `
            <h3>Alchemist's Shop</h3>
            <div class="shop-items-container">
                ${items.map((item, index) => `
                    <div class="shop-item" data-item-id="${item.id}">
                        <div class="shop-item-info">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-price">${item.buyPrice} gold</span>
                        </div>
                        <button class="shop-item-button" ${this.game.player.gold < item.buyPrice ? 'disabled' : ''}>
                            Buy
                        </button>
                    </div>
                `).join('')}
                ${items.length === 0 ? '<div class="shop-empty-message">No more potions available!</div>' : ''}
            </div>
            <div id="potion-description" class="potion-description">
                Click a potion to see its description
            </div>
            <div class="shop-buttons">
                <button id="alchemist-leave-button" class="shop-leave-button">Leave Shop</button>
            </div>
        `;

        // Clear existing alchemist area if it exists
        const existingArea = document.getElementById('alchemist-area');
        if (existingArea) {
            existingArea.remove();
        }

        mainContent.appendChild(alchemistArea);
        this.setupAlchemistEventListeners(items);
    }

    setupAlchemistEventListeners(items) {
        // Add click listeners for potion descriptions
        const potionItems = document.querySelectorAll('.shop-item');
        const descriptionBox = document.getElementById('potion-description');
        
        potionItems.forEach(item => {
            const itemId = item.getAttribute('data-item-id');
            const itemData = ITEMS[itemId];
            
            item.addEventListener('click', () => {
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                    // Highlight the selected item
                    potionItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                }
            });
        });

        // Add buy button listeners
        const buyButtons = document.querySelectorAll('.shop-item-button');
        buyButtons.forEach((button, index) => {
            button.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering the description
                this.handleAlchemistBuy(index);
            };
        });

        // Add leave button listener
        const leaveButton = document.getElementById('alchemist-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => this.handleAlchemistLeave();
        }
    }

    handleAlchemistBuy(itemIndex) {
        if (!this.game || !this.game.currentShopItems || itemIndex >= this.game.currentShopItems.length) return;

        const item = this.game.currentShopItems[itemIndex];
        if (!item) return;

        // Check if player can afford it
        if (this.game.player.gold < item.buyPrice) {
            this.game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
            return;
        }

        // Check inventory space
        const freeSlot = this.game.player.findFreeInventorySlot();
        if (freeSlot === -1) {
            this.game.addLog("Your inventory is full!");
            return;
        }

        // Buy the item
        this.game.player.spendGold(item.buyPrice);
        this.game.player.addItem(item);
        this.game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);

        // Remove the item from the shop's inventory
        this.game.currentShopItems.splice(itemIndex, 1);

        // Update UI
        this.updatePlayerStats();
        this.renderInventory();
        
        // Refresh the alchemist shop display
        this.showAlchemistUI(this.game.currentShopItems);
    }

    handleAlchemistLeave() {
        if (this.game) {
            this.clearMainArea();
            this.game.proceedToNextRound();
        }
    }

    showWanderingMerchantUI(offers) {
        const mainContent = document.getElementById('main-content');
        const merchantArea = document.createElement('div');
        merchantArea.id = 'wandering-merchant-area';
        
        let html = `
            <h3>Wandering Merchant</h3>
            <div class="merchant-offers">
        `;

        if (offers.length === 0) {
            html += `
                <div class="merchant-no-offers">
                    The merchant examines your inventory but finds nothing of interest.
                </div>
            `;
        } else {
            offers.forEach((offer, index) => {
                html += `
                    <div class="merchant-offer" data-offer-index="${index}">
                        <div class="offer-name">${offer.name}</div>
                        <div class="offer-price">${offer.price} gold</div>
                        <div class="offer-description">
                            ${this.getOfferDescription(offer)}
                        </div>
                        <button class="offer-button" ${this.game.player.gold < offer.price ? 'disabled' : ''}>
                            Accept Offer
                        </button>
                    </div>
                `;
            });
        }

        html += `
            </div>
            <div class="merchant-buttons">
                <button id="merchant-leave-button">Leave Merchant</button>
            </div>
        `;

        merchantArea.innerHTML = html;
        
        // Clear existing merchant area if it exists
        const existingArea = document.getElementById('wandering-merchant-area');
        if (existingArea) {
            existingArea.remove();
        }

        mainContent.appendChild(merchantArea);
        this.setupMerchantEventListeners(offers);
    }

    getOfferDescription(offer) {
        switch (offer.type) {
            case 'combine':
                return `Combine ${offer.requires.map(id => ITEMS[id].name).join(' and ')} into a ${offer.result.name}`;
            case 'enhance':
                return `Enchant a weapon to increase its attack power by ${offer.effect.stats.attack}`;
            case 'transform':
                return `Transform a shield into a weapon, converting defense into attack power`;
            default:
                return '';
        }
    }

    setupMerchantEventListeners(offers) {
        // Add event listeners for offer buttons
        const offerButtons = document.querySelectorAll('.offer-button');
        offerButtons.forEach((button, index) => {
            button.onclick = () => this.handleMerchantOffer(offers[index]);
        });

        // Add leave button listener
        const leaveButton = document.getElementById('merchant-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => {
                this.clearMainArea();
                this.game.proceedToNextRound();
            };
        }
    }

    handleMerchantOffer(offer) {
        // Check if player can afford the offer
        if (!this.game.player.spendGold(offer.price)) {
            this.game.addLog(`You cannot afford this offer (costs ${offer.price} gold).`);
            return;
        }

        switch (offer.type) {
            case 'combine': {
                // Find and remove required items
                const items = offer.requires.map(itemId => {
                    const index = this.game.player.inventory.findIndex(item => item && item.id === itemId);
                    if (index === -1) return null;
                    return this.game.player.removeItem(index);
                });

                if (items.some(item => !item)) {
                    this.game.addLog("Error: Required items not found!");
                    return;
                }

                // Create and add new item
                const newItem = createItem(offer.result.id) || offer.result;
                if (this.game.player.addItem(newItem)) {
                    this.game.addLog(`Combined ${items.map(i => i.name).join(' and ')} into ${newItem.name}!`);
                }
                break;
            }

            case 'enhance': {
                // Show weapon selection menu
                const weaponOptions = this.game.player.inventory
                    .map((item, index) => item && item.type === 'weapon' ? { item, index } : null)
                    .filter(Boolean);

                if (weaponOptions.length === 0) {
                    this.game.addLog("You don't have any weapons to enhance!");
                    // Refund the gold since no weapons available
                    this.game.player.addGold(offer.price);
                    return;
                }

                // Clear existing merchant area content
                const merchantArea = document.getElementById('wandering-merchant-area');
                if (merchantArea) {
                    merchantArea.innerHTML = `
                        <h3>Select a Weapon to Enhance</h3>
                        <div class="merchant-selection-menu">
                            ${weaponOptions.map(({ item, index }) => `
                                <div class="merchant-item-option" data-index="${index}">
                                    ${item.name} (Attack: ${item.stats.attack || 0})
                                </div>
                            `).join('')}
                        </div>
                    `;

                    // Add selection handlers
                    merchantArea.querySelectorAll('.merchant-item-option').forEach(option => {
                        option.onclick = () => {
                            const index = parseInt(option.dataset.index);
                            const weapon = this.game.player.inventory[index];
                            
                            // Enhance the weapon
                            weapon.stats.attack = (weapon.stats.attack || 0) + offer.effect.stats.attack;
                            weapon.name = `${offer.effect.namePrefix} ${weapon.name.replace(offer.effect.namePrefix, '')}`;
                            
                            // Update description
                            weapon.description = weapon.description.replace(
                                /Attack: \+\d+/, 
                                `Attack: +${weapon.stats.attack}`
                            );
                            
                            // Show confirmation message
                            merchantArea.innerHTML = `
                                <h3>Weapon Enhanced!</h3>
                                <p>${weapon.name} has been enhanced.</p>
                                <p>New Attack Power: +${weapon.stats.attack}</p>
                                <button id="merchant-continue-button" class="confirm-button">Continue</button>
                            `;

                            // Add continue button handler
                            const continueButton = document.getElementById('merchant-continue-button');
                            if (continueButton) {
                                continueButton.onclick = () => {
                                    this.clearMainArea();
                                    this.game.proceedToNextRound();
                                };
                            }

                            // Update UI
                            this.renderInventory();
                            this.updatePlayerStats();
                        };
                    });
                }
                break;
            }

            case 'transform': {
                // Show shield selection menu
                const shieldOptions = this.game.player.inventory
                    .map((item, index) => item && item.type === 'armor' && item.slot === 'shield' ? { item, index } : null)
                    .filter(Boolean);

                const menu = document.createElement('div');
                menu.className = 'merchant-selection-menu';
                menu.innerHTML = `
                    <h4>Select a shield to transform:</h4>
                    ${shieldOptions.map(({ item, index }) => `
                        <div class="merchant-item-option" data-index="${index}">
                            ${item.name} (Defense: ${item.stats.defense})
                        </div>
                    `).join('')}
                `;

                // Add selection handlers
                menu.querySelectorAll('.merchant-item-option').forEach(option => {
                    option.onclick = () => {
                        const index = parseInt(option.dataset.index);
                        const shield = this.game.player.inventory[index];
                        
                        // Transform shield into weapon
                        const newWeapon = {
                            id: `transformed_${shield.id}`,
                            name: `${offer.result.namePrefix} ${shield.name}`,
                            type: 'weapon',
                            slot: 'weapon',
                            hands: offer.result.hands,
                            stats: {
                                attack: Math.ceil(shield.stats.defense * offer.result.statsMultiplier)
                            },
                            speed: 2.0,
                            value: shield.value * 1.5,
                            description: `A shield transformed into a weapon.\nAttack: +${Math.ceil(shield.stats.defense * offer.result.statsMultiplier)}\nSpeed: 2.0s\n1-Handed`
                        };

                        // Remove shield and add new weapon
                        this.game.player.removeItem(index);
                        this.game.player.addItem(newWeapon);
                        
                        this.game.addLog(`Transformed ${shield.name} into ${newWeapon.name}!`);
                        menu.remove();
                        this.showWanderingMerchantUI([]); // Refresh UI
                    };
                });

                const merchantArea = document.getElementById('wandering-merchant-area');
                merchantArea.appendChild(menu);
                break;
            }
        }

        // Update UI
        this.game.ui.renderInventory();
        this.game.ui.updatePlayerStats();
    }
}