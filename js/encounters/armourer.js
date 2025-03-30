ENCOUNTERS.armourer = {
    getText: () => "Visit Armourer",
    getDetails: () =>
        "You find an Armourer's tools that can enhance armor.\\n" +
        "Select one piece of armor to permanently increase its defense by 1.\\n\\n" +
        "Use the Armourer's tools?",
    handle: (game, ui) => {
        game.state = 'armourer';
        game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        // Instead of ui.showArmourerUI(), call the local method
        ENCOUNTERS.armourer.displayUI(game, ui);
    },
    displayUI: (game, ui) => {
        ui.clearMainArea();
        const mainContent = document.getElementById('main-content');

        const armourerArea = document.createElement('div');
        armourerArea.id = 'armourer-area'; // Keep the ID for styling and clearing

        const slotContainer = document.createElement('div');
        slotContainer.className = 'armourer-container';

        const armorSlot = document.createElement('div');
        armorSlot.className = 'armourer-slot';
        armorSlot.innerHTML = `
            <div class="armourer-slot-label">Select Armor</div>
            <div class="armourer-slot-content">Click to choose</div>
        `;
        // Call local method for selection
        armorSlot.onclick = () => ENCOUNTERS.armourer.showItemSelection(game, ui, armorSlot);

        const previewArea = document.createElement('div');
        previewArea.id = 'armourer-preview';
        previewArea.textContent = 'Select armor to preview enhancement';

        const enhanceButton = document.createElement('button');
        enhanceButton.id = 'armourer-button';
        enhanceButton.textContent = 'Enhance Armor (+1 Defense)';
        enhanceButton.disabled = true;
        // Call local method for enhancement
        enhanceButton.onclick = () => ENCOUNTERS.armourer.handleEnhancement(game, ui, armorSlot);

        const leaveButton = document.createElement('button');
        leaveButton.id = 'armourer-leave-button'; // Keep ID for potential styling
        leaveButton.textContent = 'Leave';
        // Call local method for leaving
        leaveButton.onclick = () => ENCOUNTERS.armourer.handleLeave(game, ui);

        slotContainer.appendChild(armorSlot);
        armourerArea.appendChild(slotContainer);
        armourerArea.appendChild(previewArea);
        armourerArea.appendChild(enhanceButton);
        armourerArea.appendChild(leaveButton);

        mainContent.appendChild(armourerArea);
    },
    showItemSelection: (game, ui, targetSlotElement) => {
        const armors = game.player.inventory.filter((item) => {
            return item && item.type === 'armor';
        });

        // Remove any existing menu first
        document.querySelector('.armourer-selection-menu')?.remove();

        const menu = document.createElement('div');
        menu.classList.add('armourer-selection-menu'); // Use existing class for styling

        if (armors.length === 0) {
            const noItemsMsg = document.createElement('div');
            noItemsMsg.textContent = 'No armor in inventory';
            noItemsMsg.style.padding = '10px';
            menu.appendChild(noItemsMsg);
        } else {
            armors.forEach(item => {
                const itemButton = document.createElement('button');
                itemButton.classList.add('armourer-item-option'); // Use existing class
                itemButton.textContent = `${item.name} (${ENCOUNTERS.armourer.getItemStats(item)})`;
                const inventoryIndex = game.player.inventory.indexOf(item);
                // Call local method on selection
                itemButton.onclick = () => ENCOUNTERS.armourer.selectItem(game, ui, item, inventoryIndex, targetSlotElement);
                menu.appendChild(itemButton);
            });
        }

        // Position and show menu relative to the target slot
        const rect = targetSlotElement.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        document.body.appendChild(menu);

        // Click outside to close logic
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !targetSlotElement.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu, true); // Use capture phase
            }
        };
        // Use capture phase for the listener to catch clicks before they bubble up
        document.addEventListener('click', closeMenu, true);
    },
    selectItem: (game, ui, item, inventoryIndex, targetSlotElement) => {
        targetSlotElement.dataset.itemIndex = inventoryIndex; // Store index in dataset
        targetSlotElement.querySelector('.armourer-slot-content').textContent = item.name;

        const previewArea = document.getElementById('armourer-preview');
        const currentDefense = item.stats?.defense || 0;
        const newDefense = currentDefense + 1;
        previewArea.textContent = `${item.name} → Defense: ${currentDefense} → ${newDefense}`;

        const enhanceButton = document.getElementById('armourer-button');
        if (enhanceButton) {
            enhanceButton.disabled = false;
        }

        document.querySelector('.armourer-selection-menu')?.remove(); // Clean up menu
    },
    handleEnhancement: (game, ui, targetSlotElement) => {
        const itemIndex = parseInt(targetSlotElement.dataset.itemIndex);
        if (isNaN(itemIndex)) {
            game.addLog("No item selected.");
            return;
        }

        const item = game.player.inventory[itemIndex];

        if (!item || item.type !== 'armor') {
            game.addLog("Invalid item selected for enhancement.");
            return;
        }

        // Ensure stats object exists
        if (!item.stats) {
            item.stats = {};
        }
        // Ensure defense property exists and initialize if necessary
        if (typeof item.stats.defense !== 'number') {
            item.stats.defense = 0;
        }

        item.stats.defense += 1;
        item.name = `Reinforced ${item.name.replace(/^Reinforced /, '')}`; // Avoid double prefix
        // Update description (handle existing value or create if missing)
        const defenseStatString = `Defense: +${item.stats.defense}`;
        if (item.description?.includes('Defense: +')) {
            item.description = item.description.replace(/Defense: \+\d+/, defenseStatString);
        } else {
             item.description = (item.description ? item.description + '\\n' : '') + defenseStatString;
        }

        game.addLog(`Enhanced ${item.name}! Defense increased by 1.`);
        ui.renderInventory(); // Update the main inventory display
        ui.updatePlayerStats(); // Update stats display if needed

        // Clean up and proceed
        ui.clearMainArea(); // This will remove the #armourer-area
        game.proceedToNextRound();
    },
    handleLeave: (game, ui) => {
        game.addLog("You leave without using the Armourer's tools.");
        ui.clearMainArea(); // This will remove the #armourer-area
        game.proceedToNextRound();
    },
    getItemStats: (item) => {
        const stats = [];
        if (item?.stats?.attack) stats.push(`Atk: ${item.stats.attack}`);
        if (item?.stats?.defense) stats.push(`Def: ${item.stats.defense}`);
        if (item?.speed) stats.push(`Spd: ${item.speed}s`);
        return stats.join(', ');
    }
} 