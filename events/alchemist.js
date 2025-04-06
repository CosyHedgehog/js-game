class Alchemist {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    POTION_TIERS = {
        common: {
            items: ['health_potion', 'attack_potion', 'defense_potion'],
            chance: 0.8
        },
        rare: {
            items: ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion'],
            chance: 0.4
        },
        special: {
            items: ['speed_potion', 'greater_speed_potion'],
            chance: 0.3
        }
    };

    handle() {
        this.game.state = 'alchemist';
        this.game.addLog("You find an Alchemist's shop, filled with mysterious potions.");

        const availableItems = [];

        // Generate items and store their tier
        Object.entries(this.POTION_TIERS).forEach(([tier, { items, chance }]) => {
            items.forEach(itemId => {
                if (Math.random() < chance) {
                    const item = this.game.createItem(itemId);
                    if (item) {
                        // Apply shop pricing logic
                        item.buyPrice = Math.ceil(item.value * 1.3 + this.game.getRandomInt(0, Math.floor(item.value * 0.2)));
                        item.tier = tier; // Store the tier
                        availableItems.push(item);
                    }
                }
            });
        });

        // Ensure at least one item (fallback)
        if (availableItems.length === 0) {
            const basicPotion = this.game.createItem('health_potion');
            // Apply shop pricing logic to fallback
            basicPotion.buyPrice = Math.ceil(basicPotion.value * 1.3 + this.game.getRandomInt(0, Math.floor(basicPotion.value * 0.2))); 
            basicPotion.tier = 'common'; // Assign tier
            availableItems.push(basicPotion);
            // Mark the fallback as free if it's the only one
            availableItems[0].isFree = true;
            availableItems[0].originalPrice = availableItems[0].buyPrice;
            availableItems[0].buyPrice = 0;
            this.game.addLog("The alchemist offers you a complimentary Health Potion!");
        } else {
            // --- Weighted Selection for Free Item ---
            const tierWeights = { common: 3, rare: 2, special: 1 };
            let totalWeight = 0;
            availableItems.forEach(item => {
                totalWeight += tierWeights[item.tier] || 1; // Default weight 1 if tier unknown
            });

            let randomWeight = Math.random() * totalWeight;
            let freeIndex = -1;

            for (let i = 0; i < availableItems.length; i++) {
                const itemWeight = tierWeights[availableItems[i].tier] || 1;
                randomWeight -= itemWeight;
                if (randomWeight <= 0) {
                    freeIndex = i;
                    break;
                }
            }
            
            // Fallback if something went wrong (shouldn't happen)
            if (freeIndex === -1) freeIndex = 0; 

            availableItems[freeIndex].isFree = true;
            availableItems[freeIndex].originalPrice = availableItems[freeIndex].buyPrice;
            availableItems[freeIndex].buyPrice = 0;
            this.game.addLog(`The alchemist offers you a complimentary ${availableItems[freeIndex].name}!`);
            // --- End Weighted Selection ---
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
            <p class="shop-info">Potions brewed fresh (mostly). One's on the house!</p> 
            <div class="shop-content">
                <div class="shop-items-container">
                    ${items.map((item, index) => {
                const isBought = item.bought === true;
                const displayPrice = item.isFree ? item.originalPrice : item.buyPrice;
                const canAfford = item.isFree || this.game.player.gold >= item.buyPrice;
                const priceText = item.isFree ? `<span class="free-item-price">FREE</span> <span class="original-price">(was ${displayPrice})</span>` : `${displayPrice} gold`;

                return `
                        <div class="shop-item ${isBought ? 'item-bought' : ''} ${item.isFree ? 'free-item' : ''}" data-item-id="${item.id}">
                            <div class="shop-item-info">
                                <span class="shop-item-name">${item.name}${item.isFree ? ' ✨' : ''}</span>
                                <span class="shop-item-price">${priceText}</span>
                            </div>
                            <button class="shop-item-button ${item.isFree ? 'free-button' : ''}" data-index="${index}" ${isBought || !canAfford ? 'disabled' : ''}>
                                ${isBought ? 'Bought' : (item.isFree ? 'Take' : 'Buy')}
                            </button>
                        </div>
                    `}).join('')}
                    ${items.length === 0 ? '<div class="shop-empty-message">No more potions available!</div>' : ''}
                </div>
                <div class="item-description"> 
                    Click a potion to see its description
                </div>
            </div> 
            <button id="alchemist-leave-button" class="shop-leave-button">Leave Shop</button> 
        `;

        const existingArea = document.getElementById('alchemist-area');
        if (existingArea) {
            existingArea.remove();
        }

        mainContent.appendChild(alchemistArea);
        this.setupAlchemistEventListeners(items);

        if (items && items.length > 0) {
            const firstItemDiv = alchemistArea.querySelector('.shop-item');
            const descriptionBox = alchemistArea.querySelector('#alchemist-area .item-description');
            if (firstItemDiv && descriptionBox) {
                firstItemDiv.classList.add('selected');
                const name = items[0].name || 'Unknown Potion';
                const desc = items[0].description || 'No description available.';
                descriptionBox.innerHTML = `
                    <div class="item-desc-name">${name}</div>
                    <div class="item-desc-text">${desc}</div>
                `;
            }
        }
    }

    setupAlchemistEventListeners(items) {
        const potionItems = document.querySelectorAll('.shop-item');
        const descriptionBox = document.querySelector('#alchemist-area .item-description');

        potionItems.forEach(item => {
            const itemId = item.getAttribute('data-item-id');
            const itemData = ITEMS[itemId];

            item.addEventListener('mouseenter', () => {
                if (itemData) {
                    const name = itemData.name || 'Unknown Potion';
                    let desc = itemData.description || 'No description available.';
                    const shopItemObject = items.find(i => i.id === itemId);
                    let freeIndicator = ''; // Default empty

                    // Check if this item is the free one and set the indicator string
                    if (shopItemObject && shopItemObject.isFree) {
                        // desc += "<br><br><i style='color: #4CAF50;'>On the house!</i>"; // Removed from here
                        freeIndicator = " <span style='color: #4CAF50; font-style: italic; font-size: 0.9em;'>(Free!)</span>"; 
                    }

                    descriptionBox.innerHTML = `
                        <div class="item-desc-name">${name}${freeIndicator}</div>
                        <div class="item-desc-text">${desc}</div>
                    `;
                }
            });
        });

        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return;

        const buyButtons = alchemistArea.querySelectorAll('.shop-item-button');
        buyButtons.forEach((button) => {
            button.onclick = (e) => {
                e.stopPropagation();
                const itemIndex = parseInt(button.dataset.index);
                if (!isNaN(itemIndex)) {
                    this.handleAlchemistBuy(itemIndex);
                } else {
                    console.error('Invalid item index on alchemist buy button:', button.dataset.index);
                }
            };
        });

        const leaveButton = document.getElementById('alchemist-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => this.handleAlchemistLeave();
        }
    }
    
    handleAlchemistBuy(itemIndex) {
        if (!this.game || !this.game.currentShopItems || itemIndex >= this.game.currentShopItems.length) {
        }

        const item = this.game.currentShopItems[itemIndex];
        if (!item || item.bought) return;
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

        const alchemistArea = document.getElementById('alchemist-area');
        let scrollPosition = 0;
        let itemsContainer = null;

        if (alchemistArea) {
            itemsContainer = alchemistArea.querySelector('.shop-items-container');
            if (itemsContainer) {
                scrollPosition = itemsContainer.scrollTop;
            }

            const shopItemDiv = alchemistArea.querySelector(`.shop-item[data-item-id="${item.id}"]`);
            if (shopItemDiv) {
                const buyButton = shopItemDiv.querySelector('.shop-item-button');
                if (buyButton) {
                    buyButton.textContent = 'Bought';
                    buyButton.disabled = true;
                }
                shopItemDiv.classList.add('item-bought');
                // Remove free item styling after taking it
                if (item.isFree) {
                    shopItemDiv.classList.remove('free-item');
                    // Optionally, reset button style if needed (though .item-bought might override)
                    if(buyButton) buyButton.classList.remove('free-button'); 
                }
            } else {
                console.warn("Alchemist item div not found for targeted update.");
            }
            if (itemsContainer) {
                itemsContainer.scrollTop = scrollPosition;
            }
        } else {
            console.error("Alchemist area not found for update.");
        }
        if (alchemistArea) {
            this.updateAlchemistAffordability();
        }

        this.ui.updatePlayerStats();
        this.ui.renderInventory();
    }
    
    updateAlchemistAffordability() {
        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return;

        const shopItems = alchemistArea.querySelectorAll('.shop-item:not(.item-bought)');
        shopItems.forEach(shopItemDiv => {
            const itemId = shopItemDiv.dataset.itemId;
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
