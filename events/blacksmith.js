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
        this.ui.updatePlayerStats(); 

        // --- Link CSS ---
        const cssLink = document.getElementById('blacksmith-css');
        if (!cssLink) {
            const link = document.createElement('link');
            link.id = 'blacksmith-css';
            link.rel = 'stylesheet';
            link.href = 'css/blacksmith.css';
            document.head.appendChild(link);
        }
        // ---------------

        const mainContent = document.getElementById('main-content');
        const blacksmithArea = document.createElement('div');
        blacksmithArea.id = 'blacksmith-area';
        blacksmithArea.classList.remove('hidden');

        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let hammerWarning = hasHammer ? '' : '<p class="requirement-warning">Requires: Blacksmith Hammer</p>';

        blacksmithArea.innerHTML = `
            <h3>🔥 Blacksmith's Forge</h3>
            ${hammerWarning}
            <p class="ui-description">Place two compatible items below to forge them into a stronger version.</p>

            <div class="blacksmith-content-wrapper">
                <div class="blacksmith-main-area">
                    <div class="blacksmith-slots-row"> 
                        <div class="forge-slot" id="forge-slot-1">
                            <div class="forge-slot-content">Drag item 1</div>
                        </div>
                        <div class="forge-slot" id="forge-slot-2">
                             <div class="forge-slot-content">Drag item 2</div>
                        </div>
                    </div>
                    <div id="forge-preview" class="item-description">
                        Place two compatible items to forge.
                    </div>
                </div>

                <div class="blacksmith-controls">
                    <button id="forge-button" class="action-button" disabled>Forge Items</button>
                    <button id="blacksmith-leave-button" class="leave-button">Leave Forge</button>
                </div>
            </div>
        `;

        const existingArea = document.getElementById('blacksmith-area');
        if (existingArea) existingArea.remove();
        mainContent.appendChild(blacksmithArea);

        this.setupBlacksmithEventListeners(blacksmithArea);
        this.updateForgeButton(); 
    }

    setupBlacksmithEventListeners(blacksmithArea) {
        const forgeSlot1 = blacksmithArea.querySelector('#forge-slot-1');
        const forgeSlot2 = blacksmithArea.querySelector('#forge-slot-2');
        const forgeButton = blacksmithArea.querySelector('#forge-button');
        const leaveButton = blacksmithArea.querySelector('#blacksmith-leave-button');

        [forgeSlot1, forgeSlot2].forEach((slot, index) => {
            const targetSlotNum = index + 1;
            slot.addEventListener('dragover', (e) => {
                 event.preventDefault();
                 const sourceIndex = this.ui.draggedItemIndex;
                 const item = this.ui.draggedItem;
                 if (sourceIndex === null || item === null) return;
                 slot.classList.remove('drag-over-valid', 'drag-over-invalid');

                 const otherSlotNum = targetSlotNum === 1 ? 2 : 1;
                 const otherSlotElement = document.getElementById(`forge-slot-${otherSlotNum}`);
                 const otherItemDataString = otherSlotElement?.dataset.itemData;
                 let otherItem = null;
                 if(otherItemDataString) try { otherItem = JSON.parse(otherItemDataString); } catch(err) {}

                 if (this.isValidForgeDropTarget(item, otherItem)) {
                     slot.classList.add('drag-over-valid');
                 } else {
                     slot.classList.add('drag-over-invalid');
                 }
            });

            slot.addEventListener('dragleave', (e) => {
                slot.classList.remove('drag-over-valid', 'drag-over-invalid');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over-valid', 'drag-over-invalid');

                const sourceIndexStr = event.dataTransfer.getData('text/plain'); 
                if (sourceIndexStr === null || sourceIndexStr === undefined || sourceIndexStr === '') return;

                const parsedIndex = parseInt(sourceIndexStr, 10);
                if (isNaN(parsedIndex)) return;

                const itemToDrop = this.game.player.inventory[parsedIndex];

                 const otherSlotNum = targetSlotNum === 1 ? 2 : 1;
                 const otherSlotElement = document.getElementById(`forge-slot-${otherSlotNum}`);
                 const otherItemDataString = otherSlotElement?.dataset.itemData;
                 let otherItem = null;
                 if(otherItemDataString) try { otherItem = JSON.parse(otherItemDataString); } catch(err) {}

                if (this.isValidForgeDropTarget(itemToDrop, otherItem)) {
                    if (slot.dataset.itemData) {
                        this.clearForgeSlot(targetSlotNum);
                    }

                    const currentInventoryItem = this.game.player.inventory[parsedIndex];
                    if (!currentInventoryItem || currentInventoryItem.id !== itemToDrop.id) {
                        console.warn(`Item at index ${parsedIndex} changed or removed unexpectedly.`);
                        this.game.addLog("Action interrupted. Please try dragging the item again.");
                        this.ui.renderInventory();
                        return;
                    }
                    const removedItem = this.game.player.removeItem(parsedIndex);

                    if (!removedItem.baseId && removedItem.id) {
                        removedItem.baseId = removedItem.id.replace(/_forged.*|_upgraded_\d+/, '');
                         if (!ITEMS[removedItem.baseId]) {
                            console.warn(`Could not derive valid baseId for ${removedItem.id}. Falling back to ID.`);
                            removedItem.baseId = removedItem.id; 
                         }
                    }

                    slot.dataset.itemData = JSON.stringify(removedItem);
                    slot.dataset.originalIndex = parsedIndex; 
                    slot.innerHTML = `
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
                } else {
                     this.game.addLog("Invalid item or combination for forging.");
                }
            });
        });

        if(forgeButton) {
            forgeButton.onclick = () => {
                const slot1 = document.getElementById('forge-slot-1');
                const slot2 = document.getElementById('forge-slot-2');
                if (slot1?.dataset.itemData && slot2?.dataset.itemData) {
                    this.handleForgeItems();
                } else {
                    console.warn("Forge button clicked but slots not ready.");
                }
            };
        }

        if(leaveButton) {
            leaveButton.onclick = function () {
                this.game.addLog("You leave the Blacksmith's forge.");
                this.clearForgeSlot(1);
                this.clearForgeSlot(2);
                this.game.proceedToNextRound();
            }.bind(this);
        }
    }

    isValidForgeDropTarget(item, otherItemInSlot) {
         if (!item || (item.type !== 'weapon' && item.type !== 'armor') || item.isForged === true) {
             return false; 
         }
         if (!otherItemInSlot) {
             return true;
         }

        const itemBaseId = item.baseId || item.id.replace(/_forged.*|_upgraded_\d+/, '');
        const otherBaseId = otherItemInSlot.baseId || otherItemInSlot.id.replace(/_forged.*|_upgraded_\d+/, '');

         return (item.type === otherItemInSlot.type &&
                 item.slot === otherItemInSlot.slot &&
                 itemBaseId === otherBaseId &&
                 otherItemInSlot.isForged !== true);
    }

    clearForgeSlot(slotNum, returnItemToInventory = true) {
        const slotId = `forge-slot-${slotNum}`;
        const slotElement = document.getElementById(slotId);
        if (!slotElement) return;

        const itemDataString = slotElement.dataset.itemData;
        if (itemDataString && returnItemToInventory) { 
            try {
                const item = JSON.parse(itemDataString);
                this.game.player.addItem(item); 
            } catch (error) {
                console.error(`Error parsing item data from forge slot ${slotNum}:`, error);
                this.game.addLog(`Error clearing slot ${slotNum}. Item data corrupted?`);
            }
        }

        slotElement.innerHTML = `<div class="forge-slot-content">Drag item ${slotNum}</div>`;
        slotElement.style.cursor = 'default';
        slotElement.onclick = null;
        delete slotElement.dataset.itemData;
        delete slotElement.dataset.originalIndex;
        slotElement.classList.remove('crafting-slot-filled');

         if (returnItemToInventory) {
            this.updateForgeButton();
            this.ui.renderInventory();
            this.ui.renderEquipment();
         } else {
             this.updateForgeButton(); 
         }

         const forgeButton = document.getElementById('forge-button');
         if (forgeButton) forgeButton.disabled = true; 
    }

    updateForgeButton() {
        const slot1 = document.getElementById('forge-slot-1');
        const slot2 = document.getElementById('forge-slot-2');
        const forgeButton = document.getElementById('forge-button');
        const forgePreview = document.getElementById('forge-preview');

        if (!slot1 || !slot2 || !forgeButton || !forgePreview) return;

        const item1DataString = slot1.dataset.itemData;
        const item2DataString = slot2.dataset.itemData;
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        let item1 = null;
        let item2 = null;
        let canForge = false;
        let previewItem = null;
        let validationMessage = "Place two compatible items to forge."; 

        if (item1DataString) try { item1 = JSON.parse(item1DataString); } catch(e) { console.error("Error parsing slot 1 data:", e); }
        if (item2DataString) try { item2 = JSON.parse(item2DataString); } catch(e) { console.error("Error parsing slot 2 data:", e); }

        if (item1 && item2) {
            item1.baseId = item1.baseId || item1.id.replace(/_forged.*|_upgraded_\d+/, '');
            item2.baseId = item2.baseId || item2.id.replace(/_forged.*|_upgraded_\d+/, '');

            if (!hasHammer) {
                validationMessage = "Requires Blacksmith Hammer.";
            } else if (item1.isForged || item2.isForged) {
                 validationMessage = "Cannot forge an already forged item.";
            } else if (item1.type !== item2.type || item1.slot !== item2.slot) {
                 validationMessage = "Items must be of the same type and slot.";
            } else if (item1.baseId !== item2.baseId) {
                 validationMessage = "Items must be based on the same original item.";
            } else {
                 previewItem = this.previewForgedItem(item1, item2);
                 if (previewItem) {
                     canForge = true;
                     validationMessage = ""; 
                 } else {
                     validationMessage = "Error generating forge preview.";
                 }
            }
        } else if (item1 || item2) {
             validationMessage = "Place a second compatible item.";
        }

        forgeButton.disabled = !canForge;

        if (canForge && previewItem) {
             let previewHTML = `<div class="item-desc-text preview-grid blacksmith-preview-grid">`;

             previewHTML += `<div class="preview-header"></div>`;
             previewHTML += `<div class="preview-header">Attack</div>`;
             previewHTML += `<div class="preview-header">Defense</div>`;
             previewHTML += `<div class="preview-header">Max HP</div>`;
             previewHTML += `<div class="preview-header">Speed</div>`;

             const formatRow = (label, item) => {
                let row = `<div>${label}</div>`;
                row += `<div class="preview-cell">${item.stats?.attack || '-'}</div>`;
                row += `<div class="preview-cell">${item.stats?.defense || '-'}</div>`;
                row += `<div class="preview-cell">${item.stats?.maxHealth ? '+' + item.stats.maxHealth : '-'}</div>`;
                row += `<div class="preview-cell">${item.speed !== undefined ? item.speed.toFixed(1) + 's' : '-'}</div>`;
                return row;
            };

             previewHTML += formatRow("Item 1", item1);
             previewHTML += formatRow("Item 2", item2);
             previewHTML += formatRow("Forge", previewItem);

             previewHTML += `</div>`; 
             forgePreview.innerHTML = previewHTML;
             forgePreview.classList.remove('hidden'); 
        } else {
            forgePreview.innerHTML = `<div class="item-desc-text">${validationMessage}</div>`;
            forgePreview.classList.remove('hidden');
        }
    }

     handleForgeItems() {
         const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
         if (!hasHammer) {
             this.game.addLog("You need a Blacksmith Hammer to forge items!");
             return;
         }

         const slot1 = document.getElementById('forge-slot-1');
         const slot2 = document.getElementById('forge-slot-2');

         const item1DataString = slot1?.dataset.itemData;
         const item2DataString = slot2?.dataset.itemData;

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

          const forgeButton = document.getElementById('forge-button');
          const leaveButton = document.getElementById('blacksmith-leave-button');
          if (forgeButton) forgeButton.disabled = true;
          if (leaveButton) leaveButton.disabled = true; 

         this.clearForgeSlot(1, false); 
         this.clearForgeSlot(2, false); 

          this.game.addLog(`The Blacksmith forges your ${item1.name} and ${item2.name} into a ${forgedItem.name}!`);
          this.updateForgeButton(); 
          this.ui.renderInventory();
          this.ui.renderEquipment();

          const blacksmithArea = document.getElementById('blacksmith-area');
          if (blacksmithArea) {
              blacksmithArea.classList.add('upgrade-success-flash');
              setTimeout(() => {
                  blacksmithArea.classList.remove('upgrade-success-flash');
                   if (leaveButton) leaveButton.disabled = false;
                   this.ui.clearMainArea();
                   this.game.proceedToNextRound();
              }, 500);
          } else {
               this.ui.clearMainArea();
               this.game.proceedToNextRound();
          }
     }

      previewForgedItem(item1, item2) {
        item1.baseId = item1.baseId || item1.id.replace(/_forged.*|_upgraded_\d+/, '');
        item2.baseId = item2.baseId || item2.id.replace(/_forged.*|_upgraded_\d+/, '');

         if (!item1 || !item2 || item1.baseId !== item2.baseId) {
             return null;
         }
          const baseId = item1.baseId;
          const baseTemplate = ITEMS[baseId];
          if (!baseTemplate) {
              console.error("Base template not found for ID:", baseId);
              return null;
          }

            const newStats = {
                attack: (item1.stats?.attack || 0) + (item2.stats?.attack || 0),
                defense: (item1.stats?.defense || 0) + (item2.stats?.defense || 0),
                maxHealth: (item1.stats?.maxHealth || 0) + (item2.stats?.maxHealth || 0)
            };

            const outputIsReinforced = item1.isReinforced || item2.isReinforced;
            const outputIsFortified = item1.isFortified || item2.isFortified;
            const outputIsSharpened = item1.isSharpened || item2.isSharpened;
            const outputIsHoned = item1.isHoned || item2.isHoned;

         let namePrefix = "Forged";
         if (outputIsSharpened) namePrefix += " Sharpened";
         if (outputIsHoned) namePrefix += " Honed";
         if (outputIsReinforced) namePrefix += " Reinforced";
         if (outputIsFortified) namePrefix += " Fortified";
         const newName = `${namePrefix} ${baseTemplate.name}`;

         let finalSpeed = baseTemplate.speed; 
         if(outputIsHoned) {
            finalSpeed = Math.max(0.1, (baseTemplate.speed ?? this.game.player.defaultAttackSpeed) - 0.5);
         }

         let description = `Two ${baseTemplate.name} forged together.\n`;
         if (newStats.attack > (baseTemplate.stats?.attack || 0)) description += `Attack: +${newStats.attack}\n`;
         else if (baseTemplate.stats?.attack) description += `Attack: +${baseTemplate.stats.attack}\n`; 

         if (newStats.defense > (baseTemplate.stats?.defense || 0)) description += `Defense: +${newStats.defense}\n`;
         else if (baseTemplate.stats?.defense) description += `Defense: +${baseTemplate.stats.defense}\n`;

         if (newStats.maxHealth > (baseTemplate.stats?.maxHealth || 0)) description += `Max HP: +${newStats.maxHealth}\n`;
         else if (baseTemplate.stats?.maxHealth) description += `Max HP: +${baseTemplate.stats.maxHealth}\n`;

          if (finalSpeed !== undefined) description += `Speed: ${finalSpeed.toFixed(1)}s\n`;
          if (baseTemplate.hands) description += `${baseTemplate.hands}-Handed\n`;

         if (outputIsSharpened) description += "Sharpened (+Atk)\n";
         if (outputIsHoned) description += "Honed (-Speed)\n";
         if (outputIsReinforced) description += "Reinforced (+Def)\n";
         if (outputIsFortified) description += "Fortified (+HP)\n";

          const forgedItem = {
              id: `${baseId}_forged_${Date.now()}`, 
              baseId: baseId,
              name: newName,
              type: item1.type,
              slot: item1.slot,
              stats: newStats,
              speed: finalSpeed,
              hands: baseTemplate.hands,
              isForged: true,
              isSharpened: outputIsSharpened,
              isHoned: outputIsHoned,
              isReinforced: outputIsReinforced,
              isFortified: outputIsFortified,
              description: description.trim(),
               value: Math.floor((item1.value + item2.value) * 1.1) 
          };
           return forgedItem;
      }

}
