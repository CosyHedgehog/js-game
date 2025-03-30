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

    showLootUI(loot) {
        this.clearMainArea();

        if (!this.lootArea) {
            console.error("UI Error: Cannot show loot UI, lootArea element missing.");
            return;
        }

        // Convert gold into a loot item format for consistent display
        const allDisplayableLoot = [];
        if (loot.gold > 0) {
            allDisplayableLoot.push({
                id: 'gold', // Use 'gold' as a special ID
                name: `${loot.gold} Gold`,
                description: "Precious golden coins.",
                type: "gold",
                amount: loot.gold,
                looted: false // Gold isn't 'looted' in the same way as items initially
            });
        }
        if (loot.items) {
            // Only show unlooted items
            allDisplayableLoot.push(...loot.items.filter(item => !item.looted));
        }

        // Add description box to the layout
        this.lootArea.innerHTML = `
            <h3>Loot Found!</h3>
            <div class="loot-display-area"> 
                <div id="loot-items" class="loot-items-container">
                    <!-- Items will be added here -->
                </div>
                <div id="loot-item-description" class="item-description">
                    Click an item to see its description.
                </div>
            </div>
            <div class="loot-buttons">
                ${allDisplayableLoot.length > 0 ? 
                    '<button id="loot-take-all-button">Take All</button>' : ''
                }
                <button id="loot-continue-button">Continue</button>
            </div>
        `;

        // Display all loot items (including gold) in a consistent format
        const lootItemsContainer = this.lootArea.querySelector('#loot-items');
        const descriptionBox = this.lootArea.querySelector('#loot-item-description'); // Cache description box

        if (lootItemsContainer && descriptionBox) {
            if (allDisplayableLoot.length === 0) {
                lootItemsContainer.innerHTML = '<p class="loot-empty-message">Nothing left to take.</p>';
                descriptionBox.textContent = ''; // Clear description if nothing to show
            }

            allDisplayableLoot.forEach((item, displayIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('loot-item');
                // Store the original index if it's a real item, or -1 for gold
                const originalItemIndex = item.type === 'gold' ? -1 : loot.items.findIndex(lootItem => lootItem === item);
                itemDiv.dataset.originalIndex = originalItemIndex; 
                itemDiv.dataset.type = item.type || 'item';
                itemDiv.dataset.displayIndex = displayIndex; // Keep track of the displayed order index
                
                itemDiv.innerHTML = `
                    <div class="loot-item-info">
                        <span class="loot-item-icon">${item.spritePath ? '' : 'I'}</span>
                        <span class="loot-item-name">${item.name}</span>
                    </div>
                    <button class="loot-item-button">Take</button>
                `;
                
                // Add tooltip functionality (on name span)
                const nameSpan = itemDiv.querySelector('.loot-item-name');
                nameSpan.addEventListener('mouseenter', (e) => this.showTooltip(item.description || 'No description', this.itemTooltip, e));
                nameSpan.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));

                // Add take button listener
                const takeButton = itemDiv.querySelector('.loot-item-button');
                takeButton.onclick = (e) => {
                    e.stopPropagation(); // Prevent triggering the description update
                    if (item.type === 'gold') {
                        this.game.handleIndividualLoot('gold');
                    } else {
                        // Use the original index to find the item in game.pendingLoot.items
                        this.game.handleIndividualLoot('item', originalItemIndex); 
                    }
                };

                // --- Add click listener for description ---
                itemDiv.addEventListener('click', () => {
                    // Remove selected class from all other items
                    lootItemsContainer.querySelectorAll('.loot-item').forEach(div => div.classList.remove('selected'));
                    // Add selected class to this item
                    itemDiv.classList.add('selected');
                    // Update description box
                    descriptionBox.textContent = item.description || 'No description available.';
                });
                // ----------------------------------------

                lootItemsContainer.appendChild(itemDiv);
            });

            // --- Auto-select first item --- 
            if (allDisplayableLoot.length > 0) {
                const firstItemDiv = lootItemsContainer.querySelector('.loot-item');
                if (firstItemDiv) {
                    firstItemDiv.classList.add('selected');
                    descriptionBox.textContent = allDisplayableLoot[0].description || 'No description available.';
                }
            }
            // --- End auto-select ---
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

    showShopUI(items, canReroll) {
        this.clearMainArea();
        const shopArea = document.getElementById('shop-area');
        shopArea.classList.remove('hidden');

        // Create shop content with updated structure and selling info
        let shopContent = `
            <h3>Shop</h3>
            <p class="shop-info">Right-click inventory items to sell them.</p>
            <div class="shop-content">
                <div class="shop-items-container">
        `;

        if (items && items.length > 0) {
            items.forEach((item, index) => {
                const isBought = item.bought === true;
                const canAfford = this.game.player.gold >= item.buyPrice;
                shopContent += `
                    <div class="shop-item ${isBought ? 'item-bought' : ''}" data-index="${index}">
                        <div class="shop-item-info">
                            <div class="shop-item-name">${item.name}</div>
                            <div class="shop-item-price">${item.buyPrice} gold</div>
                        </div>
                        <button class="shop-item-button" data-index="${index}" 
                                ${isBought || !canAfford ? 'disabled' : ''}>
                            ${isBought ? 'Bought' : 'Buy'}
                        </button>
                    </div>
                `;
            });
        } else {
            shopContent += '<p class="shop-empty-message">No items available.</p>';
        }

        shopContent += `
                </div>
                <div class="item-description"></div>
            </div>
            <div class="shop-buttons">
                <button id="shop-reroll-button" ${!canReroll || this.game.player.gold < SHOP_REROLL_COST ? 'disabled' : ''}>
                    Reroll (${SHOP_REROLL_COST} Gold)
                </button>
                <button id="shop-leave-button">Leave Shop</button>
            </div>
        `;

        shopArea.innerHTML = shopContent;

        // Add event listeners
        const rerollButton = document.getElementById('shop-reroll-button');
        const leaveButton = document.getElementById('shop-leave-button');
        
        if (rerollButton) {
            rerollButton.onclick = () => handleRerollShop(this.game, this);  // Use the function from encounters.js
        }
        if (leaveButton) {
            leaveButton.onclick = () => {
                this.clearMainArea();
                this.game.proceedToNextRound();
            }
        }

        // Add click listeners to buy buttons
        const buyButtons = document.querySelectorAll('.shop-item-button');
        buyButtons.forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.dataset.index);
                handleBuyItem(this.game, this, index);  // Use the function from encounters.js
            };
        });

        // Add click listeners to shop items for descriptions
        const shopItems = document.querySelectorAll('.shop-item');
        shopItems.forEach((shopItem, index) => {
            shopItem.addEventListener('click', () => {
                // Remove selected class from all items
                shopItems.forEach(item => item.classList.remove('selected'));
                // Add selected class to clicked item
                shopItem.classList.add('selected');
                // Update description
                const descriptionArea = document.querySelector('.item-description');
                if (descriptionArea && items[index]) {
                    descriptionArea.textContent = items[index].description || 'No description available.';
                }
            });
        });

        // --- Auto-select first item --- 
        if (items && items.length > 0) {
            const firstShopItem = shopArea.querySelector('.shop-item[data-index="0"]');
            const descriptionArea = shopArea.querySelector('.item-description');
            if (firstShopItem && descriptionArea) {
                firstShopItem.classList.add('selected');
                descriptionArea.textContent = items[0].description || 'No description available.';
            }
        }
        // --- End auto-select ---
    }


    showRestUI(message) {
        const restArea = document.getElementById('rest-area');
        restArea.classList.remove('hidden');
        // Add a container div with a specific class for styling
        restArea.innerHTML = `
            <div class="rest-campfire-container">
                 <div class="rest-campfire-icon">&#128150;</div> 
                 <h3>A Moment's Respite</h3>
                 <p class="rest-message">${message.replace(/\\n/g, '<br>')}</p> 
                 <button id="rest-continue-button">Continue Journey</button>
            </div>
        `;
        
        const continueButton = document.getElementById('rest-continue-button');
        continueButton.onclick = () => {
            restArea.classList.add('hidden');
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

    showLog() {
        // If log is already visible, hide it instead
        if (!this.outputLogArea.classList.contains('hidden')) {
            this.hideLog();
            return;
        }

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
                    // Note: If clearForgeSlot fails (e.g., inventory full), the drop might still proceed
                    // depending on desired behavior. For now, we assume clearForgeSlot handles messaging.
                }
                // -----------------------------------------------------

                // --- Remove NEW item from inventory --- 
                // Make sure item still exists in inventory (clearForgeSlot might have rearranged things)
                const currentInventoryItem = this.game.player.inventory[parsedIndex]; 
                if (!currentInventoryItem || currentInventoryItem.id !== item.id) {
                     console.warn(`Item at index ${parsedIndex} changed or removed unexpectedly.`);
                     this.game.addLog("Action interrupted. Please try dragging the item again.");
                     this.renderInventory(); // Refresh inventory view
                     return;
                }
                const removedItem = this.game.player.removeItem(parsedIndex);
                // --- Store removed item data in the slot --- 
                // e.target.dataset.itemData = JSON.stringify(removedItem); // Old way
                slot.dataset.itemData = JSON.stringify(removedItem); // Store on the slot div itself
                slot.dataset.originalIndex = parsedIndex; // Store original index too
                // -------------------------------------------

                console.log(`Dropped item ${removedItem.name} into forge slot ${targetSlotNum}`);

                // Display item in the slot with a clear button
                slot.innerHTML = `
                    <span>${removedItem.name}</span>
                    <button class="clear-slot-button" data-slot-num="${targetSlotNum}">(x)</button>
                `;
                slot.querySelector('.clear-slot-button').addEventListener('click', () => this.clearForgeSlot(targetSlotNum));

                // Update the forge button state
                this.updateForgeButton();

                // --- NEW LOGIC: Re-render inventory to show removal ---
                this.renderInventory(); 
                // Mark inventory item as in-use
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
            <p>Drag a weapon onto the stone to enhance its attack power (+1 Attack).</p> <!-- Updated text -->
        `;
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'sharpen-container';
        
        const weaponSlot = document.createElement('div');
        weaponSlot.className = 'sharpen-slot';
        weaponSlot.innerHTML = `
            <div class="sharpen-slot-label">Weapon Slot</div>
            <div class="sharpen-slot-content">Drag weapon here</div> <!-- Updated text -->
        `;
        
        const previewArea = document.createElement('div');
        previewArea.id = 'sharpen-preview';
        previewArea.textContent = 'Select a weapon to preview enhancement';
        
        const sharpenButton = document.createElement('button');
        sharpenButton.id = 'sharpen-button';
        sharpenButton.textContent = 'Enhance Weapon (+1 Attack)';
        sharpenButton.disabled = true;
        sharpenButton.onclick = () => this.handleSharpenItem();
        
        const leaveButton = document.createElement('button');
        leaveButton.id = 'sharpen-leave-button';
        leaveButton.textContent = 'Leave';
        leaveButton.onclick = function() { // Use function and bind 'this'
            this.game.addLog("You leave without using the sharpening stone.");
            console.log('Sharpen Leave Button this:', this); // Keep log for now
            this.resetCraftingSlots(); // Reset slots on leave
            this.game.proceedToNextRound();
        }.bind(this);
        
        slotContainer.appendChild(weaponSlot);
        sharpenArea.appendChild(slotContainer);
        sharpenArea.appendChild(previewArea);
        sharpenArea.appendChild(sharpenButton);
        sharpenArea.appendChild(leaveButton);
        
        mainContent.appendChild(sharpenArea);

        // --- Add Drag and Drop Listeners ---
        const sharpenSlot = sharpenArea.querySelector('.sharpen-slot'); 
        if (sharpenSlot) {
            sharpenSlot.addEventListener('dragover', (event) => {
                event.preventDefault(); // Allow drop
                // --- MODIFIED: Use stored drag info ---
                const sourceIndex = this.draggedItemIndex;
                const item = this.draggedItem;
                // --- End MODIFIED ---

                if (sourceIndex === null || item === null) return; // No item being dragged

                // --- DEBUGGING (Updated) ---
                console.log(`Drag Over Sharpen Slot: Stored Index = ${sourceIndex}, Item Type = ${item?.type}, Expected Class = ${item && item.type === 'weapon' ? 'drag-over-valid' : 'drag-over-invalid'}`);
                // --- END DEBUGGING ---

                // Ensure previous classes are removed before adding new one
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
                
                // --- Drop event still uses getData (reliable here) ---
                const sourceIndexStr = event.dataTransfer.getData('text/plain');
                if (sourceIndexStr === null || sourceIndexStr === undefined || sourceIndexStr === '') {
                     console.warn("Sharpen drop event received invalid sourceIndexStr:", sourceIndexStr);
                     return; 
                }
                // --- End ---

                const sourceIndex = parseInt(sourceIndexStr, 10);
                const item = this.game.player.inventory[sourceIndex]; // Get item fresh

                if (item && item.type === 'weapon') { // Check item existence
                    // REMOVED: this.selectSharpenItem(item, sourceIndex);
                    // --- Inline selectSharpenItem logic --- 
                    this.clearSharpenSlot(); // Clear current slot first
                    const slot = sharpenArea.querySelector('.sharpen-slot'); 
                    const content = slot.querySelector('.sharpen-slot-content');
                    // content.textContent = item.name; // CHANGED BELOW
                    // Add item name and clear button
                    content.innerHTML = `
                        ${item.name} 
                        <button class="clear-craft-slot-button" data-slot-num="sharp"> (x)</button>
                    `;
                    // Add listener to the new clear button
                    content.querySelector('.clear-craft-slot-button').onclick = (e) => {
                        e.stopPropagation(); 
                        this.clearSharpenSlot();
                    };

                    slot.dataset.itemIndex = sourceIndex;
                    content.textContent = item.name; 
        
        // Update preview
        const previewArea = document.getElementById('sharpen-preview');
        const newAttack = (item.stats.attack || 0) + 1;
        previewArea.textContent = `${item.name} → Attack: ${item.stats.attack} → ${newAttack}`;
        
        // Enable sharpen button
        document.getElementById('sharpen-button').disabled = false;
        
                    // Mark inventory item as in-use
                    this.updateInventoryInUseStyles();
                    // --------------------------------------
                } else {
                    this.game.addLog("You can only sharpen weapons.");
                }
            });
        }
        // --- End Drag and Drop Listeners ---
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
            <p>Drag a piece of armor onto the station to enhance its defense (+1 Defense).</p> <!-- Updated text -->
        `;
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'armourer-container';
        
        const armorSlot = document.createElement('div');
        armorSlot.className = 'armourer-slot';
        armorSlot.innerHTML = `
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drag armor here</div> <!-- Updated text -->
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
        leaveButton.onclick = function() { // Use function and bind 'this'
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
        const armourerSlot = armourerArea.querySelector('.armourer-slot');
        if (armourerSlot) {
            armourerSlot.addEventListener('dragover', (event) => {
                event.preventDefault(); // Allow drop
                 // --- MODIFIED: Use stored drag info ---
                const sourceIndex = this.draggedItemIndex;
                const item = this.draggedItem;
                // --- End MODIFIED ---

                if (sourceIndex === null || item === null) return; // No item being dragged

                // --- DEBUGGING (Updated) ---
                console.log(`Drag Over Armourer Slot: Stored Index = ${sourceIndex}, Item Type = ${item?.type}, Expected Class = ${item && item.type === 'armor' ? 'drag-over-valid' : 'drag-over-invalid'}`);
                // --- END DEBUGGING ---

                // Ensure previous classes are removed before adding new one
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
                
                 // --- Drop event still uses getData (reliable here) ---
                 const sourceIndexStr = event.dataTransfer.getData('text/plain');
                 if (sourceIndexStr === null || sourceIndexStr === undefined || sourceIndexStr === '') {
                     console.warn("Armourer drop event received invalid sourceIndexStr:", sourceIndexStr);
                     return; 
                 }
                 // --- End ---

                const sourceIndex = parseInt(sourceIndexStr, 10);
                const item = this.game.player.inventory[sourceIndex]; // Get item fresh

                if (item && item.type === 'armor') { // Check item existence
                    // REMOVED: this.selectArmourItem(item, sourceIndex);
                    // --- Inline selectArmourItem logic --- 
                    this.clearArmourerSlot(); // Clear current slot first
                    const slot = armourerArea.querySelector('.armourer-slot');
                    const content = slot.querySelector('.armourer-slot-content');
                    // content.textContent = item.name; // CHANGED BELOW
                    // Add item name and clear button
                    content.innerHTML = `
                        ${item.name} 
                        <button class="clear-craft-slot-button" data-slot-num="armour"> (x)</button>
                    `;
                    // Add listener to the new clear button
                    content.querySelector('.clear-craft-slot-button').onclick = (e) => {
                        e.stopPropagation(); 
                        this.clearArmourerSlot();
                    };

                    slot.dataset.itemIndex = sourceIndex;
                    content.textContent = item.name;
        
        const previewArea = document.getElementById('armourer-preview');
        const newDefense = (item.stats.defense || 0) + 1;
        previewArea.textContent = `${item.name} → Defense: ${item.stats.defense} → ${newDefense}`;
        
                    // Enable enhance button only if player has hammer
        const hasHammer = this.game.player.inventory.some(i => i && i.id === 'blacksmith_hammer');
        document.getElementById('armourer-button').disabled = !hasHammer;
        
                    // Mark inventory item as in-use
                    this.updateInventoryInUseStyles();
                    // -------------------------------------
                } else {
                    this.game.addLog("You can only enhance armor.");
                }
            });
        }
         // --- End Drag and Drop Listeners ---
    }

    showAlchemistUI(items) {
        const mainContent = document.getElementById('main-content');
        const alchemistArea = document.createElement('div');
        alchemistArea.id = 'alchemist-area';
        alchemistArea.innerHTML = `
            <h3>Alchemist's Shop</h3>
            <div class="shop-items-container">
                ${items.map((item, index) => {
                    const isBought = item.bought === true;
                    const canAfford = this.game.player.gold >= item.buyPrice;
                    return `
                    <div class="shop-item ${isBought ? 'item-bought' : ''}" data-item-id="${item.id}">
                        <div class="shop-item-info">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-price">${item.buyPrice} gold</span>
                        </div>
                        <button class="shop-item-button" ${isBought || !canAfford ? 'disabled' : ''}>
                            ${isBought ? 'Bought' : 'Buy'}
                        </button>
                    </div>
                `}).join('')}
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

        // --- Auto-select first item --- 
        if (items && items.length > 0) {
            const firstItemDiv = alchemistArea.querySelector('.shop-item'); // First shop item element
            const descriptionBox = alchemistArea.querySelector('#potion-description');
            if (firstItemDiv && descriptionBox) {
                firstItemDiv.classList.add('selected');
                descriptionBox.textContent = items[0].description || 'No description available.';
            }
        }
        // --- End auto-select ---
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
        if (!item || item.bought) return; // Return if item not found or already bought

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

        // Mark the item as bought instead of removing it
        this.game.currentShopItems[itemIndex].bought = true;

        // --- Targeted UI Update with Scroll Preservation ---
        const alchemistArea = document.getElementById('alchemist-area'); 
        let scrollPosition = 0;
        let itemsContainer = null;

        if (alchemistArea) {
            itemsContainer = alchemistArea.querySelector('.shop-items-container');
            if (itemsContainer) {
                scrollPosition = itemsContainer.scrollTop; // Save scroll position
            }
            
            const shopItemDiv = alchemistArea.querySelector(`.shop-item[data-item-id="${item.id}"]`);
            if (shopItemDiv) {
                const buyButton = shopItemDiv.querySelector('.shop-item-button');
                if (buyButton) {
                    buyButton.textContent = 'Bought';
                    buyButton.disabled = true;
                }
                shopItemDiv.classList.add('item-bought'); 
                
                // updateAlchemistAffordability will be called after restoring scroll
            } else {
                console.warn("Alchemist item div not found for targeted update.");
                // Fallback ONLY if absolutely necessary
                // this.showAlchemistUI(this.game.currentShopItems);
            }
            
            if (itemsContainer) {
                itemsContainer.scrollTop = scrollPosition; // Restore scroll position
            }
        } else {
            console.error("Alchemist area not found for update.");
            // Fallback ONLY if absolutely necessary
            // this.showAlchemistUI(this.game.currentShopItems);
        }
        // --- End Targeted UI Update ---

        // Update affordability after restoring scroll
        if (alchemistArea) {
            this.updateAlchemistAffordability(); // Call the helper function
        }

        this.updatePlayerStats();
        this.renderInventory();
        
        // No need to call showAlchemistUI again unless a fallback is needed
    }

    // Helper function to update alchemist button states
    updateAlchemistAffordability() {
        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return;

        const shopItems = alchemistArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const itemId = shopItemDiv.dataset.itemId;
            // Find the corresponding item in the game data (assuming currentShopItems is accurate)
            const itemData = this.game.currentShopItems.find(item => item.id === itemId && !item.bought);
            const buyButton = shopItemDiv.querySelector('.shop-item-button');
            
            if (itemData && buyButton) {
                const canAfford = this.game.player.gold >= itemData.buyPrice;
                buyButton.disabled = !canAfford;
            }
        });
    }

    handleAlchemistLeave() {
        if (this.game) {
            this.clearMainArea();
            this.game.proceedToNextRound();
        }
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

    // Add new method
    showStartingPackSelection() {
        this.clearMainArea();
        const mainContent = document.getElementById('main-content');
        
        const container = document.createElement('div');
        container.id = 'starting-pack-area';
        container.className = 'starting-pack-selection';
        
        container.innerHTML = `
            <h3>Choose Your Starting Equipment</h3>
            
            <div class="pack-options-container">
                <div class="pack-option" id="warrior-pack">
                    <h4>Warrior Pack</h4>
                    <p>A defensive focused loadout:</p>
                    <ul>
                        <li data-item-id="wooden_sword">Wooden Sword</li>
                        <li data-item-id="leather_helm">Leather Helm</li>
                        <li data-item-id="leather_legs">Leather Legs</li>
                        <li data-item-id="bread">Bread (2)</li>
                    </ul>
                    <button onclick="game.selectStartingPack('warrior')">Choose Warrior</button>
                </div>
                
                <div class="pack-option" id="fisher-pack">
                    <h4>Fisher Pack</h4>
                    <p>A survival focused loadout:</p>
                    <ul>
                        <li data-item-id="rusty_sword">Rusty Sword</li>
                        <li data-item-id="leather_helm">Leather Helm</li>
                        <li data-item-id="fishing_rod">Fishing Rod</li>
                        <li data-item-id="large_fish">Large Fish (4)</li>
                    </ul>
                    <button onclick="game.selectStartingPack('fisher')">Choose Fisher</button>
                </div>

                <div class="pack-option" id="blacksmith-pack">
                    <h4>Blacksmith Pack</h4>
                    <p>A crafting focused loadout:</p>
                    <ul>
                        <li data-item-id="rusty_sword">Rusty Sword</li>
                        <li data-item-id="blacksmith_hammer">Blacksmith Hammer</li>
                        <li data-item-id="bread">Bread</li>
                        <li data-item-id="small_fish">Small Fish</li>
                    </ul>
                    <button onclick="game.selectStartingPack('blacksmith')">Choose Blacksmith</button>
                </div>
            </div>
            <div class="pack-item-description">
                Click on an item to see its description
            </div>
        `;
        
        mainContent.appendChild(container);
        this.switchScreen('game-screen');

        // Add click handlers for items
        const items = container.querySelectorAll('li[data-item-id]');
        const descriptionBox = container.querySelector('.pack-item-description');

        items.forEach(item => {
            item.addEventListener('click', () => {
                // Remove selected class from all items
                items.forEach(i => i.classList.remove('selected'));
                // Add selected class to clicked item
                item.classList.add('selected');
                
                const itemId = item.getAttribute('data-item-id');
                const itemData = ITEMS[itemId];
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                }
            });
        });
    }

    showTrapUI() {
        const trapArea = document.getElementById('trap-area');
        // hideAllAreas(); // Ensure other areas are hidden
        trapArea.classList.remove('hidden');
        trapArea.innerHTML = `
            <h3>Suspicious Area</h3>
            <button id="disarm-trap-button">Attempt Disarm</button>
            <button id="skip-trap-button">Skip</button>
            <div id="trap-result-message" class="message"></div>
        `;

        // Add event listeners after generating the buttons
        const disarmButton = document.getElementById('disarm-trap-button');
        const skipButton = document.getElementById('skip-trap-button');

        if (disarmButton) {
            disarmButton.addEventListener('click', handleDisarmAttempt);
        }
        if (skipButton) {
            skipButton.addEventListener('click', handleSkipTrap);
        }
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

        // Clear stored data
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

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
    // --- End Reset All Crafting Slots ---

    // --- Restore updateForgeButton --- 
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
                forgePreview.classList.add('hidden');
            }
        } else {
            // If not canForge or items failed to parse, disable and hide
            forgeButton.disabled = true;
            forgePreview.classList.add('hidden');
        }
    }
    // --- End Restore updateForgeButton ---

    // --- Restore previewForgedItem --- 
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

        // Need value calculation
        forgedItem.value = Math.floor((item1.value + item2.value) * 1.5);

        return forgedItem;
    }
    // --- End Restore previewForgedItem ---

    // --- Restore handleForgeItems ---
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
        // -------- End Fix --------
        
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

        // --- Clear forge slots AFTER successfully adding the new item --- 
        this.clearForgeSlot(1); // Use the clear function (this removes itemData from slot)
        this.clearForgeSlot(2); // Use the clear function
        // --- End Clearing --- 
        
        // Update UI
        this.game.addLog(`The Blacksmith combines your ${item1.name} and ${item2.name} into a ${forgedItem.name}!`);
        // Inventory is already updated by addItem and clearForgeSlot
        // this.renderInventory(); // No need to render again here
    }
    // --- End Restore handleForgeItems ---

    // --- Restore clearSharpenSlot ---
    clearSharpenSlot() {
        console.log("Clearing sharpen slot");
        // --- MODIFIED: Get element by ID directly ---
        const slotElement = document.getElementById('sharpen-slot'); 
        // const slotElement = this.sharpenSlot; // Old way

        if (!slotElement) {
            console.error("Sharpen slot element not found using ID sharpen-slot!"); // Updated error message
            this.game.addLog("Error: UI element missing for sharpen slot.");
            return;
        }

        // --- NEW: Retrieve item data and add back to inventory ---
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
                return;
            }
        } else {
            console.warn("No item data found in sharpen slot to return.");
        }
        // ---------------------------------------------------------

        // Clear visual content and stored data
        slotElement.innerHTML = `
            <div class="sharpen-slot-label">Weapon Slot</div>
            <div class="sharpen-slot-content">Drop weapon here</div>
        `;
        delete slotElement.dataset.itemData;

        // Reset and disable the button
        // Ensure sharpenButton is cached correctly before accessing
        if (this.sharpenButton) { 
            this.sharpenButton.disabled = true;
            this.sharpenButton.textContent = 'Sharpen';
        } else {
            console.error("Sharpen button reference is missing in UI cache!");
        }
        
        this.renderInventory(); // Update inventory display
    }
    // --- End Restore clearSharpenSlot ---

    // --- Restore handleSharpenItem ---
    handleSharpenItem() {
        const slot = document.querySelector('.sharpen-slot');
        const itemIndex = parseInt(slot.dataset.itemIndex);
        const item = this.game.player.inventory[itemIndex];
        
        if (!item || item.type !== 'weapon') {
            this.game.addLog("Invalid item selected.");
            return;
        }
        
        // Enhance the weapon
        item.stats.attack = (item.stats.attack || 0) + 1; // Ensure attack exists
        // Update name only if not already sharpened/reinforced
        if (!item.name.startsWith("Sharpened ") && !item.name.startsWith("Reinforced ")) {
             item.name = `Sharpened ${item.name}`;
        }
        item.description = item.description.replace(/Attack: \+\d+/, `Attack: +${item.stats.attack}`);
        item.value = Math.floor(item.value * 1.2); // Increase value
        
        this.game.addLog(`Enhanced ${item.name}! Attack power increased by 1.`);
        this.renderInventory();
        
        // Proceed to next round
        this.clearMainArea();
        this.game.proceedToNextRound();
    }
    // --- End Restore handleSharpenItem ---

    // --- Restore clearArmourerSlot ---
    clearArmourerSlot() {
        console.log("Clearing armourer slot");
        // --- MODIFIED: Get element by ID directly ---
        const slotElement = document.getElementById('armourer-slot');
        // const slotElement = this.armourerSlot; // Old way

        if (!slotElement) {
            console.error("Armourer slot element not found using ID armourer-slot!"); // Updated error message
            this.game.addLog("Error: UI element missing for armourer slot.");
            return;
        }

        // --- NEW: Retrieve item data and add back to inventory ---
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
                return;
            }
        } else {
            console.warn("No item data found in armourer slot to return.");
        }
        // ---------------------------------------------------------

        // Clear visual content and stored data
        slotElement.innerHTML = `
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drop armor here</div>
        `;
        delete slotElement.dataset.itemData;

        // Reset and disable the button
        // Ensure armourerButton is cached correctly before accessing
        if (this.armourerButton) { 
            this.armourerButton.disabled = true;
            this.armourerButton.textContent = 'Enhance Armor';
        } else {
            console.error("Armourer button reference is missing in UI cache!");
        }

        this.renderInventory(); // Update inventory display
    }
    // --- End Restore clearArmourerSlot ---

    // --- Restore handleArmourEnhancement ---
    handleArmourEnhancement() {
        // Add check for blacksmith hammer before enhancing
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to enhance armor!");
            return; // Prevent enhancing without the hammer
        }

        const slot = document.querySelector('.armourer-slot');
        const itemIndex = parseInt(slot.dataset.itemIndex);
        const item = this.game.player.inventory[itemIndex];
        
        if (!item || item.type !== 'armor') {
            this.game.addLog("Invalid item selected.");
            return;
        }
        
        item.stats.defense = (item.stats.defense || 0) + 1; // Ensure defense exists
        // Update name only if not already sharpened/reinforced
        if (!item.name.startsWith("Sharpened ") && !item.name.startsWith("Reinforced ")) {
            item.name = `Reinforced ${item.name}`;
        }
        item.description = item.description.replace(/Defense: \+\d+/, `Defense: +${item.stats.defense}`);
        item.value = Math.floor(item.value * 1.2); // Increase value

        
        this.game.addLog(`Enhanced ${item.name}! Defense increased by 1.`);
        this.renderInventory();
        
        this.clearMainArea();
        this.game.proceedToNextRound();
    }
    // --- End Restore handleArmourEnhancement ---
}