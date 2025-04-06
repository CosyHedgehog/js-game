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
        this.ui.renderInventory();
        this.ui.updatePlayerStats();

        const mainContent = document.getElementById('main-content');

        const sharpenArea = document.createElement('div');
        sharpenArea.id = 'sharpen-area';
        sharpenArea.innerHTML = `
            <h3>Sharpening Stone</h3>
            <p>Drag a weapon onto the stone to enhance its Attack (+1) or Speed (-0.5s).</p> <!-- Updated text -->
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
        previewArea.innerHTML = 'Select a weapon to preview enhancements';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';

        const sharpenAttackButton = document.createElement('button');
        sharpenAttackButton.id = 'sharpen-attack-button';
        sharpenAttackButton.textContent = 'Sharpen (+1 Attack)';
        sharpenAttackButton.disabled = true;
        sharpenAttackButton.onclick = () => this.handleSharpen('attack');

        const sharpenSpeedButton = document.createElement('button');
        sharpenSpeedButton.id = 'sharpen-speed-button';
        sharpenSpeedButton.textContent = 'Hone (-0.5s Speed)';
        sharpenSpeedButton.disabled = true;
        sharpenSpeedButton.onclick = () => this.handleSharpen('speed');

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

        const sharpenSlot = sharpenArea.querySelector('.sharpen-slot');
        if (sharpenSlot) {
            sharpenSlot.addEventListener('dragover', (event) => {
                event.preventDefault();
                const sourceIndex = this.ui.draggedItemIndex;
                const item = this.ui.draggedItem;
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

                    const previewElement = document.getElementById('sharpen-preview');
                    const isAlreadySharpened = removedItem.isSharpened === true;
                    const isAlreadyHoned = removedItem.isHoned === true;

                    const currentAttack = (removedItem.stats.attack || 0);
                    const newAttack = currentAttack + 1;
                    const currentSpeed = (removedItem.speed ?? this.game.player.defaultAttackSpeed);
                    const newSpeedValue = Math.max(0.1, currentSpeed - 0.5);
                    const currentDPS = currentSpeed > 0 ? (currentAttack / currentSpeed) : 0;
                    const sharpenedDPS = currentSpeed > 0 ? (newAttack / currentSpeed) : 0;
                    const honedDPS = newSpeedValue > 0 ? (currentAttack / newSpeedValue) : 0;

                    let previewHTML = `<strong>Current:</strong> Atk ${currentAttack} / Spd ${currentSpeed.toFixed(1)}s / DPS ${currentDPS.toFixed(1)}<br>`;
                    if (isAlreadySharpened && isAlreadyHoned) {
                        previewHTML += `<span style="color: #FF0000;">Fully Enhanced!</span>`;
                    } else if (isAlreadySharpened) {
                        previewHTML += `<strong>Sharpen:</strong> <span style="color: #aaa;">Already Sharpened</span><br>`;
                        previewHTML += `<strong>Hone (-0.5s):</strong> Atk ${currentAttack} / Spd ${newSpeedValue.toFixed(1)}s / DPS ${honedDPS.toFixed(1)}`;
                    } else if (isAlreadyHoned) {
                        previewHTML += `<strong>Sharpen:</strong> Atk ${newAttack} (+1) / Spd ${currentSpeed.toFixed(1)}s / DPS ${sharpenedDPS.toFixed(1)}<br>`;
                        previewHTML += `<strong>Hone (-0.5s):</strong> <span style="color: #aaa;">Already Honed</span>`;
                    } else {
                        previewHTML += `<strong>Sharpen:</strong> Atk ${newAttack} (+1) / Spd ${currentSpeed.toFixed(1)}s / DPS ${sharpenedDPS.toFixed(1)}<br>`;
                        previewHTML += `<strong>Hone (-0.5s):</strong> Atk ${currentAttack} / Spd ${newSpeedValue.toFixed(1)}s / DPS ${honedDPS.toFixed(1)}`;
                    }

                    previewElement.innerHTML = previewHTML;

                    document.getElementById('sharpen-attack-button').disabled = isAlreadySharpened;
                    document.getElementById('sharpen-speed-button').disabled = isAlreadyHoned || newSpeedValue === currentSpeed;

                    this.ui.renderInventory();
                    this.ui.updatePlayerStats();
                    this.ui.renderEquipment();

                } else {
                    this.game.addLog("You can only place weapons on the sharpening stone.");
                }
            });
        }
    }

    clearSharpenSlot() {
        const slotElement = document.querySelector('#sharpen-area .sharpen-slot');

        if (!slotElement) {
            console.error("Sharpen slot element not found using querySelector!");
            this.game.addLog("Error: UI element missing for sharpen slot.");
            return;
        }

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
            }
        }

        slotElement.innerHTML = `
                <div class="sharpen-slot-label">Weapon Slot</div>
                <div class="sharpen-slot-content">Drop weapon here</div>
            `;
        slotElement.style.cursor = 'default';
        slotElement.onclick = null;
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled');

        const sharpenAttackButton = document.getElementById('sharpen-attack-button');
        const sharpenSpeedButton = document.getElementById('sharpen-speed-button');
        const leaveButton = document.getElementById('sharpen-leave-button');
        if (sharpenAttackButton) sharpenAttackButton.disabled = true;
        if (sharpenSpeedButton) sharpenSpeedButton.disabled = true;
        if (leaveButton) leaveButton.disabled = true;

        const previewArea = document.getElementById('sharpen-preview');
        if (previewArea) {
            previewArea.innerHTML = 'Select a weapon to preview enhancements';
        }

        this.ui.renderInventory();
        this.ui.renderEquipment();
        this.ui.updatePlayerStats();
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

        if (type === 'attack' && item.isSharpened === true) {
            this.game.addLog(`${item.name} has already been sharpened.`);
            return;
        }
        if (type === 'speed' && item.isHoned === true) {
            this.game.addLog(`${item.name} has already been honed.`);
            return;
        }

        let successMessage = "";
        const originalName = item.name.replace(/^Sharpened |^Honed /i, '');
        const currentName = item.name;

        if (type === 'attack') {
            item.isSharpened = true; const currentAttack = item.stats.attack || 0;
            item.stats.attack = currentAttack + 1;
            successMessage = `Sharpened ${currentName}! Attack +1.`;
            item.name = `Sharpened ${currentName}`; item.description = item.description.replace(/Attack: \+\d+/, `Attack: +${item.stats.attack}`);
        } else if (type === 'speed') {
            item.isHoned = true; const currentSpeed = (item.speed ?? this.game.player.defaultAttackSpeed);
            const newSpeed = Math.max(0.1, currentSpeed - 0.5);
            if (newSpeed === currentSpeed) {
                this.game.addLog(`Cannot hone ${item.name} further (minimum 0.1s speed).`);
                return;
            } else {
                item.speed = newSpeed;
                successMessage = `Honed ${currentName}! Speed reduced by 0.5s (Now ${newSpeed.toFixed(1)}s).`;
                item.name = `Honed ${currentName}`; item.description = item.description.replace(/Speed: [\d.]+s/, `Speed: ${item.speed.toFixed(1)}s`);
                if (!item.description.includes("Speed:")) {
                    item.description += ` Speed: ${item.speed.toFixed(1)}s`;
                }
            }
        }

        item.value = Math.floor(item.value * 1.2);

        // --- Disable buttons immediately to prevent double-clicks ---
        const sharpenAttackButton = document.getElementById('sharpen-attack-button');
        const sharpenSpeedButton = document.getElementById('sharpen-speed-button');
        const leaveButton = document.getElementById('sharpen-leave-button');
        if (sharpenAttackButton) sharpenAttackButton.disabled = true;
        if (sharpenSpeedButton) sharpenSpeedButton.disabled = true;
        if (leaveButton) leaveButton.disabled = true;
        // ----------------------------------------------------------

        if (!this.game.player.addItem(item)) {
            this.game.addLog("Inventory full! Cannot return the sharpened item.");
            // Re-enable buttons if adding fails
            if (sharpenAttackButton) sharpenAttackButton.disabled = (item.isSharpened === true);
            if (sharpenSpeedButton) sharpenSpeedButton.disabled = (item.isHoned === true);
            if (leaveButton) leaveButton.disabled = false;
            return;
        }

        this.game.addLog(successMessage);

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

        this.ui.updatePlayerStats();
        this.ui.renderInventory();
        this.ui.renderEquipment();
    }
}