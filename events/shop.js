class Shop {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    // Shop settings
    SHOP_NUM_ITEMS = 3;
    SHOP_REROLL_COST = 3;

    handle() {
        this.game.state = 'shop';
        this.game.addLog("You arrive at a small shop.");
        this.game.currentShopItems = this.generateShopItems(SHOP_NUM_ITEMS);
        this.game.shopCanReroll = true;
        this.ui.clearMainArea();
        const shopArea = document.getElementById('shop-area');
        shopArea.classList.remove('hidden');

        // Create shop content with updated structure and selling info
        let shopContent = `
            <h3>Shop</h3>
            <p class="shop-info">Right-click inventory items to sell them.</p>
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
            <div class="shop-buttons">
                <button id="shop-reroll-button" ${!this.game.canReroll || this.game.player.gold < SHOP_REROLL_COST ? 'disabled' : ''}>
                    Reroll (${SHOP_REROLL_COST} Gold)
                </button>
                <button id="shop-leave-button">Leave Shop</button>
            </div>
        `;

        shopArea.innerHTML = shopContent;

        // Add event listeners
        const rerollButton = document.getElementById('shop-reroll-button');
        const leaveButton = document.getElementById('shop-leave-button');

        if (rerollButton) {
            rerollButton.onclick = () => this.handleRerollShop();
        }
        if (leaveButton) {
            leaveButton.onclick = () => {
                this.ui.clearMainArea();
                this.game.proceedToNextRound();
            }
        }

        // Add click listeners to buy buttons
        const buyButtons = document.querySelectorAll('.shop-item-button');
        buyButtons.forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.dataset.index);
                this.handleBuyItem(index); 
            };
        });

        // Add click listeners to shop items for descriptions
        const shopItems = document.querySelectorAll('.shop-item');
        shopItems.forEach((shopItem, index) => {
            shopItem.addEventListener('click', () => {
                // Remove selected class from all items
                shopItems.forEach(item => item.classList.remove('selected'));
                // Add selected class to clicked item
                shopItem.classList.add('selected');
                // Update description
                const descriptionArea = document.querySelector('.item-description');
                if (descriptionArea && items[index]) {
                    descriptionArea.textContent = items[index].description || 'No description available.';
                }
            });
        });

        if (items && items.length > 0) {
            const firstShopItem = shopArea.querySelector('.shop-item[data-index="0"]');
            const descriptionArea = shopArea.querySelector('.item-description');
            if (firstShopItem && descriptionArea) {
                firstShopItem.classList.add('selected');
                descriptionArea.textContent = items[0].description || 'No description available.';
            }
        }

        this.updateShopAffordability();
    }
    
    handleBuyItem(itemIndex) {
        if (this.game.state !== 'shop' || !this.game.currentShopItems || itemIndex < 0 || itemIndex >= this.game.currentShopItems.length) return;
    
        const item = this.game.currentShopItems[itemIndex];
        if (!item) return; // Item might have been bought already
    
        // Check gold first
        if (this.game.player.gold < item.buyPrice) {
            this.game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
            return;
        }
    
        // Only check inventory space if they can afford it
        const freeSlot = game.player.findFreeInventorySlot();
        if (freeSlot === -1) {
            game.addLog("Your inventory is full!");
            return;
        }
    
        // If we get here, they can afford it and have space
        this.game.player.spendGold(item.buyPrice);
        this.game.player.addItem(item); // Add a *copy*
        this.game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);
        // Mark item as bought instead of removing it
        this.game.currentShopItems[itemIndex].bought = true;
        
        // --- Targeted UI Update with Scroll Preservation ---
        const shopItemsContainer = this.ui.shopArea.querySelector('.shop-items-container');
        const scrollPosition = shopItemsContainer ? shopItemsContainer.scrollTop : 0; // Save scroll position
        
        const shopItemDiv = this.ui.shopArea.querySelector(`.shop-item[data-index="${itemIndex}"]`);
        if (shopItemDiv) {
            const buyButton = shopItemDiv.querySelector('.shop-item-button');
            if (buyButton) {
                buyButton.textContent = 'Bought';
                buyButton.disabled = true;
            }
            shopItemDiv.classList.add('item-bought'); 
            
            // ui.updateShopAffordability(); // Removed for now, implement this later if needed
        } else {
            console.warn("Shop item div not found for targeted update.");
            // Re-render as fallback ONLY if absolutely necessary (ideally avoid)
            // ui.showShopUI(game.currentShopItems, game.shopCanReroll); 
        }
        
        if (shopItemsContainer) {
            shopItemsContainer.scrollTop = scrollPosition; // Restore scroll position
        }
        // --- End Targeted UI Update ---
    
        // Update affordability AFTER restoring scroll to potentially avoid jump
        if (shopItemDiv) {
            this.updateShopAffordability(); // Call the helper function
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
        
        // Update reroll button state too
        const rerollButton = document.getElementById('shop-reroll-button');
        if (rerollButton && this.game.shopCanReroll) {
            rerollButton.disabled = this.game.player.gold < SHOP_REROLL_COST;
        }
    }


    handleSellItem(inventoryIndex) {
        if (this.game.state !== 'shop') return; // Can only sell in shop
    
        const item = this.game.player.inventory[inventoryIndex];
        if (!item) return;
    
        const sellPrice = item.value || 0; // Use item's base value
        this.game.player.removeItem(inventoryIndex);
        this.game.player.addGold(sellPrice);
        this.game.addLog(`You sold ${item.name} for ${sellPrice} gold.`);
    
        this.ui.renderInventory();
        this.ui.updatePlayerStats();
        this.updateShopAffordability();
        this.ui.hideContextMenu();
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
                weight: 70  // 70% chance for early game items
            },
            mid: {
                items: [
                    'iron_sword', 'quick_dagger', 'iron_helm', 'iron_armor', 
                    'iron_legs', 'iron_shield', 'health_potion'
                ],
                weight: 25  // 25% chance for mid game items
            },
            late: {
                items: [
                    'steel_sword', 'steel_greatsword', 'steel_helm', 'steel_armor', 
                    'steel_legs', 'steel_shield', 'greater_health_potion'
                ],
                weight: 5   // 5% chance for late game items
            }
        };
    
        const availableItems = new Set(); // Use Set to prevent duplicates
    
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
    
            // Select random item from the chosen tier
            const tierItems = selectedTier.items;
            const randomItem = tierItems[this.game.getRandomInt(0, tierItems.length - 1)];
            
            // Only add if not already selected
            if (!availableItems.has(randomItem)) {
                availableItems.add(randomItem);
            }
        }
    
        // Convert selected items to actual item objects
        for (const itemId of availableItems) {
            const itemData = this.game.createItem(itemId);
            if (itemData) {
                // Reduce shop prices: 1.3x value + small random addition
                itemData.buyPrice = Math.ceil(itemData.value * 1.3 + this.game.getRandomInt(0, Math.floor(itemData.value * 0.2)));
                items.push(itemData);
            }
        }
    
        return items;
    }
    
    handleRerollShop() {
        if (this.game.state !== 'shop' || !this.game.shopCanReroll) return;
    
        if (this.game.player.spendGold(SHOP_REROLL_COST)) {
            this.game.addLog(`You spend ${SHOP_REROLL_COST} gold to reroll the shop.`);
            this.game.currentShopItems = this.generateShopItems(SHOP_NUM_ITEMS);
            this.game.shopCanReroll = false; // Only one reroll per visit
            this.handle();
            this.ui.updatePlayerStats();
        } else {
            this.game.addLog(`Not enough gold to reroll (costs ${SHOP_REROLL_COST})!`);
        }
    }
}
