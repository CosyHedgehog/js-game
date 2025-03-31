class Blacksmith {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    handle() {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to use the forge!");
            this.game.proceedToNextRound();
            return;
        }
        this.game.state = 'blacksmith';
        this.game.addLog("You find a Blacksmith's forge. The smith offers to combine similar items.");
        this.showBlacksmithUI();
    }

    showBlacksmithUI() {
        this.ui.clearMainArea();

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
                const sourceIndexStr = this.ui.draggedItemIndex;
                const sourceIndex = parseInt(sourceIndexStr);
                const item = this.game.player.inventory[sourceIndex];
                const targetSlotNum = index + 1;
                console.log(item);

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

                const sourceIndexStr = this.ui.draggedItemIndex;
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
                    this.ui.renderInventory(); // Refresh inventory view
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
                this.ui.renderInventory();
                this.ui.updateInventoryInUseStyles();
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
        leaveButton.onclick = function () {
            this.game.addLog("You leave the Blacksmith's forge.");
            this.clearForgeSlot(1);
            this.clearForgeSlot(2);
            this.ui.updateInventoryInUseStyles();
            this.game.proceedToNextRound();
        }.bind(this); // Explicitly bind 'this'
    }


    updateForgeButton() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const forgePreview = document.getElementById('forge-preview');

        // Ensure elements exist before accessing properties
        if (!slot1 || !slot2 || !forgeButton || !forgePreview) {
            console.warn("updateForgeButton: One or more required elements not found.");
            if (forgeButton) forgeButton.disabled = true;
            if (forgePreview) forgePreview.classList.add('hidden');
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
        this.ui.renderInventory(); // Render inventory (shows new item, removes old styles)
        this.ui.updateInventoryInUseStyles(); // Update inventory styles

        // Add flash effect
        const blacksmithArea = document.getElementById('blacksmith-area');
        if (blacksmithArea) {
            blacksmithArea.classList.add('upgrade-success-flash');
            setTimeout(() => blacksmithArea.classList.remove('upgrade-success-flash'), 500); // Duration matches animation
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
        slotElement.style.cursor = 'default'; // Reset cursor
        slotElement.onclick = null; // Remove click listener

        // Clear stored data
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled'); // Remove visual class

        this.updateForgeButton(); // Update button state
        this.ui.renderInventory(); // Update inventory visuals
        this.ui.updateInventoryInUseStyles(); // Update styles for inventory items
    }

    isValidForgeItem(item, sourceIndex, targetSlotNum) {
        if (!item || (item.type !== 'weapon' && item.type !== 'armor')) {
            console.log("Invalid item type for forge");
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
}
