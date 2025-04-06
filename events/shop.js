class Shop {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    SHOP_NUM_ITEMS = 3;
    SHOP_REROLL_COST = 3;

    handle() {
        this.game.state = 'shop';
        this.game.addLog("You arrive at a small shop.");
        this.game.currentShopItems = this.generateShopItems(this.SHOP_NUM_ITEMS);
        this.game.shopCanReroll = true;
        this.ui.clearMainArea();
        this.ui.renderInventory(); 
        const shopArea = document.getElementById('shop-area');
        shopArea.classList.remove('hidden');

        let shopContent = `
            <h3>Shop</h3>
            <p class="shop-info">Sell your items from your inventory.</p>
            <div class="shop-content">
                <div class="shop-items-container">
        `;

        var items = this.game.currentShopItems;
        if (items && items.length > 0) {
            items.forEach((item, index) => {
                const isBought = item.bought === true;
                const canAfford = this.game.player.gold >= item.buyPrice;
                shopContent += `
                    <div class="shop-item ${isBought ? 'item-bought' : ''}" data-index="${index}">
                        <div class="shop-item-info">
                            <div class="shop-item-name">${item.name}</div>
                            <div class="shop-item-price">${item.buyPrice} gold</div>
                        </div>
                        <button class="shop-item-button" data-index="${index}" 
                                ${isBought || !canAfford ? 'disabled' : ''}>
                            ${isBought ? 'Bought' : 'Buy'}
                        </button>
                    </div>
                `;
            });
        } else {
            shopContent += '<p class="shop-empty-message">No items available.</p>';
        }

        shopContent += `
                </div>
                <div class="item-description"></div>
            </div>
            <button id="shop-leave-button" class="shop-leave-button">Leave Shop</button>
        `;

        shopArea.innerHTML = shopContent;

        const leaveButton = document.getElementById('shop-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => {
                this.ui.clearMainArea();
                this.game.proceedToNextRound();
            }
        }

        const buyButtons = document.querySelectorAll('.shop-item-button');
        buyButtons.forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.dataset.index);
                this.handleBuyItem(index);
            };
        });

        const shopItems = document.querySelectorAll('#shop-area .shop-item');
        shopItems.forEach((shopItem, index) => {
            shopItem.addEventListener('mouseenter', () => {
                const descriptionArea = document.querySelector('#shop-area .item-description');
                if (descriptionArea && items[index]) {
                    const name = items[index].name || 'Unknown Item';
                    const desc = items[index].description || 'No description available.';
                    descriptionArea.innerHTML = `
                        <div class="item-desc-name">${name}</div>
                        <div class="item-desc-text">${desc}</div>
                    `;
                }
            });
        });

        if (items && items.length > 0) {
            const firstShopItem = shopArea.querySelector('.shop-item[data-index="0"]');
            const descriptionArea = shopArea.querySelector('#shop-area .item-description');
            if (firstShopItem && descriptionArea) {
                firstShopItem.classList.add('selected');
                const name = items[0].name || 'Unknown Item';
                const desc = items[0].description || 'No description available.';
                descriptionArea.innerHTML = `
                    <div class="item-desc-name">${name}</div>
                    <div class="item-desc-text">${desc}</div>
                `;
            }
        }

        this.updateShopAffordability();
    }

    handleBuyItem(itemIndex) {
        if (this.game.state !== 'shop' || !this.game.currentShopItems || itemIndex < 0 || itemIndex >= this.game.currentShopItems.length) return;

        const item = this.game.currentShopItems[itemIndex];
        if (!item) return;

        if (this.game.player.gold < item.buyPrice) {
            this.game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
            return;
        }

        const freeSlot = this.game.player.findFreeInventorySlot();
        if (freeSlot === -1) {
            this.game.addLog("Your inventory is full!");
            return;
        }

        this.game.player.spendGold(item.buyPrice);
        this.game.player.addItem(item);
        this.game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);
        this.game.currentShopItems[itemIndex].bought = true;

        const shopItemsContainer = this.ui.shopArea.querySelector('.shop-items-container');
        const scrollPosition = shopItemsContainer ? shopItemsContainer.scrollTop : 0;

        const shopItemDiv = this.ui.shopArea.querySelector(`.shop-item[data-index="${itemIndex}"]`);
        if (shopItemDiv) {
            const buyButton = shopItemDiv.querySelector('.shop-item-button');
            if (buyButton) {
                buyButton.textContent = 'Bought';
                buyButton.disabled = true;
            }
            shopItemDiv.classList.add('item-bought');

        } else {
            console.warn("Shop item div not found for targeted update.");
        }

        if (shopItemsContainer) {
            shopItemsContainer.scrollTop = scrollPosition;
        }

        if (shopItemDiv) {
            this.updateShopAffordability();
        }

        this.ui.renderInventory();
        this.ui.updatePlayerStats();
    }

    updateShopAffordability() {
        const shopItems = this.ui.shopArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const index = parseInt(shopItemDiv.dataset.index);
            const item = this.game.currentShopItems[index];
            const buyButton = shopItemDiv.querySelector('.shop-item-button');

            if (item && buyButton) {
                const canAfford = this.game.player.gold >= item.buyPrice;
                buyButton.disabled = !canAfford;
            }
        });

        const rerollButton = document.getElementById('shop-reroll-button');
        if (rerollButton && this.game.shopCanReroll) {
            rerollButton.disabled = this.game.player.gold < this.SHOP_REROLL_COST;
        }
    }

    generateShopItems(count) {
        const numItems = this.game.getRandomInt(3, 8);
        const items = [];

        const itemTiers = {
            early: {
                items: [
                    'wooden_sword', 'rusty_sword', 'leather_helm', 'leather_armor',
                    'leather_legs', 'wooden_shield', 'bread', 'cooked_meat',
                    'health_potion', 'fishing_rod', 'blacksmith_hammer', 'thief_tools'
                ],
                weight: 70
            },
            mid: {
                items: [
                    'iron_sword', 'quick_dagger', 'iron_helm', 'iron_armor',
                    'iron_legs', 'iron_shield', 'health_potion'
                ],
                weight: 25
            },
            late: {
                items: [
                    'steel_sword', 'steel_greatsword', 'steel_helm', 'steel_armor',
                    'steel_legs', 'steel_shield', 'greater_health_potion'
                ],
                weight: 5
            }
        };

        const availableItems = new Set();

        while (availableItems.size < numItems) {
            const roll = Math.random() * 100;
            let selectedTier;
            let cumWeight = 0;

            for (const [tier, data] of Object.entries(itemTiers)) {
                cumWeight += data.weight;
                if (roll < cumWeight) {
                    selectedTier = data;
                    break;
                }
            }

            const tierItems = selectedTier.items;
            const randomItem = tierItems[this.game.getRandomInt(0, tierItems.length - 1)];

            if (!availableItems.has(randomItem)) {
                availableItems.add(randomItem);
            }
        }

        for (const itemId of availableItems) {
            const itemData = this.game.createItem(itemId);
            if (itemData) {
                itemData.buyPrice = Math.ceil(itemData.value * 1.3 + this.game.getRandomInt(0, Math.floor(itemData.value * 0.2)));
                items.push(itemData);
            }
        }

        return items;
    }

    handleRerollShop() {
        if (this.game.state !== 'shop' || !this.game.shopCanReroll) return;

        if (this.game.player.spendGold(this.SHOP_REROLL_COST)) {
            this.game.addLog(`You spend ${this.SHOP_REROLL_COST} gold to reroll the shop.`);
            this.game.currentShopItems = this.generateShopItems(this.SHOP_NUM_ITEMS);
            this.game.shopCanReroll = false;
            this.handle();
            this.ui.updatePlayerStats();
        } else {
            this.game.addLog(`Not enough gold to reroll (costs ${this.SHOP_REROLL_COST})!`);
        }
    }
}
