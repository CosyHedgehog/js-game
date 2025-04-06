class EquipmentUI {
    constructor(ui) { this.ui = ui; }

    render() {
        for (const slotName in this.ui.equipmentTextDisplay) {
            const parentPElement = this.ui.equipmentTextDisplay[slotName];
            if (!parentPElement) {
                console.warn(`UI renderEquipment: Parent <p> element reference missing for ${slotName}`);
                continue;
            }

            const labelSpan = parentPElement.querySelector('.equip-label');
            const unequipButton = parentPElement.querySelector(`.unequip-button[data-slot="${slotName}"]`);

            if (!labelSpan || !unequipButton) {
                console.warn(`UI renderEquipment: Label or Unequip button not found within parent P for ${slotName}`);
                continue;
            }

            const equippedItemIndex = this.ui.game.player.equipment[slotName];
            let itemDescription = '';
            let isEquipped = false;

            parentPElement.onmouseenter = null;
            parentPElement.onmouseleave = null;

            if (equippedItemIndex !== null && this.ui.game.player.inventory[equippedItemIndex]) {
                const item = this.ui.game.player.inventory[equippedItemIndex];
                const statsText = Object.entries(item.stats || {})
                    .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`)
                    .join('<br>');
                itemDescription = `<b>${item.name}</b><br>${statsText}`;
                isEquipped = true;

                parentPElement.onmouseenter = (e) => this.ui.showTooltip(itemDescription, this.ui.equipTooltip, e);
                parentPElement.onmouseleave = () => this.ui.hideTooltip(this.ui.equipTooltip);

                unequipButton.classList.remove('hidden');
                unequipButton.onclick = (e) => {
                    e.stopPropagation();
                    this.ui.game.handleUnequipItem(equippedItemIndex);
                    this.ui.hideTooltip(this.ui.equipTooltip);
                };
            } else {
                unequipButton.classList.add('hidden');
                unequipButton.onclick = null;

                const defaultText = "Slot empty - equip an item!";
                parentPElement.onmouseenter = (e) => this.ui.showTooltip(defaultText, this.ui.equipTooltip, e);
                parentPElement.onmouseleave = () => this.ui.hideTooltip(this.ui.equipTooltip);
            }

            if (isEquipped) {
                parentPElement.classList.add('equipped');
                labelSpan.classList.add('equipped');
            } else {
                parentPElement.classList.remove('equipped');
                labelSpan.classList.remove('equipped');
            }
        }
    }
}
