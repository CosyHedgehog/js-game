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
    }

    generateShopItems(count) {
        const numItems = this.game.getRandomInt(3, 8);
        const items = [];
        const currentRound = this.game.currentRound; // Get current round

        // Define item pools (as before)
        const itemPools = {
            early: [...COMMON_ITEMS, ...COMMON_TOOLS],
            mid: [...UNCOMMON_ITEMS, ...COMMON_TOOLS],
            late: [...RARE_ITEMS, ...COMMON_TOOLS]
        };

        // Get weights based on the current round
        const tierWeights = this.getTierWeights(currentRound);
        const totalWeight = Object.values(tierWeights).reduce((sum, weight) => sum + weight, 0); // Should be 100

        const availableItems = new Set();

        while (availableItems.size < numItems) {
            // Use the total weight calculated from the dynamic weights
            const roll = Math.random() * totalWeight;
            let selectedTierName;
            let cumWeight = 0;

            // Determine tier based on dynamic weights
            for (const [tierName, weight] of Object.entries(tierWeights)) {
                cumWeight += weight;
                if (roll < cumWeight) {
                    selectedTierName = tierName;
                    break;
                }
            }

            // Handle edge case if roll is very close to totalWeight
            if (!selectedTierName) {
                selectedTierName = 'late'; // Default to last tier
            }

            const tierItems = itemPools[selectedTierName];

            if (!tierItems || tierItems.length === 0) {
                console.warn(`Selected tier "${selectedTierName}" has no items. Skipping iteration.`);
                continue;
            }

            const randomItem = tierItems[this.game.getRandomInt(0, tierItems.length - 1)];

            if (ITEMS[randomItem] && !availableItems.has(randomItem)) {
                availableItems.add(randomItem);
            } else if (!ITEMS[randomItem]) {
                console.warn(`Item ID "${randomItem}" selected from tier arrays but not found in ITEMS data.`);
            }
        }

        // Create item instances (as before)
        for (const itemId of availableItems) {
             const itemData = this.game.createItem(itemId);
             if (itemData) {
                 const baseValue = itemData.value || 0;
                 itemData.buyPrice = Math.ceil(baseValue * 1.3 + this.game.getRandomInt(0, Math.floor(baseValue * 0.2)));
                 items.push(itemData);
             } else {
                  console.warn(`Failed to create item instance for ID: ${itemId}`);
             }
        }

        return items;
    }

    // Helper function to get weights based on round ranges (increments of 5)
    getTierWeights(round) {
        if (round <= 5) {
            // Rounds 1-5: Almost exclusively early
            return { early: 90, mid: 10, late: 0 };
        } else if (round <= 10) {
            // Rounds 6-10: Early focus, introduce mid
            return { early: 70, mid: 25, late: 5 };
        } else if (round <= 15) {
            // Rounds 11-15: Balanced early/mid, slight late chance
            return { early: 45, mid: 45, late: 10 };
        } else if (round <= 20) {
            // Rounds 16-20: Mid focus, growing late chance
            return { early: 20, mid: 55, late: 25 };
        } else if (round <= 25) {
            // Rounds 21-25: Mid/Late focus, less early
            return { early: 5, mid: 45, late: 50 };
        } else {
            // Rounds 26-30: Late focus, phasing out early
            return { early: 0, mid: 30, late: 70 };
        }
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

    // updateShopAffordability() {
    //     if (!this.game || this.game.state !== 'shop') return;
    //     const shopArea = document.getElementById('shop-area');
    //     if (!shopArea || shopArea.classList.contains('hidden')) return;

    //     const shopItems = shopArea.querySelectorAll('.shop-item:not(.item-bought)');
    //     shopItems.forEach(shopItemDiv => {
    //         const index = parseInt(shopItemDiv.dataset.index);
    //         if (isNaN(index) || !this.game.currentShopItems || !this.game.currentShopItems[index]) return;
    //         const item = this.game.currentShopItems[index];
    //         const buyButton = shopItemDiv.querySelector('.shop-item-button');

    //         if (item && buyButton) {
    //             const canAfford = this.game.player.gold >= item.buyPrice;
    //             buyButton.disabled = !canAfford;
    //         }
    //     });

    //     const rerollButton = document.getElementById('shop-reroll-button');
    //     if (rerollButton) {
    //         const canAffordReroll = this.game.player.gold >= 3; rerollButton.disabled = !this.game.shopCanReroll || !canAffordReroll;
    //     }
    // }
}
