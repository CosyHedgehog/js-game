class Armoury {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        const hasHammer = game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            game.addLog("You need a Blacksmith Hammer to use the armoury!");
            game.proceedToNextRound();
            return;
        }
        this.game.state = 'armourer';
        this.game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        this.showArmourerUI();
    }

    showArmourerUI() {
        this.ui.clearMainArea();
        this.ui.renderInventory();
        
        const mainContent = document.getElementById('main-content');

        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p style="color: #ff4444; font-weight: bold;">Requires: Blacksmith Hammer</p>';
        
        const armourerArea = document.createElement('div');
        armourerArea.id = 'armourer-area';
        armourerArea.innerHTML = `
            <h3>Armourer Station</h3>
            ${hammerWarning}
            <p>Drag a piece of armor onto the station to enhance its Defense (+1) or Max Health (+3).</p>
        `;
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'armourer-container';
        
        const armorSlot = document.createElement('div');
        armorSlot.className = 'armourer-slot';
        armorSlot.innerHTML = `
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drag armor here</div>
        `;    
        
        const previewArea = document.createElement('div');
        previewArea.id = 'armourer-preview';
        previewArea.innerHTML = 'Place armor in the slot to see enhancement options';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';

        const enhanceDefenseButton = document.createElement('button');
        enhanceDefenseButton.id = 'armourer-defense-button';
        enhanceDefenseButton.textContent = 'Reinforce (+1 Def)';
        enhanceDefenseButton.disabled = true;
        enhanceDefenseButton.onclick = () => this.handleArmourEnhancement('defense');

        const enhanceHealthButton = document.createElement('button');
        enhanceHealthButton.id = 'armourer-health-button';
        enhanceHealthButton.textContent = 'Fortify (+3 HP)';
        enhanceHealthButton.disabled = true;
        enhanceHealthButton.onclick = () => this.handleArmourEnhancement('health');
        
        const leaveButton = document.createElement('button');
        leaveButton.id = 'armourer-leave-button';
        leaveButton.textContent = 'Leave';
        leaveButton.onclick = function() { 
            this.game.addLog("You leave without using the Armourer's tools.");
            this.game.proceedToNextRound();
        }.bind(this);
        
        slotContainer.appendChild(armorSlot);
        armourerArea.appendChild(slotContainer);
        armourerArea.appendChild(previewArea);
        buttonContainer.appendChild(enhanceDefenseButton);
        buttonContainer.appendChild(enhanceHealthButton);
        armourerArea.appendChild(buttonContainer);
        armourerArea.appendChild(leaveButton);
        
        mainContent.appendChild(armourerArea);

        const armourerSlot = armourerArea.querySelector('.armourer-slot');
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
                        <div class="armourer-slot-label">Armor Slot</div>
                        <div class="armourer-slot-content">${removedItem.name}</div>
                    `;
                    armourerSlot.style.cursor = 'pointer';
                    armourerSlot.onclick = () => {
                        if (armourerSlot.dataset.itemData) { 
                            this.clearArmourerSlot();
                        }
                    };    

                    const isAlreadyReinforced = removedItem.isReinforced === true;
                    const isAlreadyFortified = removedItem.isFortified === true;

                    const previewElement = document.getElementById('armourer-preview');
                    const currentDefense = (removedItem.stats.defense || 0);
                    const newDefense = currentDefense + 1;
                    const currentMaxHealth = (removedItem.stats.maxHealth || 0);
                    const newMaxHealth = currentMaxHealth + 3;

                    let previewHTML = `Current: Def ${currentDefense} / Max HP +${currentMaxHealth}<br>`;
                    if (isAlreadyReinforced && isAlreadyFortified) {
                        previewHTML += `<span style="color: #aaa;">Fully Enhanced!</span>`;
                    } else if (isAlreadyReinforced) {
                        previewHTML += `Reinforce: <span style="color: #aaa;">Already Reinforced</span><br>`;
                        previewHTML += `Fortify:   Def ${currentDefense} / Max HP +${newMaxHealth}`;
                    } else if (isAlreadyFortified) {
                        previewHTML += `Reinforce: Def ${newDefense} / Max HP +${currentMaxHealth}<br>`;
                        previewHTML += `Fortify:   <span style="color: #aaa;">Already Fortified</span>`;
                    } else {
                        previewHTML += `Reinforce: Def ${newDefense} / Max HP +${currentMaxHealth}<br>`;
                        previewHTML += `Fortify:   Def ${currentDefense} / Max HP +${newMaxHealth}`;
                    }
                    previewElement.innerHTML = previewHTML;

                    document.getElementById('armourer-defense-button').disabled = isAlreadyReinforced;
                    document.getElementById('armourer-health-button').disabled = isAlreadyFortified;
                    
                    this.ui.renderInventory();
                    this.ui.renderEquipment();

                    armourerSlot.classList.add('crafting-slot-filled');
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
            <div class="armourer-slot-label">Armor Slot</div>
            <div class="armourer-slot-content">Drop armor here</div>
        `;
        slotElement.style.cursor = 'default';
        slotElement.onclick = null;
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;

        slotElement.classList.remove('crafting-slot-filled');

        const enhanceDefenseButton = document.getElementById('armourer-defense-button');
        const enhanceHealthButton = document.getElementById('armourer-health-button');
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

        // Check if already enhanced with the selected type
        if (type === 'defense' && item.isReinforced === true) {
            this.game.addLog(`${item.name} has already been reinforced.`);
            return;
        }
        if (type === 'health' && item.isFortified === true) {
            this.game.addLog(`${item.name} has already been fortified.`);
            return;
        }

        let successMessage = "";
        const originalName = item.name.replace(/^Reinforced |^Fortified /i, ''); // Get base name

        if (type === 'defense') {
            item.isReinforced = true; // Set flag
            item.stats.defense = (item.stats.defense || 0) + 1;
            successMessage = `Reinforced ${originalName}! Defense +1.`;
            // Update name based on whether it was already fortified
            if (item.isFortified) {
                item.name = `Reinforced Fortified ${originalName}`;
            } else {
                item.name = `Reinforced ${originalName}`;
            }
            const defenseMatch = item.description.match(/Defense: \+\d+/);
            if (defenseMatch) {
                item.description = item.description.replace(/Defense: \+\d+/, `Defense: +${item.stats.defense}`);
            } else {
                item.description += `\nDefense: +${item.stats.defense}`;
            }
        } else if (type === 'health') {
            item.isFortified = true; // Set flag
            item.stats.maxHealth = (item.stats.maxHealth || 0) + 3;
            successMessage = `Fortified ${originalName}! Max HP +3`;
            // Update name based on whether it was already reinforced
            if (item.isReinforced) {
                item.name = `Fortified Reinforced ${originalName}`;
            } else {
                item.name = `Fortified ${originalName}`;
            }
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
        
        if (!this.game.player.addItem(item)) {
            this.game.addLog(`Inventory full! Could not add enhanced ${item.name}.`);
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
