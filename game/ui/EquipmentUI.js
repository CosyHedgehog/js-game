class EquipmentUI {
    constructor(ui) { this.ui = ui; }

    render() {
        const mainContainer = document.getElementById('equipment-text-display');
        if (!mainContainer) {
            console.error("EquipmentUI Error: Main container #equipment-text-display not found.");
            return;
        }
        mainContainer.innerHTML = ''; // Clear previous content
        mainContainer.classList.add('equipment-panel-grid'); // Add a class for grid styling

        const slotOrder = ['weapon', 'shield', 'body', 'legs', 'helm', 'ring']; // New order for 2x3 grid

        for (const slotName of slotOrder) {
            if (!this.ui.game.player.equipment.hasOwnProperty(slotName)) {
                console.warn(`EquipmentUI: Player equipment data does not have slot: ${slotName}`);
                continue;
            }

            const equipmentSlotDiv = document.createElement('div');
            equipmentSlotDiv.classList.add('equipment-panel-slot');
            equipmentSlotDiv.dataset.slotName = slotName;

            const spriteHolderDiv = document.createElement('div');
            spriteHolderDiv.classList.add('equipment-sprite-holder');

            const labelDiv = document.createElement('div');
            labelDiv.classList.add('equipment-slot-text-label');
            labelDiv.textContent = slotName.charAt(0).toUpperCase() + slotName.slice(1);

            const unequipButton = document.createElement('button');
            unequipButton.classList.add('unequip-button'); // Keep existing class for base styles
            unequipButton.dataset.slot = slotName;
            unequipButton.textContent = '×';
            unequipButton.classList.add('hidden'); // Hidden by default
            
            const equippedItemIndex = this.ui.game.player.equipment[slotName];
            let itemDescription = ''; // For tooltip
            let isSlotDisabledBy2H = false;

            // Check if this is the shield slot and if a 2H weapon is equipped
            if (slotName === 'shield') {
                const weaponIndex = this.ui.game.player.equipment['weapon'];
                if (weaponIndex !== null && this.ui.game.player.inventory[weaponIndex]) {
                    const currentWeapon = this.ui.game.player.inventory[weaponIndex];
                    if (currentWeapon.hands === 2) {
                        isSlotDisabledBy2H = true;
                        equipmentSlotDiv.classList.add('slot-disabled-by-2h');
                        spriteHolderDiv.classList.add('empty'); // Ensure it looks empty
                        itemDescription = 'Shield slot disabled (2H Weapon)';
                    }
                }
            }

            if (!isSlotDisabledBy2H && equippedItemIndex !== null && this.ui.game.player.inventory[equippedItemIndex]) {
                const item = this.ui.game.player.inventory[equippedItemIndex];
                itemDescription = `<b>${item.name}</b>`;
                if (item.stats) {
                    const statsText = Object.entries(item.stats)
                        .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`)
                        .join('<br>');
                    if (statsText) itemDescription += `<br>${statsText}`;
                }

                if (window.itemSprites && window.itemSprites[item.name]) {
                    let spriteSpecificClass = '';
                    if (item.type === 'weapon') spriteSpecificClass = 'weapon-svg';
                    else if (item.type === 'armor') spriteSpecificClass = 'armor-svg';
                    else if (item.type === 'ring') spriteSpecificClass = 'ring-svg';
                    
                    spriteHolderDiv.innerHTML = `<div class="${spriteSpecificClass}">${window.itemSprites[item.name]}</div>`;
                } else {
                    spriteHolderDiv.textContent = item.name.substring(0, 3); // Fallback, e.g., 'Swd'
                    spriteHolderDiv.classList.add('equipment-slot-text-fallback');
                }
                equipmentSlotDiv.classList.add('equipped');
                unequipButton.classList.remove('hidden');
                unequipButton.onclick = (e) => {
                    e.stopPropagation();
                    this.ui.game.handleUnequipItem(equippedItemIndex);
                    this.ui.hideTooltip(this.ui.equipTooltip);
                };
            } else if (!isSlotDisabledBy2H) { // Only process as empty if not disabled by 2H
                itemDescription = `${slotName.charAt(0).toUpperCase() + slotName.slice(1)}: Slot Empty`;
                spriteHolderDiv.classList.add('empty'); 
                // Optionally add placeholder text/icon via CSS or here
                // spriteHolderDiv.textContent = '?'; 
            }

            equipmentSlotDiv.onmouseenter = (e) => this.ui.showTooltip(itemDescription, this.ui.equipTooltip, e);
            equipmentSlotDiv.onmouseleave = () => this.ui.hideTooltip(this.ui.equipTooltip);

            equipmentSlotDiv.appendChild(spriteHolderDiv);
            equipmentSlotDiv.appendChild(labelDiv);
            equipmentSlotDiv.appendChild(unequipButton);
            mainContainer.appendChild(equipmentSlotDiv);
        }
    }
}
