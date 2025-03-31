class Sharpen {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        this.game.state = 'sharpen';
        this.game.addLog("You find a sharpening stone. You can use it to enhance a weapon's attack power.");
        this.showSharpenUI();
    }

    showSharpenUI() {
        this.ui.clearMainArea();

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
        leaveButton.onclick = function () {
            this.game.addLog("You leave without using the sharpening stone.");
            this.clearSharpenSlot();
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
                const sourceIndex = this.ui.draggedItemIndex;
                const item = this.ui.draggedItem;
                if (sourceIndex === null || item === null) return;
                sharpenSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
                if (item && item.type === 'weapon') {
                    console.log("Drag over valid");
                    sharpenSlot.classList.add('drag-over-valid');
                } else {
                    console.log("Drag over invalid");
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
                        this.ui.renderInventory();
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

                    this.ui.renderInventory();

                } else {
                    this.game.addLog("You can only place weapons on the sharpening stone."); // More specific message
                }
            });
        }
    }

    clearSharpenSlot() {
        console.log("Clearing sharpen slot");
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

        this.ui.renderInventory(); // Update inventory display
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
                this.ui.clearMainArea();
                this.game.proceedToNextRound();
            }, 500);
        } else {
            this.ui.clearMainArea();
            this.game.proceedToNextRound();
        }
    }
}
