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
        
                    // Update preview (using the local previewArea reference)
                    const newDefense = (removedItem.stats.defense || 0) + 1;
                    previewArea.textContent = `${removedItem.name} → Defense: ${(removedItem.stats.defense || 0)} → ${newDefense}`;
                    
                    // Enable enhance button (check hammer)
                    const hammerCheck = this.game.player.inventory.some(i => i && i.id === 'blacksmith_hammer');
                    enhanceButton.disabled = !hammerCheck;
                    
                    this.ui.renderInventory(); 

                    armourerSlot.classList.add('crafting-slot-filled'); // Add visual class
                } else {
                    this.game.addLog("You can only enhance armor.");
                }
            });
        } // End if (armourerSlot)
    }

    clearArmourerSlot() {
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

        this.ui.renderInventory(); // Update inventory display
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
                this.ui.clearMainArea();
                this.game.proceedToNextRound();
            }, 500); // Match animation duration
        } else {
            // If area not found, proceed immediately
            this.ui.clearMainArea();
            this.game.proceedToNextRound();
        }
    }
}
