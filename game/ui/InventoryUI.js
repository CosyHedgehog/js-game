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

            slot.classList.remove('slot-empty', 'slot-filled', 'dragging', 'equipped', 'food-stunned');

            if (item) {
                slot.classList.remove('slot-empty');
                slot.classList.add('slot-filled');
                const MAX_NAME_LENGTH = 18; let displayName = item.name;
                if (item.name.length > MAX_NAME_LENGTH) {
                    displayName = item.name.substring(0, MAX_NAME_LENGTH - 1) + '…';
                }
                slot.textContent = displayName;
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
                    if (item.type === 'weapon' || item.type === 'armor') {
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
                        // if (currentActionText) {
                        //     currentTooltipContent += `<div class="tooltip-action">${currentActionText}</div>`;
                        // }
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

                let isStunnedAndFood = false;
                if (this.ui.game.state === 'combat' && this.ui.game.player.isStunned && item.useAction === 'Eat') {
                    isStunnedAndFood = true;
                    slot.classList.add('food-stunned');
                    slot.style.cursor = 'default'; slot.dataset.isStunnedFood = 'true';
                } else {
                    slot.classList.remove('food-stunned');
                    delete slot.dataset.isStunnedFood;
                }

                slot.removeEventListener('mouseenter', slot._tooltipEnterHandler);
                slot.removeEventListener('mouseleave', slot._tooltipLeaveHandler);

                const enterHandler = (e) => {
                    let currentActionText = originalActionText;
                    if (slot.dataset.isStunnedFood === 'true') {
                        currentActionText = "[You are stunned!]";
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

                slot.removeEventListener('click', slot._clickHandler); if (originalClickHandler && !isStunnedAndFood) {
                    slot.addEventListener('click', originalClickHandler);
                    slot._clickHandler = originalClickHandler; slot.style.cursor = 'pointer';
                } else if (!isStunnedAndFood) {
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

            } else {
                slot.textContent = '';
                slot.classList.add('slot-empty');
                slot.draggable = false;
            }
            this.ui.inventoryGrid.appendChild(slot);
        });
    }
}
