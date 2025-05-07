class Alchemist {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        this.game.state = 'alchemist';
        this.game.addLog("You find an Alchemist's shop, filled with mysterious potions.");
        const currentRound = this.game.currentRound;
        const numPotionsToGenerate = this.game.getRandomInt(3, 5); // Generate 3-5 potions

        // Define potion pools using arrays from items.js
        const potionPools = {
            common: COMMON_POTIONS,
            uncommon: UNCOMMON_POTIONS,
            rare: RARE_POTIONS
        };

        // Get dynamic weights based on the current round
        const tierWeights = this.getTierWeights(currentRound);
        const totalWeight = Object.values(tierWeights).reduce((sum, weight) => sum + weight, 0);

        const availableItems = [];
        const generatedItemIds = new Set(); // To avoid duplicates

        while (availableItems.length < numPotionsToGenerate && generatedItemIds.size < (COMMON_POTIONS.length + UNCOMMON_POTIONS.length + RARE_POTIONS.length)) {
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

             // Handle edge case
             if (!selectedTierName) {
                selectedTierName = 'rare'; // Default to last relevant tier if something went wrong
            }

            const tierPotions = potionPools[selectedTierName];

            if (!tierPotions || tierPotions.length === 0) {
                console.warn(`Selected potion tier "${selectedTierName}" has no items. Skipping selection.`);
                // Break loop potentially if a tier is permanently empty to avoid infinite loop
                if (Object.values(potionPools).every(pool => pool.length === 0)) break;
                continue;
            }

            const randomPotionId = tierPotions[this.game.getRandomInt(0, tierPotions.length - 1)];

            // Add if valid and not already generated
            if (ITEMS[randomPotionId] && !generatedItemIds.has(randomPotionId)) {
                 generatedItemIds.add(randomPotionId); // Add to set *before* creating item

                 const item = this.game.createItem(randomPotionId);
                 if (item) {
                     const baseValue = item.value || 0;
                     item.buyPrice = Math.ceil(baseValue * 1.3 + this.game.getRandomInt(0, Math.floor(baseValue * 0.2)));
                     item.tier = selectedTierName; // Store the determined tier
                     availableItems.push(item);
                 } else {
                      console.warn(`Failed to create item instance for Potion ID: ${randomPotionId}`);
                 }
            } else if (!ITEMS[randomPotionId]) {
                console.warn(`Potion ID "${randomPotionId}" selected from tier arrays but not found in ITEMS data.`);
            }
            // If item was already generated, the loop continues to try finding a new one
        }


        // --- Free Item Logic (Weighted selection based on generated items) ---
         if (availableItems.length > 0) {
             // Use simple weights for free item selection (e.g., common=3, uncommon=2, rare=1)
             const freeItemTierWeights = { common: 3, uncommon: 2, rare: 1 };
             let freeItemTotalWeight = 0;
             availableItems.forEach(item => {
                 freeItemTotalWeight += freeItemTierWeights[item.tier] || 1;
             });

             let randomFreeWeight = Math.random() * freeItemTotalWeight;
             let freeIndex = -1;

             for (let i = 0; i < availableItems.length; i++) {
                 const itemWeight = freeItemTierWeights[availableItems[i].tier] || 1;
                 randomFreeWeight -= itemWeight;
                 if (randomFreeWeight <= 0) {
                     freeIndex = i;
                     break;
                 }
             }

             if (freeIndex === -1) freeIndex = 0; // Fallback

             availableItems[freeIndex].isFree = true;
             availableItems[freeIndex].originalPrice = availableItems[freeIndex].buyPrice;
             availableItems[freeIndex].buyPrice = 0;
             this.game.addLog(`The alchemist offers you a complimentary ${availableItems[freeIndex].name}!`);

         } else {
             // Fallback if absolutely no potions generated (should be rare)
             this.game.addLog("The alchemist seems to be out of stock today.");
         }
        // --- End Free Item Logic ---


        this.game.currentShopItems = availableItems; // Use currentShopItems consistently
        this.showAlchemistUI(availableItems);
    }

    // Helper function to get weights (same as Shop)
    getTierWeights(round) {
        if (round <= 5) {
            return { common: 90, uncommon: 10, rare: 0 };
        } else if (round <= 10) {
            return { common: 70, uncommon: 25, rare: 5 };
        } else if (round <= 15) {
            return { common: 45, uncommon: 45, rare: 10 };
        } else if (round <= 20) {
            return { common: 20, uncommon: 55, rare: 25 };
        } else if (round <= 25) {
            return { common: 5, uncommon: 45, rare: 50 };
        } else {
            return { common: 0, uncommon: 30, rare: 70 };
        }
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

                 let buttonText = '';
                 if (isBought) {
                     buttonText = item.wasFree ? 'Taken' : 'Bought';
                 } else {
                     buttonText = item.isFree ? 'Take' : 'Buy';
                 }

                 let itemDisplay = '';
                 if (window.itemSprites && window.itemSprites[item.id]) {
                    let spriteSpecificClass = 'potion-svg'; // Alchemist primarily sells potions
                    // Could add more checks if alchemist might sell other types with sprites
                    itemDisplay = `<div class="sprite-container shop-item-sprite-container"><div class="${spriteSpecificClass}">${window.itemSprites[item.id]}</div></div>`;
                 } else {
                    itemDisplay = `<div class="shop-item-name-text">${item.name}</div>`;
                 }

                 return `
                         <div class="shop-item ${isBought ? 'item-bought' : ''} ${item.isFree ? 'free-item' : ''}" data-item-id="${item.id}">
                             <div class="shop-item-main-content">
                                 ${itemDisplay}
                                 <div class="shop-item-details">
                                     <span class="shop-item-name">${item.name}${item.isFree ? ' ✨' : ''}</span>
                                     <span class="shop-item-price">${priceText}</span>
                                 </div>
                             </div>
                             <button class="shop-item-button ${item.isFree ? 'free-button' : ''}" data-index="${index}" ${isBought || !canAfford ? 'disabled' : ''}>
                                 ${buttonText}
                             </button>
                         </div>
                     `}).join('')}
                     ${items.length === 0 ? '<div class="shop-empty-message">No more potions available!</div>' : ''}
                 </div>
                 <div class="item-description">
                     Hover over a potion to see its description.
                 </div>
             </div>
             <button id="alchemist-leave-button" class="leave-button">Leave Shop</button>
         `;

         const existingArea = document.getElementById('alchemist-area');
         if (existingArea) {
             existingArea.remove();
         }

         mainContent.appendChild(alchemistArea);
         this.setupAlchemistEventListeners(items); // Pass generated items

         // Select first item for description (if any)
         if (items && items.length > 0) {
             const firstItemDiv = alchemistArea.querySelector('.shop-item');
             const descriptionBox = alchemistArea.querySelector('#alchemist-area .item-description');
             if (firstItemDiv && descriptionBox) {
                 firstItemDiv.classList.add('selected');
                 const name = items[0].name || 'Unknown Potion';
                 const desc = items[0].description || 'No description available.';
                 let freeIndicator = items[0].isFree ? " <span style='color: #4CAF50; font-style: italic; font-size: 0.9em;'>(Free!)</span>" : "";
                 descriptionBox.innerHTML = `
                     <div class="item-desc-name">${name}${freeIndicator}</div>
                     <div class="item-desc-text">${desc}</div>
                 `;
             }
         }
         this.updateAlchemistAffordability(); // Initial check
    }

    setupAlchemistEventListeners(items) { // Accepts items array
        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return;

        const potionItems = alchemistArea.querySelectorAll('.shop-item');
        const descriptionBox = alchemistArea.querySelector('#alchemist-area .item-description');

        potionItems.forEach((itemDiv) => {
            const itemId = itemDiv.getAttribute('data-item-id');
             // Find the corresponding item object from the passed array
             const shopItemObject = items.find(i => i.id === itemId);

            itemDiv.addEventListener('mouseenter', () => {
                 if (shopItemObject && descriptionBox) {
                     const name = shopItemObject.name || 'Unknown Potion';
                     const desc = shopItemObject.description || 'No description available.';
                     let freeIndicator = shopItemObject.isFree ? " <span style='color: #4CAF50; font-style: italic; font-size: 0.9em;'>(Free!)</span>" : "";

                     descriptionBox.innerHTML = `
                         <div class="item-desc-name">${name}${freeIndicator}</div>
                         <div class="item-desc-text">${desc}</div>
                     `;
                     // Highlight selected item
                     potionItems.forEach(el => el.classList.remove('selected'));
                     itemDiv.classList.add('selected');
                 }
            });
        });

        const buyButtons = alchemistArea.querySelectorAll('.shop-item-button');
        buyButtons.forEach((button, index) => { // Use index matching the displayed order
            button.onclick = (e) => {
                e.stopPropagation();
                 // Get the actual item object corresponding to this button/index
                 const displayedItem = items[index];
                 // Find the original index in game.currentShopItems if needed, or just use the object
                 const itemIndexInGameArray = this.game.currentShopItems.findIndex(item => item.id === displayedItem.id);

                 if (itemIndexInGameArray !== -1) {
                     this.handleAlchemistBuy(itemIndexInGameArray); // Use index from the game's array
                 } else {
                     console.error('Could not find corresponding item in game.currentShopItems for button index:', index, 'Item ID:', displayedItem?.id);
                 }
            };
        });

        const leaveButton = document.getElementById('alchemist-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => this.handleAlchemistLeave();
        }
    }
    
    handleAlchemistBuy(itemIndex) { // itemIndex refers to this.game.currentShopItems
        if (!this.game || !this.game.currentShopItems || itemIndex < 0 || itemIndex >= this.game.currentShopItems.length) {
             console.error("Invalid item index passed to handleAlchemistBuy:", itemIndex);
             return;
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

        const isFreeItem = item.isFree; // Check if it was the free one

        this.game.player.spendGold(item.buyPrice); // Spends 0 if free
        this.game.player.addItem(item);
        if (isFreeItem) {
             this.game.addLog(`You took the free ${item.name}.`);
             item.wasFree = true;
        } else {
             this.game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);
        }


        this.game.currentShopItems[itemIndex].bought = true;
        if (isFreeItem) {
            // Ensure no other items are marked as free if the free one is taken
            this.game.currentShopItems.forEach(shopItem => {
                if (shopItem !== item) {
                    shopItem.isFree = false;
                    // If we reset price display, do it here
                }
            });
        }


        // Re-render UI to reflect bought state and potentially changed free item status
         this.showAlchemistUI(this.game.currentShopItems); // Re-render the UI with updated items list


        this.ui.updatePlayerStats();
        this.ui.renderInventory();
    }
    
    updateAlchemistAffordability() {
         // This logic is now implicitly handled by showAlchemistUI re-render
         const alchemistArea = document.getElementById('alchemist-area');
         if (!alchemistArea) return;

         const shopItems = alchemistArea.querySelectorAll('.shop-item:not(.item-bought)');
         shopItems.forEach(shopItemDiv => {
             const itemId = shopItemDiv.dataset.itemId;
             // Find item in the *game's* current list
             const itemData = this.game.currentShopItems.find(item => item.id === itemId && !item.bought);
             const buyButton = shopItemDiv.querySelector('.shop-item-button');
             if (itemData && buyButton) {
                 // Can afford if free OR has enough gold
                 const canAfford = itemData.isFree || this.game.player.gold >= itemData.buyPrice;
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
