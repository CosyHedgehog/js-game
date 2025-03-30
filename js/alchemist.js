class Alchemist {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        this.game.state = 'alchemist';
        this.game.addLog("You find an Alchemist's shop, filled with mysterious potions.");

        const potionTiers = {
            common: {
                items: ['health_potion', 'attack_potion', 'defense_potion'],
                chance: 0.8 // 80% chance for common potions
            },
            rare: {
                items: ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion'],
                chance: 0.4 // 40% chance for greater potions
            },
            special: {
                items: ['speed_potion', 'greater_speed_potion'],
                chance: 0.3 // 30% chance for speed potion
            }
        };

        // Generate available stock
        const availableItems = [];

        // Check each tier and item
        Object.entries(potionTiers).forEach(([tier, { items, chance }]) => {
            items.forEach(itemId => {
                if (Math.random() < chance) {
                    const item = createItem(itemId);
                    if (item) {
                        // Alchemist charges more than regular shops
                        item.buyPrice = Math.ceil(item.value);
                        availableItems.push(item);
                    }
                }
            });
        });

        if (availableItems.length === 0) {
            const basicPotion = createItem('health_potion');
            basicPotion.buyPrice = Math.ceil(basicPotion.value);
            availableItems.push(basicPotion);
        }

        this.game.currentShopItems = availableItems;
        this.showAlchemistUI(availableItems);
    }

    showAlchemistUI(items) {
        const mainContent = document.getElementById('main-content');
        const alchemistArea = document.createElement('div');
        alchemistArea.id = 'alchemist-area';
        alchemistArea.innerHTML = `
            <h3>Alchemist's Shop</h3>
            <div class="shop-items-container">
                ${items.map((item, index) => {
            const isBought = item.bought === true;
            const canAfford = this.game.player.gold >= item.buyPrice;
            return `
                    <div class="shop-item ${isBought ? 'item-bought' : ''}" data-item-id="${item.id}">
                        <div class="shop-item-info">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-price">${item.buyPrice} gold</span>
                        </div>
                        <button class="shop-item-button" ${isBought || !canAfford ? 'disabled' : ''}>
                            ${isBought ? 'Bought' : 'Buy'}
                        </button>
                    </div>
                `}).join('')}
                ${items.length === 0 ? '<div class="shop-empty-message">No more potions available!</div>' : ''}
            </div>
            <div id="potion-description" class="potion-description">
                Click a potion to see its description
            </div>
            <div class="shop-buttons">
                <button id="alchemist-leave-button" class="shop-leave-button">Leave Shop</button>
            </div>
        `;

        // Clear existing alchemist area if it exists
        const existingArea = document.getElementById('alchemist-area');
        if (existingArea) {
            existingArea.remove();
        }

        mainContent.appendChild(alchemistArea);
        this.setupAlchemistEventListeners(items);

        // --- Auto-select first item --- 
        if (items && items.length > 0) {
            const firstItemDiv = alchemistArea.querySelector('.shop-item'); // First shop item element
            const descriptionBox = alchemistArea.querySelector('#potion-description');
            if (firstItemDiv && descriptionBox) {
                firstItemDiv.classList.add('selected');
                descriptionBox.textContent = items[0].description || 'No description available.';
            }
        }
    }

    setupAlchemistEventListeners(items) {
        // Add click listeners for potion descriptions
        const potionItems = document.querySelectorAll('.shop-item');
        const descriptionBox = document.getElementById('potion-description');

        potionItems.forEach(item => {
            const itemId = item.getAttribute('data-item-id');
            const itemData = ITEMS[itemId];

            item.addEventListener('click', () => {
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                    // Highlight the selected item
                    potionItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                }
            });
        });

        // Add buy button listeners
        const buyButtons = document.querySelectorAll('.shop-item-button');
        buyButtons.forEach((button, index) => {
            button.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering the description
                this.handleAlchemistBuy(index);
            };
        });

        // Add leave button listener
        const leaveButton = document.getElementById('alchemist-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => this.handleAlchemistLeave();
        }
    }
    handleAlchemistBuy(itemIndex) {
        if (!this.game || !this.game.currentShopItems || itemIndex >= this.game.currentShopItems.length) return;

        const item = this.game.currentShopItems[itemIndex];
        if (!item || item.bought) return; // Return if item not found or already bought

        // Check if player can afford it
        if (this.game.player.gold < item.buyPrice) {
            this.game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
            return;
        }

        // Check inventory space
        const freeSlot = this.game.player.findFreeInventorySlot();
        if (freeSlot === -1) {
            this.game.addLog("Your inventory is full!");
            return;
        }

        // Buy the item
        this.game.player.spendGold(item.buyPrice);
        this.game.player.addItem(item);
        this.game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);

        // Mark the item as bought instead of removing it
        this.game.currentShopItems[itemIndex].bought = true;

        // --- Targeted UI Update with Scroll Preservation ---
        const alchemistArea = document.getElementById('alchemist-area');
        let scrollPosition = 0;
        let itemsContainer = null;

        if (alchemistArea) {
            itemsContainer = alchemistArea.querySelector('.shop-items-container');
            if (itemsContainer) {
                scrollPosition = itemsContainer.scrollTop; // Save scroll position
            }

            const shopItemDiv = alchemistArea.querySelector(`.shop-item[data-item-id="${item.id}"]`);
            if (shopItemDiv) {
                const buyButton = shopItemDiv.querySelector('.shop-item-button');
                if (buyButton) {
                    buyButton.textContent = 'Bought';
                    buyButton.disabled = true;
                }
                shopItemDiv.classList.add('item-bought');

                // updateAlchemistAffordability will be called after restoring scroll
            } else {
                console.warn("Alchemist item div not found for targeted update.");
                // Fallback ONLY if absolutely necessary
                // this.showAlchemistUI(this.game.currentShopItems);
            }

            if (itemsContainer) {
                itemsContainer.scrollTop = scrollPosition; // Restore scroll position
            }
        } else {
            console.error("Alchemist area not found for update.");
            // Fallback ONLY if absolutely necessary
            // this.showAlchemistUI(this.game.currentShopItems);
        }
        // --- End Targeted UI Update ---

        // Update affordability after restoring scroll
        if (alchemistArea) {
            this.updateAlchemistAffordability(); // Call the helper function
        }

        this.ui.updatePlayerStats();
        this.ui.renderInventory();
    }
    // Helper function to update alchemist button states
    updateAlchemistAffordability() {
        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return;

        const shopItems = alchemistArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const itemId = shopItemDiv.dataset.itemId;
            // Find the corresponding item in the game data (assuming currentShopItems is accurate)
            const itemData = this.game.currentShopItems.find(item => item.id === itemId && !item.bought);
            const buyButton = shopItemDiv.querySelector('.shop-item-button');

            if (itemData && buyButton) {
                const canAfford = this.game.player.gold >= itemData.buyPrice;
                buyButton.disabled = !canAfford;
            }
        });
    }

    handleAlchemistLeave() {
        if (this.game) {
            this.ui.clearMainArea();
            this.game.proceedToNextRound();
        }
    }
}
