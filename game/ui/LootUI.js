class LootUI {
    constructor(ui) { this.ui = ui; }

    render(lootItems, goldAmount) {
        this.ui.clearMainArea(); this.ui.lootArea.innerHTML = ''; this.ui.lootArea.classList.remove('hidden');

        let lootHTML = `<h3>Loot Dropped</h3>`;
        const lootDisplayArea = document.createElement('div');
        lootDisplayArea.className = 'loot-display-area';

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'loot-items-container';

        const descriptionBox = document.createElement('div');
        descriptionBox.id = 'loot-item-description';
        descriptionBox.textContent = 'Hover over an item to see details.';

        if (goldAmount > 0) {
            const goldContainer = document.createElement('div');
            goldContainer.className = 'loot-gold-container';
            goldContainer.innerHTML = `<span><i class="fas fa-coins"></i> Gold: ${goldAmount}</span>`;
            const takeGoldButton = document.createElement('button');
            takeGoldButton.textContent = 'Take Gold';
            takeGoldButton.className = 'loot-gold-button';
            takeGoldButton.onclick = () => {
                this.ui.game.player.addGold(goldAmount);
                this.ui.game.addLog(`Took ${goldAmount} gold.`);
                goldContainer.remove(); this.ui.updatePlayerStats();
            };
            goldContainer.appendChild(takeGoldButton);
            itemsContainer.appendChild(goldContainer);
        }

        if (lootItems.length === 0 && goldAmount <= 0) {
            itemsContainer.innerHTML += '<p class="loot-empty-message">No loot dropped.</p>';
        } else {
            lootItems.forEach((item, index) => {
                if (!item) return; const itemElement = document.createElement('div');
                itemElement.className = 'loot-item';
                itemElement.dataset.lootIndex = index;
                itemElement.innerHTML = `
                        <span>${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                        <button class="loot-item-button">Take</button>
                    `;

                itemElement.addEventListener('mouseenter', () => {
                    descriptionBox.textContent = item.description || 'No description available.';
                    itemElement.classList.add('selected');
                });
                itemElement.addEventListener('mouseleave', () => {
                    itemElement.classList.remove('selected');
                });

                const takeButton = itemElement.querySelector('.loot-item-button');
                takeButton.onclick = (event) => {
                    event.stopPropagation(); const added = this.ui.game.player.addItem(item);
                    if (added) {
                        this.ui.game.addLog(`Took ${item.name}.`);
                        itemElement.remove(); this.ui.renderInventory(); if (descriptionBox.textContent === (item.description || 'No description available.')) {
                            descriptionBox.textContent = 'Hover over an item to see details.';
                        }
                    } else {
                        this.ui.game.addLog('Inventory is full!');
                    }
                };
                itemsContainer.appendChild(itemElement);
            });
        }

        lootDisplayArea.appendChild(itemsContainer);
        lootDisplayArea.appendChild(descriptionBox);
        lootHTML += lootDisplayArea.outerHTML;
        lootHTML += `
                <div class="loot-buttons">
                    <button id="loot-take-all-button">Take All</button>
                    <button id="loot-continue-button">Continue</button>
                </div>
            `;

        this.ui.lootArea.innerHTML = lootHTML;

        document.getElementById('loot-take-all-button')?.addEventListener('click', () => this.ui.handleTakeAllLoot());
        document.getElementById('loot-continue-button')?.addEventListener('click', () => this.ui.game.proceedToNextRound());
    }
}

