class UI {
    constructor(game) {
        this.game = game; // Reference to the game logic
        this.roundIndicatorArea = document.getElementById('round-indicator-area');
        this.draggedItemIndex = null; // NEW: Store index of dragged item
        this.draggedItem = null;      // NEW: Store reference to dragged item
        
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
        this.statSpeed = document.getElementById('stat-speed'); // Add this line
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
            this.toggleLogButton.onclick = () => new Log(this.game, this).showLog();
        }
        if (this.closeLogButton) {
            this.closeLogButton.onclick = () => new Log(this.game, this).hideLog();
        }
    }

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
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

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
        console.log("[LoopDebug] Entering renderInventory"); // ADD LOG
        if (!this.inventoryGrid) {
            console.error("UI Error: inventoryGrid not found during renderInventory.");
            return;
        }
        console.log("[Trace] Entering renderInventory()"); // Add Log

        this.inventoryGrid.innerHTML = ''; // Clear existing slots

        this.game.player.inventory.forEach((item, index) => {
            console.log(`[Trace] renderInventory loop: index=${index}, item=`, item); // Log item being processed
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
                console.log(`[Trace] Attaching dragstart listener for index ${index}`); // Log dragstart attach

                // 5. dragstart: What happens when dragging starts from this slot
                slot.addEventListener('dragstart', (event) => {
                    // Store the index of the item being dragged
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move'; // Indicate it's a move operation

                    // --- NEW: Store drag info ---
                    this.draggedItemIndex = index;
                    this.draggedItem = item; // Store the actual item object
                    // --- End NEW ---

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

                    // --- NEW: Clear stored drag info ---
                    this.draggedItemIndex = null;
                    this.draggedItem = null;
                    // --- End NEW ---
                });

                // Tooltip/Context Menu listeners (only for filled slots)
                slot.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.itemTooltip, e));
                slot.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));
                
                console.log(`[Trace] Attaching click listener for index ${index}`); // Log click attach
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

        // After rendering, re-apply in-use styles based on current crafting state
        this.updateInventoryInUseStyles(); 
        console.log("[Trace] Exiting renderInventory()"); // Add Log
    }

    updateInventoryInUseStyles() {
        console.log("[Trace] Entering updateInventoryInUseStyles()"); // Add Log
        const inventorySlots = this.inventoryGrid.querySelectorAll('.inventory-slot');
        const usedIndices = new Set();

        // Check Blacksmith slots
        const forgeSlot1 = document.getElementById('forge-slot-1');
        const forgeSlot2 = document.getElementById('forge-slot-2');
        const forgeIndex1 = forgeSlot1?.dataset.itemIndex;
        const forgeIndex2 = forgeSlot2?.dataset.itemIndex;
        console.log(`[Debug] updateInventoryInUseStyles: Forge Slot 1 Index: ${forgeIndex1}, Forge Slot 2 Index: ${forgeIndex2}`);
        if (forgeIndex1) usedIndices.add(parseInt(forgeIndex1));
        if (forgeIndex2) usedIndices.add(parseInt(forgeIndex2));

        // Check Sharpen slot
        const sharpenSlot = document.querySelector('#sharpen-area .sharpen-slot'); // More specific selector
        const sharpenIndex = sharpenSlot?.dataset.itemIndex;
        console.log(`[Debug] updateInventoryInUseStyles: Sharpen Slot Index: ${sharpenIndex}`);
        if (sharpenIndex) usedIndices.add(parseInt(sharpenIndex));

        // Check Armourer slot
        const armourerSlot = document.querySelector('#armourer-area .armourer-slot'); // More specific selector
        const armourerIndex = armourerSlot?.dataset.itemIndex;
        console.log(`[Debug] updateInventoryInUseStyles: Armourer Slot Index: ${armourerIndex}`);
        if (armourerIndex) usedIndices.add(parseInt(armourerIndex));

        console.log('[Debug] updateInventoryInUseStyles: Final usedIndices Set:', usedIndices);

        // Apply/Remove styles
        inventorySlots.forEach((slot, index) => {
            const isInUse = usedIndices.has(index);
            console.log(`[Debug] updateInventoryInUseStyles: Inventory Index ${index}, In Use? ${isInUse}`);
            if (isInUse) {
                slot.classList.add('in-use');
                slot.draggable = false;
            } else {
                slot.classList.remove('in-use');
                // Draggability is set based on item presence during initial render
                const item = this.game.player.inventory[index];
                slot.draggable = !!item; 
            }
        });
        console.log("[Trace] Exiting updateInventoryInUseStyles()"); // Add Log
    }

    renderEquipment() {
        console.log("[LoopDebug] Entering renderEquipment"); // ADD LOG
        for (const slotName in this.equipSlots) {
            console.log(`[LoopDebug] renderEquipment: Processing slot: ${slotName}`); // ADD LOG
            const item = this.game.player.equipment[slotName];
            console.log(`[LoopDebug] renderEquipment: Item for slot ${slotName}:`, item); // ADD LOG
            const slotElement = this.equipSlots[slotName]; // Get element from cache

            if (!slotElement) {
                console.warn(`[LoopDebug] renderEquipment: Slot element not found for ${slotName}`); // ADD LOG
                continue; // Skip if element not found
            }

            // --- REMOVE Cloning --- 
            // console.log(`[LoopDebug] renderEquipment: Cloning node for ${slotName}`);
            // const newElement = slotElement.cloneNode(true);
            // console.log(`[LoopDebug] renderEquipment: Replacing child for ${slotName}`);
            // slotElement.parentNode.replaceChild(newElement, slotElement); 
            // console.log(`[LoopDebug] renderEquipment: Updating cache reference for ${slotName}`);
            // this.equipSlots[slotName] = newElement; 
            // --- Use existing slotElement directly ---
            const elementToModify = slotElement; 

            // Clean up previous state classes & content
            elementToModify.classList.remove('slot-empty', 'slot-filled');
            elementToModify.innerHTML = ''; // Clear content and listeners (less reliable than clone)

            if (item) {
                // --- Item is equipped ---
                elementToModify.textContent = item.name; // Show item name
                elementToModify.classList.add('slot-filled');
                // Re-add listeners
                console.log(`[LoopDebug] renderEquipment: Adding listeners for filled slot ${slotName}`); // ADD LOG
                elementToModify.addEventListener('mouseenter', (e) => this.showTooltip(item.description, this.equipTooltip, e));
                elementToModify.addEventListener('mouseleave', () => this.hideTooltip(this.equipTooltip));
                elementToModify.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.game.handleUnequipItem(slotName);
                });

            } else {
                // --- Slot is empty ---
                elementToModify.textContent = slotName.toUpperCase(); // Show default slot name (HELM, etc.)
                elementToModify.classList.add('slot-empty');
                // Re-add listeners
                console.log(`[LoopDebug] renderEquipment: Adding listeners for empty slot ${slotName}`); // ADD LOG
                elementToModify.addEventListener('mouseenter', () => {
                    this.hideTooltip(this.itemTooltip);
                    this.hideTooltip(this.equipTooltip);
                });
                elementToModify.addEventListener('click', () => { }); // No action
            }
        }
        console.log("[LoopDebug] Exiting renderEquipment normally"); // ADD LOG
    }

    updatePlayerStats() {
        const player = this.game.player;
        this.statHealth.textContent = player.health;
        this.statMaxHealth.textContent = player.maxHealth;
        
        // Attack Display
        let attackText = player.getAttack();
        if (player.tempAttack > 0) {
            attackText += ` (+${player.tempAttack})`; // Add temporary buff display
        }
        this.statAttack.textContent = attackText;

        // Defense Display
        let defenseText = player.getDefense();
        if (player.tempDefense > 0) {
            defenseText += ` (+${player.tempDefense})`; // Add temporary buff display
        }
        this.statDefense.textContent = defenseText;
        
        // Speed Display
        let speedValue = player.getAttackSpeed();
        let speedText = `${speedValue.toFixed(1)}s`; // Format to one decimal place and add 's'
        if (player.tempSpeedReduction > 0) {
            speedText += ` (-${player.tempSpeedReduction.toFixed(1)}s)`; // Show reduction
        }
        this.statSpeed.textContent = speedText;

        this.statGold.textContent = player.gold;
        // Add round display
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
        buttonsContainer.style.flexWrap = 'wrap'; // Allow wrapping
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '15px';
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.padding = '10px'; // Add some padding

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.classList.add('choice-button');
            button.style.flex = '0 1 auto'; // Allow buttons to shrink but not grow
            button.style.minWidth = '200px'; // Minimum width for buttons
            button.style.maxWidth = '300px'; // Maximum width for buttons
            
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
        
        // Check if this is a fishing encounter and handle requirements
        let buttonDisabled = false;
        let requirementHTML = '';
        
        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');

        if (choice.encounter.type === 'fishing') {
            if (!hasFishingRod) {
                requirementHTML = '<div style="color: #ff4444; margin-bottom: 10px;">Requires: Fishing Rod</div>';
                buttonDisabled = true;
            }
        } else if (choice.encounter.type === 'blacksmith' || choice.encounter.type === 'armourer') {
            if (!hasHammer) {
                requirementHTML = '<div style="color: #ff4444; margin-bottom: 10px;">Requires: Blacksmith Hammer</div>';
                buttonDisabled = true;
            }
        }
        
        // Use innerHTML instead of textContent to allow HTML formatting
        details.innerHTML = requirementHTML + this.game.getEncounterDetails(choice.encounter);
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
        
        // Disable button if requirements not met
        if (buttonDisabled) {
            confirmButton.disabled = true;
        }
        
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
        // Also hide the trap area if it exists
        const trapArea = document.getElementById('trap-area');
        if (trapArea) {
            trapArea.classList.add('hidden');
        }
        
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

        const startingPackArea = document.getElementById('starting-pack-area');
        if (startingPackArea) {
            startingPackArea.remove();
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
                this.createDamageSplat('.player-side', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
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
                this.createDamageSplat('.enemy-side', damage, isHeal ? 'heal' : 'damage', blocked, fullBlock);
            }
        }
    }

    updateCombatTimers(playerTime, enemyTime, playerDelay = 0) {
        // Update text
        this.combatPlayerTimer.textContent = playerDelay > 0 ? 
            `Delayed: ${playerDelay.toFixed(1)}s` : 
            playerTime.toFixed(1);
        this.combatEnemyTimer.textContent = enemyTime.toFixed(1);
        
        // Update timer bars
        const playerMaxTime = this.game.player.getAttackSpeed();
        const enemyMaxTime = this.game.currentCombat.enemy.speed;
        
        const playerTimerBar = document.querySelector('.player-timer');
        const enemyTimerBar = document.querySelector('.enemy-timer');
        
        if (playerDelay > 0) {
            // Show delay timer in yellow
            playerTimerBar.style.width = `${(playerDelay / 2) * 100}%`; // 2 seconds is max delay
            playerTimerBar.style.backgroundColor = '#ffd700';
        } else {
            // Show normal attack timer
            playerTimerBar.style.width = `${(playerTime / playerMaxTime) * 100}%`;
            playerTimerBar.style.backgroundColor = ''; // Reset to default color
        }
        
        enemyTimerBar.style.width = `${(enemyTime / enemyMaxTime) * 100}%`;
    }

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


    showContextMenu(item, index, event) {
        console.log(`[LoopDebug] Entering showContextMenu for index ${index}`); // ADD LOG
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
            sellButton.onclick = () => new Shop(this.game, this).handleSellItem(index);
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



    showEndScreen(win) {
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'escape-backdrop';
        document.body.appendChild(backdrop);

        // Create game over container
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

    createDamageSplat(targetSelector, amount, type = 'damage', blocked = 0, fullBlock = false) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            console.error("Damage splat target not found:", targetSelector);
            return;
        };

        // Create container if it doesn't exist (relative positioning needed on parent)
        let container = targetElement.querySelector('.damage-splat-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'damage-splat-container';
            // Ensure parent has relative positioning for absolute positioning of splats
            // Check if computed style is static - more reliable
            if (getComputedStyle(targetElement).position === 'static') {
                 targetElement.style.position = 'relative';
            }
            targetElement.appendChild(container);
        }

        // Create the damage splat element
        const splat = document.createElement('div');
        splat.className = `damage-splat ${type}`;
        
        // Position randomly horizontally
        const x = Math.random() * 60 - 30; // Random x position between -30 and 30
        splat.style.left = `calc(50% + ${x}px)`;
        
        // --- ADJUST VERTICAL POSITION ---
        // Default to middle, but start higher for inventory panel
        if (targetSelector === '#inventory-area') {
            splat.style.top = '15%'; // Start higher up
        } else {
            splat.style.top = '50%'; // Default for combat, rest, etc.
        }
        // --------------------------------

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