class Loot {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle(loot) {
        this.ui.clearMainArea();
        const lootArea = this.ui.lootArea; // Reference the loot area element

        // Check for existing locked height for this loot interaction
        const lockedHeight = lootArea.dataset.lockedHeight;
        if (lockedHeight) {
            lootArea.style.height = lockedHeight;
        } else {
            // Reset height to auto initially if no lock is set
            lootArea.style.height = 'auto';
        }

        const allDisplayableLoot = [];
        let unlootedGoldAmount = 0;
        if (loot.gold > 0) {
            unlootedGoldAmount = loot.gold;
            allDisplayableLoot.push({
                id: 'gold',
                name: `${loot.gold} Gold`,
                description: "Precious golden coins.",
                type: "gold",
                amount: loot.gold,
                looted: false
            });
        }

        const unlootedItems = loot.items ? loot.items.filter(item => !item.looted) : [];
        allDisplayableLoot.push(...unlootedItems);

        // --- Determine if height should be locked --- (Do this BEFORE rendering innerHTML)
        let shouldLockHeight = false;
        if (!lockedHeight) { // Only check if height isn't already locked
            const initialItemCount = (loot.gold > 0 ? 1 : 0) + (loot.items ? loot.items.length : 0);
            if (initialItemCount >= 1) {
                shouldLockHeight = true;
            }
        }
        // --- End height lock determination ---

        const freeSlots = this.game.player.inventory.filter(slot => slot === null).length;
        const canTakeAnyItem = freeSlots > 0;
        const hasLootableItems = unlootedItems.length > 0;
        const hasLootableGold = unlootedGoldAmount > 0;
        const canTakeAll = (hasLootableGold || (hasLootableItems && canTakeAnyItem));

        lootArea.innerHTML = `
            <h3>Loot Found! (${allDisplayableLoot.length})</h3>
            <div class="loot-display-area"> 
                <div id="loot-items" class="loot-items-container">
                    <!-- Items will be added here -->
                </div>
                <div id="loot-item-description" class="item-description">
                    Hover over an item to see its description.
                </div>
            </div>
            <div class="loot-buttons">
                ${allDisplayableLoot.length > 0 ?
            `<button id="loot-take-all-button" ${!canTakeAll ? 'disabled' : ''}>Take All</button>` : ''
        }
                <button id="loot-continue-button">Continue</button>
            </div>
        `;

        const lootItemsContainer = lootArea.querySelector('#loot-items');
        const descriptionBox = lootArea.querySelector('#loot-item-description');

        if (lootItemsContainer && descriptionBox) {
            if (allDisplayableLoot.length === 0) {
                lootItemsContainer.innerHTML = '<p class="loot-empty-message">Nothing left to take.</p>';
                descriptionBox.textContent = '';
            } else {
                 descriptionBox.textContent = 'Hover over an item to see details.';
            }

            allDisplayableLoot.forEach((item, displayIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('loot-item');
                const originalItemIndex = item.type === 'gold' ? -1 : (loot.items ? loot.items.findIndex(lootItem => lootItem === item) : -1);
                itemDiv.dataset.originalIndex = originalItemIndex;
                itemDiv.dataset.type = item.type || 'item';
                itemDiv.dataset.displayIndex = displayIndex;

                let takeButtonDisabled = false;
                if (item.type !== 'gold' && !canTakeAnyItem) {
                    takeButtonDisabled = true;
                }

                itemDiv.innerHTML = `
                        <div class="loot-item-info">
                            <span class="loot-item-name">${item.name}</span>
                        </div>
                        <button class="loot-item-button" ${takeButtonDisabled ? 'disabled' : ''}>Take</button>
                    `;

                const nameSpan = itemDiv.querySelector('.loot-item-name');
                nameSpan.addEventListener('mouseenter', (e) => this.ui.showTooltip(item.description || 'No description', this.ui.itemTooltip, e));
                nameSpan.addEventListener('mouseleave', () => this.ui.hideTooltip(this.ui.itemTooltip));

                const takeButton = itemDiv.querySelector('.loot-item-button');
                if (takeButton && !takeButtonDisabled) {
                     takeButton.onclick = (e) => {
                        e.stopPropagation();
                        if (item.type === 'gold') {
                            this.game.handleIndividualLoot('gold');
                        } else {
                             this.game.handleIndividualLoot('item', originalItemIndex);
                        }
                    };
                }

                itemDiv.addEventListener('mouseenter', () => {
                    descriptionBox.textContent = item.description || 'No description available.';
                });

                itemDiv.addEventListener('mouseleave', () => {
                    descriptionBox.textContent = 'Hover over an item to see details.';
                });

                lootItemsContainer.appendChild(itemDiv);
            });

            // --- Apply locked height if needed --- (AFTER rendering content)
            if (shouldLockHeight && !lockedHeight) {
                // Ensure layout is calculated before measuring
                requestAnimationFrame(() => {
                    const measuredHeight = lootArea.offsetHeight;
                    if (measuredHeight > 0) { // Ensure measurement is valid
                         lootArea.dataset.lockedHeight = measuredHeight + 'px';
                         lootArea.style.height = measuredHeight + 'px';
                         console.log(`Loot area height locked to: ${measuredHeight}px`); // Debug log
                    }
                 });
             }
        }

        const takeAllButton = lootArea.querySelector('#loot-take-all-button');
        if (takeAllButton && !takeAllButton.disabled) {
            takeAllButton.onclick = () => this.game.collectLoot();
        }
        const continueButton = lootArea.querySelector('#loot-continue-button');
        if (continueButton) {
            continueButton.onclick = () => this.game.continueLoot();
        }

        lootArea.classList.remove('hidden');
    }
}
