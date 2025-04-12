class InventoryUI {
    constructor(ui) {
        this.ui = ui;
    }

    render() {
        if (!this.ui.inventoryGrid) {
            console.error("UI Error: inventoryGrid not found during renderInventory.");
            return;
        }
        this.ui.inventoryGrid.innerHTML = '';
        this.ui.game.player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');
            slot.dataset.index = index;
            slot.addEventListener('dragover', (event) => {
                event.preventDefault();
                if (!slot.classList.contains('dragging')) {
                    slot.classList.add('drag-over');
                }
            });
            slot.addEventListener('dragenter', (event) => {
                event.preventDefault();
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const sourceIndex = event.dataTransfer.getData('text/plain');
                const targetIndex = slot.dataset.index;
                if (sourceIndex === null || sourceIndex === undefined || targetIndex === null || targetIndex === undefined || sourceIndex === targetIndex) return;
                this.ui.game.handleInventorySwap(sourceIndex, targetIndex);
            });

            // Clear previous dynamic elements first
            const existingSlimeTimer = slot.querySelector('.slime-timer-text');
            if (existingSlimeTimer) existingSlimeTimer.remove();
            const existingStunTimer = slot.querySelector('.stun-timer-text');
            if (existingStunTimer) existingStunTimer.remove();
            const existingChip = slot.querySelector('.equipped-slot-chip, .food-action-chip, .tool-action-chip, .potion-action-chip');
            if (existingChip) existingChip.remove();
            slot.innerHTML = ''; // Clear item name span potentially

            slot.classList.remove('slot-empty', 'slot-filled', 'dragging', 'equipped', 'food-stunned', 'item-stunned');
            slot.classList.remove('item-slimed');
            delete slot.dataset.isSlimed;
            delete slot.dataset.isItemStunned;

            if (item) {
                slot.classList.remove('slot-empty');
                slot.classList.add('slot-filled');
                const MAX_NAME_LENGTH = 18; let displayName = item.name;
                if (item.name.length > MAX_NAME_LENGTH) {
                    displayName = item.name.substring(0, MAX_NAME_LENGTH - 1) + '…';
                }
                const itemNameSpan = document.createElement('span');
                itemNameSpan.textContent = displayName;
                slot.appendChild(itemNameSpan);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-item-button');
                deleteBtn.textContent = '×';
                deleteBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.ui.game.requestItemDeletion(index);
                    this.ui.hideTooltip(this.ui.itemTooltip);
                });
                slot.appendChild(deleteBtn);

                slot.draggable = true;
                slot.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', index.toString());
                    event.dataTransfer.effectAllowed = 'move';
                    this.ui.draggedItemIndex = index;
                    this.ui.draggedItem = item;
                    setTimeout(() => slot.classList.add('dragging'), 0);
                    this.ui.hideTooltip(this.ui.itemTooltip); this.ui.hideTooltip(this.ui.equipTooltip);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                    this.ui.inventoryGrid.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                    this.ui.draggedItemIndex = null;
                    this.ui.draggedItem = null;
                });

                let originalClickHandler = null;
                let originalActionText = '';
                let isEquipped = false;
                for (const slotName in this.ui.game.player.equipment) {
                    if (this.ui.game.player.equipment[slotName] === index) {
                        isEquipped = true;
                        break;
                    }
                }

                if (this.ui.game.state === 'shop') {
                    const sellPrice = item.value || 0;
                    originalActionText = `[Sell: ${sellPrice} Gold]`;
                    originalClickHandler = (event) => {
                        event.stopPropagation();
                        this.ui.game.handleSellItem(index);
                        this.ui.createDamageSplat(`.inventory-slot[data-index="${index}"]`, sellPrice + "G", 'sell');
                        this.ui.hideTooltip(this.ui.itemTooltip);
                    };
                    slot.classList.add('shop-sellable');
                } else {
                    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'ring') {
                        originalActionText = isEquipped ? '[Unequip]' : '[Equip]';
                        originalClickHandler = (event) => {
                            event.stopPropagation();
                            if (isEquipped) {
                                this.ui.game.handleUnequipItem(index);
                            } else {
                                this.ui.game.handleEquipItem(index);
                            }
                            this.ui.hideTooltip(this.ui.itemTooltip);
                        };
                    } else if (item.type === 'consumable' && item.useAction) {
                        originalActionText = `[${item.useAction}]`;
                        originalClickHandler = (event) => {
                            event.stopPropagation();
                            this.ui.game.handleUseItem(index);
                            this.ui.hideTooltip(this.ui.itemTooltip);
                        };
                    } else {
                        originalActionText = '[No Action]';
                        slot.style.cursor = 'default';
                    }

                    let tooltipContent = '';
                    if (originalActionText) {
                        tooltipContent += `<div class="tooltip-action">${originalActionText}</div>`;
                    }
                    tooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                    tooltipContent += item.description || 'No description';

                    slot.addEventListener('mouseenter', (e) => {
                        let currentTooltipContent = '';
                        currentTooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                        currentTooltipContent += item.description || 'No description';

                        this.ui.showTooltip(currentTooltipContent.replace(/\n/g, '<br>'), this.ui.itemTooltip, e);
                    });

                    if (this.ui.game.state === 'blacksmith' && (item.type === 'weapon' || item.type === 'armor')) {
                        slot.classList.add('blacksmith-valid');
                    } else if (this.ui.game.state === 'armourer' && item.type === 'armor') {
                        slot.classList.add('armourer-valid');
                    } else if (this.ui.game.state === 'sharpen' && item.type === 'weapon') {
                        slot.classList.add('sharpen-valid');
                    }
                }

                let isSlimed = this.ui.game.player.slimedItems && this.ui.game.player.slimedItems[index] > 0;

                let isItemStunned = false;
                if (this.ui.game.state === 'combat' && this.ui.game.player.isStunned) {
                    isItemStunned = true;
                    slot.classList.add('item-stunned');
                    slot.style.cursor = 'default';
                    slot.dataset.isItemStunned = 'true';

                    // --- Add Stun Timer Text ---
                    const remainingStunTime = this.ui.game.player.pendingActionDelay;
                    const stunTimerElement = document.createElement('div');
                    stunTimerElement.classList.add('stun-timer-text');
                    stunTimerElement.textContent = remainingStunTime.toFixed(1) + 's';
                    slot.appendChild(stunTimerElement);
                    // --- End Stun Timer Text ---

                } else {
                    slot.classList.remove('item-stunned');
                    delete slot.dataset.isItemStunned;
                }

                slot.removeEventListener('mouseenter', slot._tooltipEnterHandler);
                slot.removeEventListener('mouseleave', slot._tooltipLeaveHandler);

                const enterHandler = (e) => {
                    let currentActionText = originalActionText;
                    if (slot.dataset.isItemStunned === 'true') {
                        currentActionText = "<span style='color: #ffd700;'>[Stunned!]</span>";
                    } else if (slot.dataset.isSlimed === 'true') {
                        const remainingTime = this.ui.game.player.slimedItems[index];
                        currentActionText = `<span style='color: #8BC34A;'>[Slimed! Cannot Use]</span>`;
                    }

                    let tooltipContent = '';
                    if (currentActionText) {
                        tooltipContent += `<div class="tooltip-action">${currentActionText}</div>`;
                    }
                    tooltipContent += `<div class="tooltip-item-name">${item.name}</div>`;
                    tooltipContent += item.description || 'No description';

                    this.ui.showTooltip(tooltipContent.replace(/\n/g, '<br>'), this.ui.itemTooltip, e);
                };
                const leaveHandler = () => {
                    this.ui.hideTooltip(this.ui.itemTooltip);
                };

                slot.addEventListener('mouseenter', enterHandler);
                slot.addEventListener('mouseleave', leaveHandler);
                slot._tooltipEnterHandler = enterHandler;
                slot._tooltipLeaveHandler = leaveHandler;

                slot.removeEventListener('click', slot._clickHandler);
                if (originalClickHandler && !isItemStunned && !isSlimed) {
                    slot.addEventListener('click', originalClickHandler);
                    slot._clickHandler = originalClickHandler; slot.style.cursor = 'pointer';
                } else {
                    slot.style.cursor = 'default';
                }

                if (isEquipped) {
                    slot.classList.add('equipped');
                    const chip = document.createElement('span');
                    chip.classList.add('equipped-slot-chip');
                    for (const slotName in this.ui.game.player.equipment) {
                        if (this.ui.game.player.equipment[slotName] === index) {
                            chip.textContent = slotName;
                            break;
                        }
                    }
                    slot.appendChild(chip);
                } else {
                    slot.classList.remove('equipped');
                    const existingChip = slot.querySelector('.equipped-slot-chip, .food-action-chip, .tool-action-chip, .potion-action-chip');
                    if (existingChip) existingChip.remove();

                    if (item.type === 'consumable' && item.useAction === 'Eat') {
                        const foodChip = document.createElement('span');
                        foodChip.classList.add('food-action-chip');
                        foodChip.textContent = 'Food';
                        slot.appendChild(foodChip);
                    } else if (item.type === 'tool') {
                        const toolChip = document.createElement('span');
                        toolChip.classList.add('tool-action-chip');
                        toolChip.textContent = 'Tool';
                        slot.appendChild(toolChip);
                    } else if (item.type === 'consumable' && item.isPotion) {
                        const potionChip = document.createElement('span');
                        potionChip.classList.add('potion-action-chip');
                        potionChip.textContent = 'Potion';
                        slot.appendChild(potionChip);
                    }
                }

                if (isSlimed) {
                    slot.classList.add('item-slimed');
                    slot.dataset.isSlimed = 'true';
                    if (slot._clickHandler) {
                        slot.removeEventListener('click', slot._clickHandler);
                        delete slot._clickHandler;
                    }

                    // --- Add Timer Text --- 
                    const remainingTime = this.ui.game.player.slimedItems[index];
                    const timerTextElement = document.createElement('div');
                    timerTextElement.classList.add('slime-timer-text');
                    timerTextElement.textContent = remainingTime.toFixed(1) + 's';
                    slot.appendChild(timerTextElement);
                    // --- End Timer Text --- 
                }

            } else {
                slot.textContent = '';
                slot.classList.add('slot-empty');
                slot.draggable = false;
            }
            this.ui.inventoryGrid.appendChild(slot);
        });
    }
}
