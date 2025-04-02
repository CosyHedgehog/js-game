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
        this.ui.renderInventory();

        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p style="color: #ff4444; font-weight: bold;">Requires: Blacksmith Hammer</p>';

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

        document.getElementById('main-content').appendChild(blacksmithArea);
        blacksmithArea.classList.remove('hidden');

        const forgeSlot1 = document.getElementById('forge-slot-1');
        const forgeSlot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const leaveButton = document.getElementById('blacksmith-leave-button');

        [forgeSlot1, forgeSlot2].forEach((slot, index) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                const sourceIndexStr = this.ui.draggedItemIndex;
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

                const sourceIndexStr = this.ui.draggedItemIndex;
                if (sourceIndexStr === null) return;
                const parsedIndex = parseInt(sourceIndexStr, 10);

                if (isNaN(parsedIndex)) return;

                const item = this.game.player.inventory[parsedIndex];
                const targetSlotNum = index + 1;

                if (!this.isValidForgeItem(item, parsedIndex, targetSlotNum)) {
                    this.game.addLog("Invalid item combination for forging.");
                    return;
                }

                if (slot.dataset.itemData) {
                    this.clearForgeSlot(targetSlotNum);
                }
                const currentInventoryItem = this.game.player.inventory[parsedIndex];
                if (!currentInventoryItem || currentInventoryItem.id !== item.id) {
                    console.warn(`Item at index ${parsedIndex} changed or removed unexpectedly.`);
                    this.game.addLog("Action interrupted. Please try dragging the item again.");
                    this.ui.renderInventory();
                    return;
                }
                const removedItem = this.game.player.removeItem(parsedIndex);
                slot.dataset.itemData = JSON.stringify(removedItem);
                slot.dataset.originalIndex = parsedIndex;
                slot.innerHTML = `
                    <div class="forge-slot-label">Item ${targetSlotNum}</div>
                    <div class="forge-slot-content">${removedItem.name}</div>
                `;
                slot.style.cursor = 'pointer';

                slot.onclick = () => {
                    if (slot.dataset.itemData) {
                        this.clearForgeSlot(targetSlotNum);
                    }
                };
                slot.classList.add('crafting-slot-filled');

                this.updateForgeButton();
                this.ui.renderInventory();
                this.ui.renderEquipment();
            });
        });

        forgeButton.onclick = () => {
            const slot1 = document.getElementById('forge-slot-1');
            const slot2 = document.getElementById('forge-slot-2');
            if (slot1.dataset.itemData && slot2.dataset.itemData) {
                this.handleForgeItems();
            } else {
                console.warn("Forge button clicked but slots not ready.");
            }
        };

        leaveButton.onclick = function () {
            this.game.addLog("You leave the Blacksmith's forge.");
            this.clearForgeSlot(1);
            this.clearForgeSlot(2);
            this.game.proceedToNextRound();
        }.bind(this);
    }


    updateForgeButton() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const forgePreview = document.getElementById('forge-preview');

        if (!slot1 || !slot2 || !forgeButton || !forgePreview) {
            console.warn("updateForgeButton: One or more required elements not found.");
            if (forgeButton) forgeButton.disabled = true;
            if (forgePreview) forgePreview.classList.add('hidden');
            return;
        }
        const item1DataString = slot1.dataset.itemData;
        const item2DataString = slot2.dataset.itemData;
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let canForge = false;
        let item1 = null;
        let item2 = null;

        if (item1DataString && item2DataString) {
            try {
                item1 = JSON.parse(item1DataString);
                item2 = JSON.parse(item2DataString);
                canForge = item1 && item2 &&
                    item1.type === item2.type &&
                    item1.slot === item2.slot &&
                    item1.id === item2.id &&
                    hasHammer;

            } catch (error) {
                console.error("Error parsing item data in updateForgeButton:", error);
                canForge = false;
            }
        }

        forgeButton.disabled = !canForge;

        if (canForge && item1 && item2) {
            const previewItem = this.previewForgedItem(item1, item2);
            if (previewItem) {
                forgePreview.textContent = `Result: ${previewItem.name}`;
                forgePreview.classList.remove('hidden');
            } else {
                forgeButton.disabled = true;
                forgePreview.textContent = "Cannot forge these items.";
                forgePreview.classList.remove('hidden');
            }
        } else {
            forgeButton.disabled = true;
            if (!item1DataString || !item2DataString) {
                forgePreview.textContent = "Place two identical items to forge.";
            } else if (!hasHammer) {
                forgePreview.textContent = "Requires Blacksmith Hammer.";
            } else {
                forgePreview.textContent = "Items must be identical.";
            }
            forgePreview.classList.remove('hidden');
        }
    }

    previewForgedItem(item1, item2) {
        if (!item1 || !item2 || item1.type !== item2.type || item1.slot !== item2.slot || item1.id !== item2.id) {
            return null;
        }

        const forgedItem = {
            name: `Reinforced ${item1.name}`,
            type: item1.type,
            slot: item1.slot,
            stats: {
                attack: (item1.stats.attack || 0) + (item2.stats.attack || 0),
                defense: (item1.stats.defense || 0) + (item2.stats.defense || 0)
            },
            speed: item1.speed ? Math.max(item1.speed * 0.9, item2.speed * 0.9) : undefined,
            hands: item1.hands,
            description: `A strengthened version of ${item1.name}.\n` +
                `Attack: +${(item1.stats.attack || 0) + (item2.stats.attack || 0)}\n` +
                `Defense: +${(item1.stats.defense || 0) + (item2.stats.defense || 0)}` +
                (item1.speed ? `\nSpeed: ${(Math.max(item1.speed * 0.9, item2.speed * 0.9)).toFixed(1)}s` : '') +
                (item1.hands ? `\n${item1.hands}-Handed` : '')
        };

        forgedItem.value = Math.floor((item1.value + item2.value) * 1.5);
        return forgedItem;
    }

    handleForgeItems() {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to forge items!");
            return;
        }

        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');

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

        if (!item1 || !item2) return;

        const forgedItem = this.previewForgedItem(item1, item2);
        if (!forgedItem) {
            this.game.addLog("Cannot forge these items together.");
            return;
        }

        if (!this.game.player.addItem(forgedItem)) {
            this.game.addLog("Inventory full! Cannot forge items.");
            return;
        }

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
            slot.classList.remove('crafting-slot-filled');
        });
        this.game.addLog(`The Blacksmith combines your ${item1.name} and ${item2.name} into a ${forgedItem.name}!`);
        this.updateForgeButton();
        this.ui.renderInventory();
        this.ui.renderEquipment();

        const blacksmithArea = document.getElementById('blacksmith-area');
        if (blacksmithArea) {
            blacksmithArea.classList.add('upgrade-success-flash');
            setTimeout(() => blacksmithArea.classList.remove('upgrade-success-flash'), 500);
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
                }
            } catch (error) {
                console.error(`Error parsing item data from forge slot ${slotNum}:`, error);
                this.game.addLog(`Error clearing slot ${slotNum}. Item data corrupted?`);
            }
        }

        slotElement.innerHTML = `
            <div class="forge-slot-label">Item ${slotNum}</div>
            <div class="forge-slot-content">Drag item here</div>
        `;
        slotElement.style.cursor = 'default';
        slotElement.onclick = null;

        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled');

        this.updateForgeButton();
        this.ui.renderInventory();
        this.ui.renderEquipment();
    }

    isValidForgeItem(item, sourceIndex, targetSlotNum) {
        if (!item || (item.type !== 'weapon' && item.type !== 'armor')) {
            return false;
        }

        const otherSlotNum = targetSlotNum === 1 ? 2 : 1;
        const otherSlot = document.getElementById(`forge-slot-${otherSlotNum}`);
        const otherSlotIndexStr = otherSlot?.dataset.itemIndex;

        if (otherSlotIndexStr !== undefined) {
            const otherSlotIndex = parseInt(otherSlotIndexStr, 10);
            if (sourceIndex === otherSlotIndex) {
                return false;
            }
            const otherItem = this.game.player.inventory[otherSlotIndex];
            if (otherItem) {
                if (item.type !== otherItem.type || item.slot !== otherItem.slot) {
                    return false;
                }
            }
        }

        const currentTargetSlot = document.getElementById(`forge-slot-${targetSlotNum}`);
        const currentTargetIndexStr = currentTargetSlot?.dataset.itemIndex;
        if (currentTargetIndexStr !== undefined && parseInt(currentTargetIndexStr, 10) === sourceIndex) {
            return false;
        }

        return true;
    }
}
