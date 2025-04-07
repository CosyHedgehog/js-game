class Armoury {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to use the armoury!");
            this.game.proceedToNextRound();
            return;
        }
        this.game.state = 'armourer';
        this.game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        this.showArmourerUI();
    }

    showArmourerUI() {
        this.ui.clearMainArea();
        this.ui.renderInventory();
        this.ui.updatePlayerStats();

        const mainContent = document.getElementById('main-content');
        const armourerArea = document.createElement('div');
        armourerArea.id = 'armourer-area';
        armourerArea.classList.remove('hidden');

        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p class="requirement-warning">Requires: Blacksmith Hammer</p>';

        armourerArea.innerHTML = `
            <h3>🔨 Armourer Station</h3>
            ${hammerWarning}
            <p class="ui-description">Drag a piece of armor onto the station to enhance its Defense (+1) or Max Health (+3).</p>

            <div class="armourer-content-wrapper">
                <div class="armourer-main-area">
                    <div class="armourer-slot-container">
                        <div class="armourer-slot">
                            <div class="armourer-slot-content">Drag armor here</div>
                        </div>
                    </div>
                    <div id="armourer-preview" class="item-description">
                        Place armor in the slot to see enhancement options
                    </div>
                </div>

                <div class="armourer-controls">
                    <div class="armourer-action-buttons">
                        <button id="armourer-defense-button" class="action-button" ${!hasHammer ? 'disabled' : ''}>Reinforce (+1 Def)</button>
                        <button id="armourer-health-button" class="action-button" ${!hasHammer ? 'disabled' : ''}>Fortify (+3 HP)</button>
                    </div>
                    <button id="armourer-leave-button" class="leave-button">Leave</button>
                </div>
            </div>
        `;

        const existingArea = document.getElementById('armourer-area');
        if (existingArea) existingArea.remove();
        mainContent.appendChild(armourerArea);

        this.setupArmourerEventListeners(armourerArea);

        if (!hasHammer || !armourerArea.querySelector('.armourer-slot').dataset.itemData) {
             const defenseButton = armourerArea.querySelector('#armourer-defense-button');
             const healthButton = armourerArea.querySelector('#armourer-health-button');
             if(defenseButton) defenseButton.disabled = true;
             if(healthButton) healthButton.disabled = true;
        }
    }

    setupArmourerEventListeners(armourerArea) {
        const armourerSlot = armourerArea.querySelector('.armourer-slot');
        const enhanceDefenseButton = armourerArea.querySelector('#armourer-defense-button');
        const enhanceHealthButton = armourerArea.querySelector('#armourer-health-button');
        const leaveButton = armourerArea.querySelector('#armourer-leave-button');

        if (enhanceDefenseButton) {
             enhanceDefenseButton.onclick = () => this.handleArmourEnhancement('defense');
        }
         if (enhanceHealthButton) {
             enhanceHealthButton.onclick = () => this.handleArmourEnhancement('health');
        }
        if (leaveButton) {
            leaveButton.onclick = function() {
                this.game.addLog("You leave without using the Armourer's tools.");
                this.clearArmourerSlot(); 
                this.game.proceedToNextRound();
            }.bind(this);
        }

        if (armourerSlot) {
            armourerSlot.addEventListener('dragover', (event) => {
                event.preventDefault();
                const sourceIndex = this.ui.draggedItemIndex;
                const item = this.ui.draggedItem;
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
                         this.ui.renderInventory();
                         return;
                    }
                    const removedItem = this.game.player.removeItem(sourceIndex);

                    armourerSlot.dataset.itemData = JSON.stringify(removedItem);
                    armourerSlot.dataset.originalIndex = sourceIndex;

                    armourerSlot.innerHTML = `
                        <div class="armourer-slot-content">${removedItem.name}</div>
                    `;
                    armourerSlot.style.cursor = 'pointer';
                    armourerSlot.onclick = () => {
                        if (armourerSlot.dataset.itemData) {
                            this.clearArmourerSlot();
                        }
                    };

                    armourerSlot.classList.add('crafting-slot-filled');

                    const previewElement = document.getElementById('armourer-preview');
                    const isAlreadyReinforced = removedItem.isReinforced === true;
                    const isAlreadyFortified = removedItem.isFortified === true;

                    const currentDefense = (removedItem.stats?.defense || 0);
                    const newDefense = currentDefense + 1;
                    const currentMaxHealth = (removedItem.stats?.maxHealth || 0);
                    const newMaxHealth = currentMaxHealth + 3;

                    let previewHTML = `<div class="item-desc-text preview-grid armourer-preview-grid">`; 

                    previewHTML += `<div class="preview-header"></div>`;
                    previewHTML += `<div class="preview-header">🛡️ Defense</div>`;
                    previewHTML += `<div class="preview-header">❤️ Max HP</div>`;

                    previewHTML += `<div>Current</div>`;
                    previewHTML += `<div class="preview-cell">${currentDefense}</div>`;
                    previewHTML += `<div class="preview-cell">+${currentMaxHealth}</div>`;

                    previewHTML += `<div>Reinforce</div>`;
                    if (isAlreadyReinforced) {
                        previewHTML += `<div class="preview-cell unavailable-option" style="grid-column: span 2;">Already Reinforced</div>`;
                    } else {
                        previewHTML += `<div class="preview-cell">${newDefense} (+1)</div>`;
                        previewHTML += `<div class="preview-cell">+${currentMaxHealth}</div>`; 
                    }

                    previewHTML += `<div>Fortify</div>`;
                    if (isAlreadyFortified) {
                        previewHTML += `<div class="preview-cell unavailable-option" style="grid-column: span 2;">Already Fortified</div>`;
                    } else {
                        previewHTML += `<div class="preview-cell">${currentDefense}</div>`; 
                        previewHTML += `<div class="preview-cell">+${newMaxHealth} (+3)</div>`;
                    }

                     if (isAlreadyReinforced && isAlreadyFortified) {
                        previewHTML += `<div class="fully-enhanced-message" style="grid-column: 1 / -1;">Fully Enhanced!</div>`;
                    }

                    previewHTML += `</div>`; 
                    previewElement.innerHTML = previewHTML;

                    const defenseButton = document.getElementById('armourer-defense-button');
                    const healthButton = document.getElementById('armourer-health-button');
                    const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');

                    if(defenseButton) defenseButton.disabled = isAlreadyReinforced || !hasHammer;
                    if(healthButton) healthButton.disabled = isAlreadyFortified || !hasHammer;

                    this.ui.renderInventory();
                    this.ui.renderEquipment();

                } else {
                    this.game.addLog("You can only enhance armor.");
                }
            });
        }
    }

    clearArmourerSlot() {
        const slotElement = document.querySelector('#armourer-area .armourer-slot');

        if (!slotElement) {
            console.error("Armourer slot element not found using querySelector!");
            this.game.addLog("Error: UI element missing for armourer slot.");
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
                console.error("Error parsing item data from armourer slot:", error);
                this.game.addLog("Error clearing slot. Item data corrupted?");
            }
        }

        slotElement.innerHTML = `
            <div class="armourer-slot-content">Drop armor here</div>
        `;
        slotElement.style.cursor = 'default';
        slotElement.onclick = null;
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled');

        const enhanceDefenseButton = document.getElementById('armourer-defense-button');
        const enhanceHealthButton = document.getElementById('armourer-health-button');
        const leaveButton = document.getElementById('armourer-leave-button');
        if (enhanceDefenseButton) enhanceDefenseButton.disabled = true;
        if (enhanceHealthButton) enhanceHealthButton.disabled = true;

        const previewArea = document.getElementById('armourer-preview');
        if (previewArea) {
            previewArea.innerHTML = 'Place armor in the slot to see enhancement options';
        }

        this.ui.renderInventory();
        this.ui.renderEquipment();
    }

    handleArmourEnhancement(type) {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to enhance armor!");
            return;
        }

        const slot = document.querySelector('#armourer-area .armourer-slot');
        
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
            this.game.addLog("Invalid item type for enhancement.");
            return;
        }

               if (type === 'defense' && item.isReinforced === true) {
            this.game.addLog(`${item.name} has already been reinforced.`);
            return;
        }

               const wasForged = item.isForged === true;
        const wasFortified = item.isFortified === true;
        const wasReinforced = item.isReinforced === true;

        let successMessage = "";
               const originalName = item.name.replace(/^(Forged |Reinforced |Fortified )+/i, '');

        if (type === 'defense') {
            item.isReinforced = true;            item.stats.defense = (item.stats.defense || 0) + 1;
            successMessage = `Reinforced ${item.name}! Defense +1.`;
            item.name = `Reinforced ${item.name}`;

            const defenseMatch = item.description.match(/Defense: \+\d+/);
            if (defenseMatch) {
                item.description = item.description.replace(/Defense: \+\d+/, `Defense: +${item.stats.defense}`);
            } else {
                item.description += `\nDefense: +${item.stats.defense}`;
            }
        } else if (type === 'health') {
            item.isFortified = true;            item.stats.maxHealth = (item.stats.maxHealth || 0) + 3;
            successMessage = `Fortified ${item.name}! Max HP +3`;
            item.name = `Fortified ${item.name}`;

            const maxHpMatch = item.description.match(/Max HP: \+\d+/);
            if (maxHpMatch) {
                const currentBonus = parseInt(maxHpMatch[0].match(/\d+/)[0]);
                item.description = item.description.replace(/Max HP: \+\d+/, `Max HP: +${currentBonus + 3}`);
            } else {
                item.description += `\nMax HP: +3`;
            }
        } else {
            this.game.addLog("Unknown enhancement type.");
            return;
        }

        item.value = Math.floor(item.value * 1.2);
        
        // --- Disable buttons immediately to prevent double-clicks ---
        const enhanceDefenseButton = document.getElementById('armourer-defense-button');
        const enhanceHealthButton = document.getElementById('armourer-health-button');
        const leaveButton = document.getElementById('armourer-leave-button');
        if (enhanceDefenseButton) enhanceDefenseButton.disabled = true;
        if (enhanceHealthButton) enhanceHealthButton.disabled = true;
        if (leaveButton) leaveButton.disabled = true;
        // ----------------------------------------------------------

        if (!this.game.player.addItem(item)) {
            this.game.addLog(`Inventory full! Could not add enhanced ${item.name}.`);
            // Re-enable buttons if adding fails (optional, but good practice)
            if (enhanceDefenseButton) enhanceDefenseButton.disabled = (item.isReinforced === true);
            if (enhanceHealthButton) enhanceHealthButton.disabled = (item.isFortified === true); 
            if (leaveButton) leaveButton.disabled = false;
            return;
        }

        this.game.addLog(successMessage);
        this.ui.updatePlayerStats();
        this.ui.renderInventory();
        this.ui.renderEquipment();

        const armourerArea = document.getElementById('armourer-area');
        if (armourerArea) {            
            armourerArea.classList.add('upgrade-success-flash');
            setTimeout(() => {
                armourerArea.classList.remove('upgrade-success-flash');
                this.ui.clearMainArea();
                this.game.proceedToNextRound();
            }, 500);
        } else {
            this.ui.clearMainArea();
            this.game.proceedToNextRound();
        }
    }
}
