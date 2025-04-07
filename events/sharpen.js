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
        sharpenArea.classList.remove('hidden');

        sharpenArea.innerHTML = `
            <h3>🗡️ Sharpening Stone</h3>
            <p class="ui-description">Drag a weapon onto the stone to enhance its Attack (+1) or Speed (-0.5s).</p>

            <div class="sharpen-content-wrapper"> 
                <div class="sharpen-main-area"> 
                    <div class="sharpen-slot-container"> 
                        <div class="sharpen-slot">
                            <div class="sharpen-slot-content">Drag weapon here</div>
                        </div>
                    </div>
                    <div id="sharpen-preview" class="item-description"> 
                        Place a weapon in the slot to see enhancement options
                    </div>
                </div>

                <div class="sharpen-controls">
                    <div class="sharpen-action-buttons">
                        <button id="sharpen-attack-button" class="action-button" disabled>Sharpen (+1 Attack)</button>
                        <button id="sharpen-speed-button" class="action-button" disabled>Hone (-0.5s Speed)</button>
                    </div>
                    <button id="sharpen-leave-button" class="leave-button">Leave</button>
                </div>
            </div>
        `;

        const existingArea = document.getElementById('sharpen-area');
        if (existingArea) existingArea.remove();
        mainContent.appendChild(sharpenArea);

        this.setupSharpenEventListeners(sharpenArea);
    }

    // Separate function for listeners
    setupSharpenEventListeners(sharpenArea) {
        const sharpenSlot = sharpenArea.querySelector('.sharpen-slot');
        const sharpenAttackButton = sharpenArea.querySelector('#sharpen-attack-button');
        const sharpenSpeedButton = sharpenArea.querySelector('#sharpen-speed-button');
        const leaveButton = sharpenArea.querySelector('#sharpen-leave-button');

        if (sharpenAttackButton) {
            sharpenAttackButton.onclick = () => this.handleSharpen('attack');
        }
        if (sharpenSpeedButton) {
            sharpenSpeedButton.onclick = () => this.handleSharpen('speed');
        }
        if (leaveButton) {
            leaveButton.onclick = function () {
                this.game.addLog("You leave without using the sharpening stone.");
                this.clearSharpenSlot(); 
                this.game.proceedToNextRound();
            }.bind(this);
        }

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

                     let previewHTML = `<div class="item-desc-text preview-grid">`;
                     
                     previewHTML += `<div class="preview-header"></div>`;
                     previewHTML += `<div class="preview-header">Attack</div>`;
                     previewHTML += `<div class="preview-header">Speed</div>`;
                     previewHTML += `<div class="preview-header">DPS</div>`;

                     previewHTML += `<div>Current</div>`;
                     previewHTML += `<div class="preview-cell">⚔️ ${currentAttack}</div>`;
                     previewHTML += `<div class="preview-cell">⚡ ${currentSpeed.toFixed(1)}s</div>`;
                     previewHTML += `<div class="preview-cell">📊 ${currentDPS.toFixed(1)}</div>`;

                     previewHTML += `<div>Sharpen</div>`;
                     if (isAlreadySharpened) {
                         previewHTML += `<div class="preview-cell unavailable-option">Already Sharpened</div>`;
                     } else {
                         previewHTML += `<div class="preview-cell">⚔️ ${newAttack} (+1)</div>`;
                         previewHTML += `<div class="preview-cell">⚡ ${currentSpeed.toFixed(1)}s</div>`;
                         previewHTML += `<div class="preview-cell">📊 ${sharpenedDPS.toFixed(1)}</div>`;
                     }

                     previewHTML += `<div>Hone</div>`;
                     if (isAlreadyHoned) {
                         previewHTML += `<div class="preview-cell unavailable-option">Already Honed</div>`;
                     } else if (newSpeedValue === currentSpeed) {
                         previewHTML += `<div class="preview-cell unavailable-option">Cannot Hone Further</div>`;
                     } else {
                         previewHTML += `<div class="preview-cell">⚔️ ${currentAttack}</div>`;
                         previewHTML += `<div class="preview-cell">⚡ ${newSpeedValue.toFixed(1)}s (-0.5s)</div>`;
                         previewHTML += `<div class="preview-cell">📊 ${honedDPS.toFixed(1)}</div>`;
                     }
                     
                     if (isAlreadySharpened && isAlreadyHoned) {
                         previewHTML += `<div class="fully-enhanced-message">Fully Enhanced!</div>`;
                     }
                     
                     previewHTML += `</div>`;

                     previewElement.innerHTML = previewHTML;

                     const attackButton = document.getElementById('sharpen-attack-button');
                     const speedButton = document.getElementById('sharpen-speed-button');
                     if (attackButton) attackButton.disabled = isAlreadySharpened;
                     if (speedButton) speedButton.disabled = isAlreadyHoned || newSpeedValue === currentSpeed;

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