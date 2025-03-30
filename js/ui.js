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

    // --- NEW: Helper to apply/remove 'in-use' styles --- 
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
    // --- End Helper ---

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



    // --- End Screen ---
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
        
        // Check for hammer
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p style="color: #ff4444; font-weight: bold;">Requires: Blacksmith Hammer</p>';

        // Create blacksmith area HTML
        const blacksmithArea = document.createElement('div');
        blacksmithArea.id = 'blacksmith-area';
        blacksmithArea.innerHTML = `
            <h3>Blacksmith's Forge</h3>
            ${hammerWarning}
            <p>Drag two items of the same type (weapon or armor) into the slots below to combine their power.</p> <!-- Updated Text -->
            <div class="forge-container">
                <div class="forge-slot" id="forge-slot-1">
                    <div class="forge-slot-label">Item 1</div>
                    <div class="forge-slot-content">Drag item here</div> <!-- Updated Text -->
            </div>
                <div class="forge-symbol">+</div>
                <div class="forge-slot" id="forge-slot-2">
                    <div class="forge-slot-label">Item 2</div>
                    <div class="forge-slot-content">Drag item here</div> <!-- Updated Text -->
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

        // --- Drag and Drop for Forge Slots ---
        [forgeSlot1, forgeSlot2].forEach((slot, index) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                const sourceIndexStr = this.draggedItemIndex;
                const sourceIndex = parseInt(sourceIndexStr);
                const item = this.game.player.inventory[sourceIndex];
                const targetSlotNum = index + 1;

                if (this.isValidForgeItem(item, sourceIndex, targetSlotNum)) {
                    e.dataTransfer.dropEffect = 'move';
                    slot.classList.add('drag-over-valid');
                    slot.classList.remove('drag-over-invalid');
                } else {
                    e.dataTransfer.dropEffect = 'none';
                    slot.classList.add('drag-over-invalid');
                    slot.classList.remove('drag-over-valid');
                }
            });

            slot.addEventListener('dragleave', (e) => {
                slot.classList.remove('drag-over-valid', 'drag-over-invalid');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over-valid', 'drag-over-invalid');

                const sourceIndexStr = this.draggedItemIndex;
                if (sourceIndexStr === null) return; // No item being dragged
                const parsedIndex = parseInt(sourceIndexStr, 10);

                if (isNaN(parsedIndex)) return;

                const item = this.game.player.inventory[parsedIndex]; // Get the item being dragged
                const targetSlotNum = index + 1;

                // Re-validate on drop
                if (!this.isValidForgeItem(item, parsedIndex, targetSlotNum)) {
                    this.game.addLog("Invalid item combination for forging."); // Updated log message
                    return;
                }

                // --- Fix: Return item if slot is already occupied --- 
                if (slot.dataset.itemData) {
                    console.log(`Slot ${targetSlotNum} occupied, clearing first...`);
                    this.clearForgeSlot(targetSlotNum); // Attempt to return existing item
                }
                // -----------------------------------------------------

                // --- Remove NEW item from inventory --- 
                const currentInventoryItem = this.game.player.inventory[parsedIndex]; 
                if (!currentInventoryItem || currentInventoryItem.id !== item.id) {
                     console.warn(`Item at index ${parsedIndex} changed or removed unexpectedly.`);
                     this.game.addLog("Action interrupted. Please try dragging the item again.");
                     this.renderInventory(); // Refresh inventory view
                     return;
                }
                const removedItem = this.game.player.removeItem(parsedIndex);
                // --- Store removed item data in the slot --- 
                slot.dataset.itemData = JSON.stringify(removedItem); // Store on the slot div itself
                slot.dataset.originalIndex = parsedIndex; // Store original index too
                // -------------------------------------------

                console.log(`Dropped item ${removedItem.name} into forge slot ${targetSlotNum}`);

                // --- Display item name and add click listener to slot for removal ---
                slot.innerHTML = `
                    <div class="forge-slot-label">Item ${targetSlotNum}</div>
                    <div class="forge-slot-content">${removedItem.name}</div>
                `; // Show item name
                slot.style.cursor = 'pointer'; // Indicate it's clickable
                
                // Add the click listener to the slot itself
                slot.onclick = () => {
                    // Only clear if it still contains item data when clicked
                    if (slot.dataset.itemData) { 
                        this.clearForgeSlot(targetSlotNum);
                    }
                };
                // --- End click listener logic ---

                slot.classList.add('crafting-slot-filled'); // Add visual class

                // Update the forge button state
                this.updateForgeButton();

                // --- Re-render inventory to show removal ---
                this.renderInventory();
                this.updateInventoryInUseStyles();
            });
        });

        // Handle forge button - Fix: Bind the handler to 'this'
        forgeButton.onclick = () => {
            const slot1 = document.getElementById('forge-slot-1');
            const slot2 = document.getElementById('forge-slot-2');
            
            // Fix: Check for itemData, not itemIndex
            if (slot1.dataset.itemData && slot2.dataset.itemData) { 
                this.handleForgeItems();
            } else {
                // Optional: Add a log if button is clicked when not ready (should be disabled, but for safety)
                console.warn("Forge button clicked but slots not ready.");
            }
        };

        // Handle leave button
        leaveButton.onclick = function() {
            this.game.addLog("You leave the Blacksmith's forge.");
            this.resetCraftingSlots(); // Reset slots on leave
            this.game.proceedToNextRound();
        }.bind(this); // Explicitly bind 'this'
    }

    // --- NEW Helper: isValidForgeItem ---
    isValidForgeItem(item, sourceIndex, targetSlotNum) {
        if (!item || (item.type !== 'weapon' && item.type !== 'armor')) {
            return false; // Must be weapon or armor
        }
        
        // Get the other slot's selected item
        const otherSlotNum = targetSlotNum === 1 ? 2 : 1;
        const otherSlot = document.getElementById(`forge-slot-${otherSlotNum}`);
        const otherSlotIndexStr = otherSlot?.dataset.itemIndex;

        if (otherSlotIndexStr !== undefined) {
            const otherSlotIndex = parseInt(otherSlotIndexStr, 10);
            // Cannot drop the same item that's in the other slot
            if (sourceIndex === otherSlotIndex) {
                 return false;
            }
            // If other slot has item, check for compatibility
            const otherItem = this.game.player.inventory[otherSlotIndex];
            if (otherItem) {
                if (item.type !== otherItem.type || item.slot !== otherItem.slot) {
                     return false; // Must be same type and slot
                }
            }
        }
        
        // Cannot drop onto a slot that already contains this exact item
        const currentTargetSlot = document.getElementById(`forge-slot-${targetSlotNum}`);
        const currentTargetIndexStr = currentTargetSlot?.dataset.itemIndex;
        if (currentTargetIndexStr !== undefined && parseInt(currentTargetIndexStr, 10) === sourceIndex) {
            return false;
        }

        return true; // Passes all checks
    }
    // --- End Helper ---

    showSharpenUI() {
        this.clearMainArea();
        
        const mainContent = document.getElementById('main-content');
        
        const sharpenArea = document.createElement('div');
        sharpenArea.id = 'sharpen-area';
        sharpenArea.innerHTML = `
            <h3>Sharpening Stone</h3>
            <p>Drag a weapon onto the stone to enhance its Attack (+1) or Speed (-0.2s).</p> <!-- Updated text -->
        `;
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'sharpen-container';
        
        const weaponSlot = document.createElement('div');
        weaponSlot.className = 'sharpen-slot';
        weaponSlot.innerHTML = `
            <div class="sharpen-slot-label">Weapon Slot</div>
            <div class="sharpen-slot-content">Drag weapon here</div>
        `;
        
        const previewArea = document.createElement('div');
        previewArea.id = 'sharpen-preview';
        previewArea.innerHTML = 'Select a weapon to preview enhancements'; // Use innerHTML for formatting
        
        // Create two buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';

        const sharpenAttackButton = document.createElement('button');
        sharpenAttackButton.id = 'sharpen-attack-button';
        sharpenAttackButton.textContent = 'Sharpen (+1 Attack)';
        sharpenAttackButton.disabled = true;
        sharpenAttackButton.onclick = () => this.handleSharpen('attack'); // New handler

        const sharpenSpeedButton = document.createElement('button');
        sharpenSpeedButton.id = 'sharpen-speed-button';
        sharpenSpeedButton.textContent = 'Hone (-0.2s Speed)';
        sharpenSpeedButton.disabled = true;
        sharpenSpeedButton.onclick = () => this.handleSharpen('speed'); // New handler
        
        const leaveButton = document.createElement('button');
        leaveButton.id = 'sharpen-leave-button';
        leaveButton.textContent = 'Leave';
        leaveButton.onclick = function() { 
            this.game.addLog("You leave without using the sharpening stone.");
            this.resetCraftingSlots(); // Reset slots on leave
            this.game.proceedToNextRound();
        }.bind(this);
        
        slotContainer.appendChild(weaponSlot);
        sharpenArea.appendChild(slotContainer);
        sharpenArea.appendChild(previewArea);
        buttonContainer.appendChild(sharpenAttackButton);
        buttonContainer.appendChild(sharpenSpeedButton);
        sharpenArea.appendChild(buttonContainer);
        sharpenArea.appendChild(leaveButton);
        
        mainContent.appendChild(sharpenArea);

        // --- Add Drag and Drop Listeners ---
        const sharpenSlot = sharpenArea.querySelector('.sharpen-slot'); 
        if (sharpenSlot) {
            // ... (dragover, dragenter, dragleave listeners remain the same) ...
            sharpenSlot.addEventListener('dragover', (event) => {
                event.preventDefault(); // Allow drop
                const sourceIndex = this.draggedItemIndex;
                const item = this.draggedItem;
                if (sourceIndex === null || item === null) return; 
                sharpenSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
                if (item && item.type === 'weapon') {
                    sharpenSlot.classList.add('drag-over-valid');
                } else {
                    sharpenSlot.classList.add('drag-over-invalid');
                }
            });

            sharpenSlot.addEventListener('dragenter', (event) => {
                event.preventDefault();
            });

            sharpenSlot.addEventListener('dragleave', (event) => {
                sharpenSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
            });

            sharpenSlot.addEventListener('drop', (event) => {
                event.preventDefault();
                sharpenSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
                
                const sourceIndexStr = event.dataTransfer.getData('text/plain');
                if (sourceIndexStr === null || sourceIndexStr === undefined || sourceIndexStr === '') {
                     console.warn("Sharpen drop event received invalid sourceIndexStr:", sourceIndexStr);
                     return; 
                }

                const sourceIndex = parseInt(sourceIndexStr, 10);
                const itemToDrop = this.game.player.inventory[sourceIndex]; 

                if (itemToDrop && itemToDrop.type === 'weapon') { 
                    if (sharpenSlot.dataset.itemData) {
                        console.log(`Sharpen slot occupied, clearing first...`);
                        this.clearSharpenSlot(); 
                    }
                    
                    const currentInventoryItem = this.game.player.inventory[sourceIndex]; 
                    if (!currentInventoryItem || currentInventoryItem.id !== itemToDrop.id) {
                         console.warn(`Item at index ${sourceIndex} changed or removed unexpectedly.`);
                         this.game.addLog("Action interrupted. Please try dragging the item again.");
                         this.renderInventory(); 
                         return;
                    }
                    const removedItem = this.game.player.removeItem(sourceIndex);
                    
                    sharpenSlot.dataset.itemData = JSON.stringify(removedItem);
                    sharpenSlot.dataset.originalIndex = sourceIndex; 

                    sharpenSlot.innerHTML = `
                        <div class="sharpen-slot-label">Weapon Slot</div>
                        <div class="sharpen-slot-content">${removedItem.name}</div>
                    `;
                    sharpenSlot.style.cursor = 'pointer';
                    sharpenSlot.onclick = () => {
                        if (sharpenSlot.dataset.itemData) { 
                            this.clearSharpenSlot();
                        }
                    };
                    
                    sharpenSlot.classList.add('crafting-slot-filled');
        
                    // Update preview for BOTH options
                    const previewElement = document.getElementById('sharpen-preview'); // Use the correct variable name
                    const currentAttack = (removedItem.stats.attack || 0);
                    const newAttack = currentAttack + 1;
                    const currentSpeed = (removedItem.speed ?? this.game.player.defaultAttackSpeed);
                    const newSpeedValue = Math.max(0.1, currentSpeed - 0.2);

                    previewElement.innerHTML = `
                        Current: Atk ${currentAttack} / Spd ${currentSpeed.toFixed(1)}s <br>
                        Sharpen: Atk ${newAttack} / Spd ${currentSpeed.toFixed(1)}s <br>
                        Hone:    Atk ${currentAttack} / Spd ${newSpeedValue.toFixed(1)}s
                    `;
                    
                    // Enable BOTH buttons
                    document.getElementById('sharpen-attack-button').disabled = false;
                    document.getElementById('sharpen-speed-button').disabled = false;
                    
                    this.renderInventory(); 

                } else {
                    this.game.addLog("You can only place weapons on the sharpening stone."); // More specific message
                }
            });
        }
         // --- End Drag and Drop Listeners ---
    }

        
    clearForgeSlot(slotNum) {
        const slotId = `forge-slot-${slotNum}`;
        const slotElement = document.getElementById(slotId);
        if (!slotElement) {
            console.error(`Forge slot element not found: ${slotId}`);
            return;
        }

        const itemDataString = slotElement.dataset.itemData;
        if (itemDataString) {
            try {
                const item = JSON.parse(itemDataString);
                if (this.game.player.addItem(item)) {
                    this.game.addLog(`Returned ${item.name} to inventory.`);
                } else {
                    this.game.addLog(`Inventory full! Failed to return ${item.name}.`);
                    // If addItem fails, we should probably still clear the slot visually,
                    // but the item is lost. Consider alternative handling?
                }
            } catch (error) {
                console.error(`Error parsing item data from forge slot ${slotNum}:`, error);
                this.game.addLog(`Error clearing slot ${slotNum}. Item data corrupted?`);
                // Still try to clear visually even if parsing fails
            }
        }

        // Reset the slot content to default without replacing the whole element
        slotElement.innerHTML = `
            <div class="forge-slot-label">Item ${slotNum}</div>
            <div class="forge-slot-content">Drag item here</div>
        `;
        slotElement.style.cursor = 'default'; // Reset cursor
        slotElement.onclick = null; // Remove click listener

        // Clear stored data
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled'); // Remove visual class

        this.updateForgeButton(); // Update button state
        this.renderInventory(); // Update inventory visuals
        this.updateInventoryInUseStyles(); // Update styles for inventory items
    }

    // --- NEW: Reset All Crafting Slots ---
    resetCraftingSlots() {
        console.log("[Trace] Entering resetCraftingSlots()"); // Add Log
        // Attempt to clear slots even if the UI isn't currently displayed
        // (Handles cases where player might leave unexpectedly)
        this.clearForgeSlot(1);
        this.clearForgeSlot(2);
        this.clearSharpenSlot();
        this.clearArmourerSlot();

        // Force an update of inventory styles to remove any lingering 'in-use' classes
        this.updateInventoryInUseStyles();
        console.log("[Trace] Exiting resetCraftingSlots()"); // Add Log
    }

    updateForgeButton() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const forgePreview = document.getElementById('forge-preview');

        // Ensure elements exist before accessing properties
        if (!slot1 || !slot2 || !forgeButton || !forgePreview) {
            console.warn("updateForgeButton: One or more required elements not found.");
            if(forgeButton) forgeButton.disabled = true;
            if(forgePreview) forgePreview.classList.add('hidden');
            return;
        }

        // Fix: Use itemData
        const item1DataString = slot1.dataset.itemData;
        const item2DataString = slot2.dataset.itemData;

        // Check for hammer as well
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');

        let canForge = false;
        let item1 = null;
        let item2 = null;

        if (item1DataString && item2DataString) {
            try {
                item1 = JSON.parse(item1DataString);
                item2 = JSON.parse(item2DataString);

                // Basic compatibility check (same type and slot, different items)
                // Note: This assumes itemData always has the necessary properties
                canForge = item1 && item2 && 
                           item1.type === item2.type && 
                           item1.slot === item2.slot && // Ensure they equip to the same place
                           item1.id === item2.id && // Require identical items for simplicity
                           hasHammer;
                           // Removed check for itemIndex !== item2Index as we don't store index here anymore

            } catch (error) {
                console.error("Error parsing item data in updateForgeButton:", error);
                canForge = false; // Treat as not forgeable if data is corrupt
            }
        }

        forgeButton.disabled = !canForge;

        if (canForge && item1 && item2) { // Ensure items were parsed successfully
            const previewItem = this.previewForgedItem(item1, item2);
            if (previewItem) {
                forgePreview.textContent = `Result: ${previewItem.name}`;
                forgePreview.classList.remove('hidden');
            } else {
                // If preview fails (e.g., incompatible despite basic checks), disable button and hide preview
                forgeButton.disabled = true;
                // forgePreview.classList.add('hidden'); // Keep preview visible for message
                forgePreview.textContent = "Cannot forge these items.";
                forgePreview.classList.remove('hidden');
            }
        } else {
            // If not canForge or items failed to parse, disable and hide
            forgeButton.disabled = true;
            // forgePreview.classList.add('hidden'); // Keep preview visible for message
            if (!item1DataString || !item2DataString) {
                 forgePreview.textContent = "Place two identical items to forge.";
            } else if (!hasHammer) {
                forgePreview.textContent = "Requires Blacksmith Hammer.";
            } else {
                forgePreview.textContent = "Items must be identical."; // Or more specific message
            }
             forgePreview.classList.remove('hidden');
        }
    }

    previewForgedItem(item1, item2) {
        // Basic check for forgeability (should match updateForgeButton logic)
        if (!item1 || !item2 || item1.type !== item2.type || item1.slot !== item2.slot || item1.id !== item2.id) {
            return null; // Return null if items are not suitable for forging
        }
        
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

        // Need value calculation
        forgedItem.value = Math.floor((item1.value + item2.value) * 1.5);

        return forgedItem;
    }

    handleForgeItems() {
        // Add check for blacksmith hammer before forging
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to forge items!");
            return; // Prevent forging without the hammer
        }

        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        
        // Fix: Get items from itemData, not itemIndex
        const item1DataString = slot1.dataset.itemData;
        const item2DataString = slot2.dataset.itemData;

        if (!item1DataString || !item2DataString) {
            console.error("Forge items called but item data missing from one or both slots.");
            return;
        }

        let item1, item2;
        try {
            item1 = JSON.parse(item1DataString);
            item2 = JSON.parse(item2DataString);
        } catch (error) {
            console.error("Error parsing item data in handleForgeItems:", error);
            this.game.addLog("Error: Could not retrieve item data for forging.");
            return;
        }
        
        if (!item1 || !item2) return; // Should not happen if parsing worked, but safety check

        // Create new forged item using preview logic
        const forgedItem = this.previewForgedItem(item1, item2);
        if (!forgedItem) { // Check if preview returned null (e.g., incompatible items)
             this.game.addLog("Cannot forge these items together."); // Add log
             return;
        }
        
        // Add new item BEFORE clearing slots
        if (!this.game.player.addItem(forgedItem)) {
            this.game.addLog("Inventory full! Cannot forge items.");
            // Do not clear slots if the forged item can't be added
            return; 
        }

        // --- Items are consumed: Reset slots directly, don't call clearForgeSlot --- 
        [slot1, slot2].forEach((slot, index) => {
            const slotNum = index + 1;
            slot.innerHTML = `
                <div class="forge-slot-label">Item ${slotNum}</div>
                <div class="forge-slot-content">Drag item here</div>
            `;
            slot.style.cursor = 'default';
            slot.onclick = null;
            delete slot.dataset.itemData;
            delete slot.dataset.originalIndex;
            slot.classList.remove('crafting-slot-filled'); // Remove filled style
        });
        // --- End Slot Reset ---
        
        // Update UI
        this.game.addLog(`The Blacksmith combines your ${item1.name} and ${item2.name} into a ${forgedItem.name}!`);
        this.updateForgeButton(); // Update button state (will disable it)
        this.renderInventory(); // Render inventory (shows new item, removes old styles)
        this.updateInventoryInUseStyles(); // Update inventory styles

        // Add flash effect
        const blacksmithArea = document.getElementById('blacksmith-area');
        if (blacksmithArea) {
            blacksmithArea.classList.add('upgrade-success-flash');
            setTimeout(() => blacksmithArea.classList.remove('upgrade-success-flash'), 500); // Duration matches animation
        }
    }

    clearSharpenSlot() {
        console.log("Clearing sharpen slot");
        // --- MODIFIED: Get element using querySelector ---
        const slotElement = document.querySelector('#sharpen-area .sharpen-slot'); 

        if (!slotElement) {
            console.error("Sharpen slot element not found using querySelector!");
            this.game.addLog("Error: UI element missing for sharpen slot.");
            return;
        }

        // --- Retrieve item data and add back to inventory ---
        const itemDataString = slotElement.dataset.itemData;
        if (itemDataString) {
            try {
                const item = JSON.parse(itemDataString);
                if (this.game.player.addItem(item)) {
                    this.game.addLog(`Returned ${item.name} to inventory.`);
                } else {
                    this.game.addLog(`Inventory full! Cannot return ${item.name}. Item lost.`);
                }
            } catch (error) {
                console.error("Error parsing item data from sharpen slot:", error);
                this.game.addLog("Error clearing slot. Item data corrupted?");
                // Don't return item if parse failed, but still clear visually
            }
        }

        // Clear visual content and stored data
        slotElement.innerHTML = `
            <div class="sharpen-slot-label">Weapon Slot</div>
            <div class="sharpen-slot-content">Drop weapon here</div>
        `;
        slotElement.style.cursor = 'default'; // Reset cursor
        slotElement.onclick = null; // Remove click listener
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex; // Clear original index too

        slotElement.classList.remove('crafting-slot-filled'); // Remove visual class

        // Reset and disable the buttons
        const sharpenAttackButton = document.getElementById('sharpen-attack-button');
        const sharpenSpeedButton = document.getElementById('sharpen-speed-button');
        if (sharpenAttackButton) sharpenAttackButton.disabled = true;
        if (sharpenSpeedButton) sharpenSpeedButton.disabled = true;

        // Reset preview text
        const previewArea = document.getElementById('sharpen-preview');
        if (previewArea) {
            previewArea.innerHTML = 'Select a weapon to preview enhancements'; // Use innerHTML
        }
        
        this.renderInventory(); // Update inventory display
    }

    handleSharpen(type) {
        const slot = document.querySelector('#sharpen-area .sharpen-slot');
        const itemDataString = slot?.dataset.itemData;
        if (!itemDataString) {
            this.game.addLog("No weapon placed on the stone.");
            return;
        }

        let item;
        try {
            item = JSON.parse(itemDataString);
        } catch (error) {
            console.error("Error parsing item data in handleSharpen:", error);
            this.game.addLog("Error: Could not retrieve item data for sharpening.");
            return;
        }

        if (!item || item.type !== 'weapon') {
            this.game.addLog("Invalid item type for sharpening.");
            return;
        }

        let successMessage = "";
        let alreadyEnhanced = false;

        // Apply enhancement based on type
        if (type === 'attack') {
            const currentAttack = item.stats.attack || 0;
            item.stats.attack = currentAttack + 1;
            successMessage = `Sharpened ${item.name}! Attack +1.`;
            if (!item.name.startsWith("Honed ") && !item.name.startsWith("Sharpened ")) {
                 item.name = `Sharpened ${item.name}`;
            } else if (item.name.startsWith("Honed ")) {
                item.name = item.name.replace("Honed", "Sharpened"); // Overwrite hone
            }
            item.description = item.description.replace(/Attack: \+\d+/, `Attack: +${item.stats.attack}`);
        } else if (type === 'speed') {
            const currentSpeed = (item.speed ?? this.game.player.defaultAttackSpeed);
            const newSpeed = Math.max(0.1, currentSpeed - 0.2);
            if (newSpeed === currentSpeed) {
                alreadyEnhanced = true;
                this.game.addLog(`Cannot hone ${item.name} further (minimum 0.1s speed).`);
            } else {
                item.speed = newSpeed;
                successMessage = `Honed ${item.name}! Speed -0.2s.`;
                 if (!item.name.startsWith("Honed ") && !item.name.startsWith("Sharpened ")) {
                     item.name = `Honed ${item.name}`;
                } else if (item.name.startsWith("Sharpened ")) {
                    item.name = item.name.replace("Sharpened", "Honed"); // Overwrite sharpen
                }
                 item.description = item.description.replace(/Speed: [\d.]+s/, `Speed: ${item.speed.toFixed(1)}s`);
                 if (!item.description.includes("Speed:")) { // Add speed if not present
                    item.description += `\nSpeed: ${item.speed.toFixed(1)}s`;
                 }
            }
        } else {
            this.game.addLog("Unknown enhancement type.");
            return;
        }

        if (alreadyEnhanced) return; // Stop if speed couldn't be improved

        item.value = Math.floor(item.value * 1.2); // Increase value for either enhancement
        
        // Add the *enhanced* item back to inventory
        if (!this.game.player.addItem(item)) {
            this.game.addLog(`Inventory full! Could not add enhanced ${item.name}.`);
            return;
        }
        
        this.game.addLog(successMessage);

        // Flash and proceed
        const sharpenArea = document.getElementById('sharpen-area');
        if (sharpenArea) {
            sharpenArea.classList.add('upgrade-success-flash');
            setTimeout(() => {
                sharpenArea.classList.remove('upgrade-success-flash');
                this.clearMainArea();
                this.game.proceedToNextRound();
            }, 500); 
        } else {
             this.clearMainArea();
             this.game.proceedToNextRound();
        }
    }

    showArmourerUI() {
        this.clearMainArea();
        
        const mainContent = document.getElementById('main-content');

        // Check for hammer
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p style="color: #ff4444; font-weight: bold;">Requires: Blacksmith Hammer</p>';
        
        const armourerArea = document.createElement('div');
        armourerArea.id = 'armourer-area';
        armourerArea.innerHTML = `
            <h3>Armourer Station</h3>
            ${hammerWarning}
            <p>Drag a piece of armor onto the station to enhance its defense (+1 Defense).</p>
        `;
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'armourer-container';
        
        const armorSlot = document.createElement('div');
        armorSlot.className = 'armourer-slot'; // Use class, not ID
        armorSlot.innerHTML = `
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drag armor here</div>
        `;
        
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
        leaveButton.onclick = function() { 
            this.game.addLog("You leave without using the Armourer's tools.");
            this.resetCraftingSlots(); // Reset slots on leave
            this.game.proceedToNextRound();
        }.bind(this);
        
        slotContainer.appendChild(armorSlot);
        armourerArea.appendChild(slotContainer);
        armourerArea.appendChild(previewArea);
        armourerArea.appendChild(enhanceButton);
        armourerArea.appendChild(leaveButton);
        
        mainContent.appendChild(armourerArea);

        // --- Add Drag and Drop Listeners ---
        const armourerSlot = armourerArea.querySelector('.armourer-slot'); // Find the slot element
        if (armourerSlot) {
            armourerSlot.addEventListener('dragover', (event) => {
                event.preventDefault(); // Allow drop
                const sourceIndex = this.draggedItemIndex;
                const item = this.draggedItem;
                if (sourceIndex === null || item === null) return;
                armourerSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
                if (item && item.type === 'armor') {
                    armourerSlot.classList.add('drag-over-valid');
                } else {
                    armourerSlot.classList.add('drag-over-invalid');
                }
            });

            armourerSlot.addEventListener('dragenter', (event) => {
                event.preventDefault();
            });

            armourerSlot.addEventListener('dragleave', (event) => {
                armourerSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
            });

            armourerSlot.addEventListener('drop', (event) => {
                event.preventDefault();
                armourerSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
                
                const sourceIndexStr = event.dataTransfer.getData('text/plain');
                if (sourceIndexStr === null || sourceIndexStr === undefined || sourceIndexStr === '') return;

                const sourceIndex = parseInt(sourceIndexStr, 10);
                const itemToDrop = this.game.player.inventory[sourceIndex]; 

                if (itemToDrop && itemToDrop.type === 'armor') {
                    if (armourerSlot.dataset.itemData) {
                        this.clearArmourerSlot(); 
                    }
                    const currentInventoryItem = this.game.player.inventory[sourceIndex]; 
                    if (!currentInventoryItem || currentInventoryItem.id !== itemToDrop.id) {
                         console.warn(`Item at index ${sourceIndex} changed or removed unexpectedly.`);
                         this.game.addLog("Action interrupted. Please try dragging the item again.");
                         this.renderInventory(); 
                         return;
                    }
                    const removedItem = this.game.player.removeItem(sourceIndex);
                    
                    armourerSlot.dataset.itemData = JSON.stringify(removedItem);
                    armourerSlot.dataset.originalIndex = sourceIndex;

                    armourerSlot.innerHTML = `
                        <div class="armourer-slot-label">Armor Slot</div>
                        <div class="armourer-slot-content">${removedItem.name}</div>
                    `;
                    armourerSlot.style.cursor = 'pointer';
                    armourerSlot.onclick = () => {
                        if (armourerSlot.dataset.itemData) { 
                            this.clearArmourerSlot();
                        }
                    };
        
                    // Update preview (using the local previewArea reference)
                    const newDefense = (removedItem.stats.defense || 0) + 1;
                    previewArea.textContent = `${removedItem.name} → Defense: ${(removedItem.stats.defense || 0)} → ${newDefense}`;
                    
                    // Enable enhance button (check hammer)
                    const hammerCheck = this.game.player.inventory.some(i => i && i.id === 'blacksmith_hammer');
                    enhanceButton.disabled = !hammerCheck;
                    
                    this.renderInventory(); 

                    armourerSlot.classList.add('crafting-slot-filled'); // Add visual class
                } else {
                    this.game.addLog("You can only enhance armor.");
                }
            });
        } // End if (armourerSlot)
    }

    clearArmourerSlot() {
        console.log("Clearing armourer slot");
        // const slotElement = document.getElementById('armourer-slot'); // Old way using non-existent ID
        const slotElement = document.querySelector('#armourer-area .armourer-slot'); // Use querySelector

        if (!slotElement) {
            // console.error("Armourer slot element not found using ID armourer-slot!"); 
            console.error("Armourer slot element not found using querySelector!"); // Updated error message
            this.game.addLog("Error: UI element missing for armourer slot.");
            return;
        }

        // --- Retrieve item data and add back to inventory ---
        const itemDataString = slotElement.dataset.itemData;
        if (itemDataString) {
            try {
                const item = JSON.parse(itemDataString);
                if (this.game.player.addItem(item)) {
                    this.game.addLog(`Returned ${item.name} to inventory.`);
                } else {
                    this.game.addLog(`Inventory full! Cannot return ${item.name}. Item lost.`);
                }
            } catch (error) {
                console.error("Error parsing item data from armourer slot:", error);
                this.game.addLog("Error clearing slot. Item data corrupted?");
                // Don't return item if parse failed, but still clear visually
            }
        }

        slotElement.innerHTML = `
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drop armor here</div>
        `;
        slotElement.style.cursor = 'default'; // Reset cursor
        slotElement.onclick = null; // Remove click listener
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex; // Clear original index too

        slotElement.classList.remove('crafting-slot-filled'); // Remove visual class

        // Reset and disable the button
        const enhanceButton = document.getElementById('armourer-button');
        if (enhanceButton) { 
            enhanceButton.disabled = true;
            enhanceButton.textContent = 'Enhance Armor (+1 Defense)';
        } else {
            console.error("Armourer button element not found!");
        }

        // Reset preview text
        const previewArea = document.getElementById('armourer-preview');
        if (previewArea) {
            previewArea.textContent = 'Select armor to preview enhancement';
        }

        this.renderInventory(); // Update inventory display
    }

    handleArmourEnhancement() {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to enhance armor!");
            return; // Prevent enhancing without the hammer
        }

        const slot = document.querySelector('#armourer-area .armourer-slot'); // More specific selector
        
        const itemDataString = slot?.dataset.itemData;
        if (!itemDataString) {
            this.game.addLog("No item placed on the station.");
            return;
        }

        let item;
        try {
            item = JSON.parse(itemDataString);
        } catch (error) {
            console.error("Error parsing item data in handleArmourEnhancement:", error);
            this.game.addLog("Error: Could not retrieve item data for enhancement.");
            return;
        }

        if (!item || item.type !== 'armor') {
            this.game.addLog("Invalid item type for enhancement."); // Should not happen if drop worked
            return;
        }
        
        // Enhance the item data
        item.stats.defense = (item.stats.defense || 0) + 1; // Ensure defense exists
        // Update name only if not already sharpened/reinforced
        if (!item.name.startsWith("Sharpened ") && !item.name.startsWith("Reinforced ")) {
            item.name = `Reinforced ${item.name}`;
        }
        item.description = item.description.replace(/Defense: \+\d+/, `Defense: +${item.stats.defense}`);
        item.value = Math.floor(item.value * 1.2); // Increase value
        
        // Add the *enhanced* item back to inventory
        if (!this.game.player.addItem(item)) {
            this.game.addLog(`Inventory full! Could not add enhanced ${item.name}.`);
            // Don't clear the slot if we couldn't add the new item
            return;
        }
        
        this.game.addLog(`Enhanced ${item.name}! Defense increased by 1.`);

        // Add flash effect
        const armourerArea = document.getElementById('armourer-area');
        if (armourerArea) {
            armourerArea.classList.add('upgrade-success-flash');
            // Use timeout to remove flash AND proceed
            setTimeout(() => {
                armourerArea.classList.remove('upgrade-success-flash'); // Use existing armourerArea
                this.clearMainArea();
                this.game.proceedToNextRound();
            }, 500); // Match animation duration
        } else {
            // If area not found, proceed immediately
            this.clearMainArea();
            this.game.proceedToNextRound();
        }
    }
}