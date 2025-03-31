class Loot {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle(loot) {
        this.ui.clearMainArea();
        const allDisplayableLoot = [];
        if (loot.gold > 0) {
            allDisplayableLoot.push({
                id: 'gold',
                name: `${loot.gold} Gold`,
                description: "Precious golden coins.",
                type: "gold",
                amount: loot.gold,
                looted: false
            });
        }
        if (loot.items) {
            allDisplayableLoot.push(...loot.items.filter(item => !item.looted));
        }

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

        const lootItemsContainer = this.ui.lootArea.querySelector('#loot-items');
        const descriptionBox = this.ui.lootArea.querySelector('#loot-item-description');

        if (lootItemsContainer && descriptionBox) {
            if (allDisplayableLoot.length === 0) {
                lootItemsContainer.innerHTML = '<p class="loot-empty-message">Nothing left to take.</p>';
                descriptionBox.textContent = '';
            }

            allDisplayableLoot.forEach((item, displayIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('loot-item');
                const originalItemIndex = item.type === 'gold' ? -1 : loot.items.findIndex(lootItem => lootItem === item);
                itemDiv.dataset.originalIndex = originalItemIndex;
                itemDiv.dataset.type = item.type || 'item';
                itemDiv.dataset.displayIndex = displayIndex;

                itemDiv.innerHTML = `
                        <div class="loot-item-info">
                            <span class="loot-item-icon">${item.spritePath ? '' : 'I'}</span>
                            <span class="loot-item-name">${item.name}</span>
                        </div>
                        <button class="loot-item-button">Take</button>
                    `;

                const nameSpan = itemDiv.querySelector('.loot-item-name');
                nameSpan.addEventListener('mouseenter', (e) => this.showTooltip(item.description || 'No description', this.itemTooltip, e));
                nameSpan.addEventListener('mouseleave', () => this.hideTooltip(this.itemTooltip));

                const takeButton = itemDiv.querySelector('.loot-item-button');
                takeButton.onclick = (e) => {
                    e.stopPropagation();
                    if (item.type === 'gold') {
                        this.game.handleIndividualLoot('gold');
                    } else {
                        this.game.handleIndividualLoot('item', originalItemIndex);
                    }
                };

                itemDiv.addEventListener('click', () => {
                    lootItemsContainer.querySelectorAll('.loot-item').forEach(div => div.classList.remove('selected'));
                    itemDiv.classList.add('selected');
                    descriptionBox.textContent = item.description || 'No description available.';
                });
                lootItemsContainer.appendChild(itemDiv);
            });

            if (allDisplayableLoot.length > 0) {
                const firstItemDiv = lootItemsContainer.querySelector('.loot-item');
                if (firstItemDiv) {
                    firstItemDiv.classList.add('selected');
                    descriptionBox.textContent = allDisplayableLoot[0].description || 'No description available.';
                }
            }
        }

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
