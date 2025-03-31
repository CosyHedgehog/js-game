class Loot {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle(loot) {
        this.ui.clearMainArea();
        // Convert gold into a loot item format for consistent display
        const allDisplayableLoot = [];
        if (loot.gold > 0) {
            allDisplayableLoot.push({
                id: 'gold', // Use 'gold' as a special ID
                name: `${loot.gold} Gold`,
                description: "Precious golden coins.",
                type: "gold",
                amount: loot.gold,
                looted: false // Gold isn't 'looted' in the same way as items initially
            });
        }
        if (loot.items) {
            // Only show unlooted items
            allDisplayableLoot.push(...loot.items.filter(item => !item.looted));
        }

        // Add description box to the layout
        this.ui.lootArea.innerHTML = `
                <h3>Loot Found!</h3>
                <div class="loot-display-area"> 
                    <div id="loot-items" class="loot-items-container">
                        <!-- Items will be added here -->
                    </div>
                    <div id="loot-item-description" class="item-description">
                        Click an item to see its description.
                    </div>
                </div>
                <div class="loot-buttons">
                    ${allDisplayableLoot.length > 0 ?
                '<button id="loot-take-all-button">Take All</button>' : ''
            }
                    <button id="loot-continue-button">Continue</button>
                </div>
            `;

        // Display all loot items (including gold) in a consistent format
        const lootItemsContainer = this.ui.lootArea.querySelector('#loot-items');
        const descriptionBox = this.ui.lootArea.querySelector('#loot-item-description'); // Cache description box

        if (lootItemsContainer && descriptionBox) {
            if (allDisplayableLoot.length === 0) {
                lootItemsContainer.innerHTML = '<p class="loot-empty-message">Nothing left to take.</p>';
                descriptionBox.textContent = ''; // Clear description if nothing to show
            }

            allDisplayableLoot.forEach((item, displayIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('loot-item');
                // Store the original index if it's a real item, or -1 for gold
                const originalItemIndex = item.type === 'gold' ? -1 : loot.items.findIndex(lootItem => lootItem === item);
                itemDiv.dataset.originalIndex = originalItemIndex;
                itemDiv.dataset.type = item.type || 'item';
                itemDiv.dataset.displayIndex = displayIndex; // Keep track of the displayed order index

                itemDiv.innerHTML = `
                        <div class="loot-item-info">
                            <span class="loot-item-icon">${item.spritePath ? '' : 'I'}</span>
                            <span class="loot-item-name">${item.name}</span>
                        </div>
                        <button class="loot-item-button">Take</button>
                    `;

                // Add tooltip functionality (on name span)
                const nameSpan = itemDiv.querySelector('.loot-item-name');
                nameSpan.addEventListener('mouseenter', (e) => this.showTooltip(item.description || 'No description', this.itemTooltip, e));
                nameSpan.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));

                // Add take button listener
                const takeButton = itemDiv.querySelector('.loot-item-button');
                takeButton.onclick = (e) => {
                    e.stopPropagation(); // Prevent triggering the description update
                    if (item.type === 'gold') {
                        this.game.handleIndividualLoot('gold');
                    } else {
                        // Use the original index to find the item in game.pendingLoot.items
                        this.game.handleIndividualLoot('item', originalItemIndex);
                    }
                };

                // --- Add click listener for description ---
                itemDiv.addEventListener('click', () => {
                    // Remove selected class from all other items
                    lootItemsContainer.querySelectorAll('.loot-item').forEach(div => div.classList.remove('selected'));
                    // Add selected class to this item
                    itemDiv.classList.add('selected');
                    // Update description box
                    descriptionBox.textContent = item.description || 'No description available.';
                });
                // ----------------------------------------

                lootItemsContainer.appendChild(itemDiv);
            });

            // --- Auto-select first item --- 
            if (allDisplayableLoot.length > 0) {
                const firstItemDiv = lootItemsContainer.querySelector('.loot-item');
                if (firstItemDiv) {
                    firstItemDiv.classList.add('selected');
                    descriptionBox.textContent = allDisplayableLoot[0].description || 'No description available.';
                }
            }
        }

        // Add button listeners
        const takeAllButton = this.ui.lootArea.querySelector('#loot-take-all-button');
        if (takeAllButton) {
            takeAllButton.onclick = () => this.game.collectLoot();
        }

        const continueButton = this.ui.lootArea.querySelector('#loot-continue-button');
        if (continueButton) {
            continueButton.onclick = () => this.game.continueLoot();
        }

        this.ui.lootArea.classList.remove('hidden');
    }
}
