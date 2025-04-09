// events/weapon_merchant.js
class WeaponMerchant {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.currentDiscountPercent = 0; // Initialize property
    }

    handle(encounter) {
        this.game.state = 'weapon_merchant';
        this.game.addLog("You encounter a traveling arms dealer.");
        const currentRound = this.game.currentRound;
        const numWeaponsToOffer = this.game.getRandomInt(2, 3);

        // *** Use discount from encounter object AND Store it ***
        this.currentDiscountPercent = encounter.discountPercent || 10; // Store it on the instance

        // Define weapon pools using arrays from items.js
        const weaponPools = {
            early: COMMON_WEAPONS,
            mid: UNCOMMON_WEAPONS,
            late: RARE_WEAPONS
        };

        // Get dynamic weights based on the current round
        const tierWeights = this.getTierWeights(currentRound);
        const totalWeight = Object.values(tierWeights).reduce((sum, weight) => sum + weight, 0);

        const offeredItems = [];
        const offeredItemIds = new Set(); // To avoid duplicates

        while (offeredItems.length < numWeaponsToOffer && offeredItemIds.size < (COMMON_WEAPONS.length + UNCOMMON_WEAPONS.length + RARE_WEAPONS.length)) {
            const roll = Math.random() * totalWeight;
            let selectedTierName;
            let cumWeight = 0;

            for (const [tierName, weight] of Object.entries(tierWeights)) {
                cumWeight += weight;
                if (roll < cumWeight) {
                    selectedTierName = tierName;
                    break;
                }
            }

            if (!selectedTierName) selectedTierName = 'late';

            const tierWeapons = weaponPools[selectedTierName];

            if (!tierWeapons || tierWeapons.length === 0) {
                 // If a tier is empty, try again or break if all are empty
                 if (Object.values(weaponPools).every(pool => pool.length === 0)) break;
                continue;
            }

            const randomWeaponId = tierWeapons[this.game.getRandomInt(0, tierWeapons.length - 1)];

            if (ITEMS[randomWeaponId] && !offeredItemIds.has(randomWeaponId)) {
                offeredItemIds.add(randomWeaponId); // Add base ID to prevent duplicates of base item
                const baseItem = this.game.createItem(randomWeaponId);
                if (baseItem) {
                    const modifiedItem = this.applyWeaponPrefix(baseItem); // Apply prefix potentially
                    
                    // Check if a prefix was applied and update the offered set check
                    // to prevent duplicate prefixes of the same base item
                    if(modifiedItem.id !== baseItem.id && offeredItemIds.has(modifiedItem.id)) {
                        continue; // Already offered this prefix variant, try again
                    }
                    if(modifiedItem.id !== baseItem.id) {
                        offeredItemIds.add(modifiedItem.id); // Add prefixed ID
                    }

                    const baseValue = modifiedItem.value || 0;
                    // Calculate standard shop price (1.3x base + variance)
                    const originalPrice = Math.ceil(baseValue * 1.3 + this.game.getRandomInt(0, Math.floor(baseValue * 0.1)));
                    // Use the stored discount percent
                    const buyPrice = Math.floor(originalPrice * (1 - this.currentDiscountPercent / 100));

                    modifiedItem.originalPrice = originalPrice; // Store the shop price (crossed out)
                    modifiedItem.buyPrice = buyPrice;         // Store the actual discounted price
                    offeredItems.push(modifiedItem);
                }
            }
            // Loop continues if duplicate was selected
        }

        // If still no items (e.g., all weapon tiers empty), maybe offer a default or log message
        if (offeredItems.length === 0) {
             this.game.addLog("The merchant doesn't seem to have anything suitable for you right now.");
             this.game.proceedToNextRound(); // Or handle differently
             return;
        }


        // Store offered items (can use game.currentShopItems or a new property if needed)
        this.game.currentShopItems = offeredItems; // Reusing shop item storage for simplicity
        // *** Pass stored discount percent to UI function ***
        this.showWeaponMerchantUI(offeredItems, this.currentDiscountPercent);
    }

    // Use the same weighting logic as the Shop/Alchemist
    getTierWeights(round) {
        if (round <= 5) {
            return { early: 90, mid: 10, late: 0 };
        } else if (round <= 10) {
            return { early: 70, mid: 25, late: 5 };
        } else if (round <= 15) {
            return { early: 45, mid: 45, late: 10 };
        } else if (round <= 20) {
            return { early: 20, mid: 55, late: 25 };
        } else if (round <= 25) {
            return { early: 5, mid: 45, late: 50 };
        } else {
            return { early: 0, mid: 30, late: 70 };
        }
    }

    // --- NEW FUNCTION to apply prefixes ---
    applyWeaponPrefix(item) {
        const prefixRoll = Math.random();
        let prefix = null;
        let bonusAttack = 0;
        let valueMultiplier = 1.0;

        // Adjust chances as needed
        if (prefixRoll < 0.1) { // 10% chance for Sharpened
            prefix = "Sharpened";
            bonusAttack = 2;
            valueMultiplier = 1.5;
        } else if (prefixRoll < 0.3) { // 20% chance for Honed (total 30% chance for any prefix)
            prefix = "Honed";
            bonusAttack = 1;
            valueMultiplier = 1.2;
        }

        if (prefix) {
            // Create a deep copy to avoid modifying the original item definition
            const newItem = JSON.parse(JSON.stringify(item)); 
            
            newItem.name = `${prefix} ${item.name}`; // Add prefix to name
            newItem.id = `${prefix.toLowerCase()}_${item.id}`; // Create unique ID
            newItem.stats = newItem.stats || {};
            newItem.stats.attack = (newItem.stats.attack || 0) + bonusAttack;
            newItem.value = Math.ceil((newItem.value || 0) * valueMultiplier);
            
            // Update description (simple approach)
            newItem.description = newItem.description ? newItem.description.replace(/\nAttack: \+\d+/g, `\nAttack: +${newItem.stats.attack}`) : `A ${prefix.toLowerCase()} version of ${item.name}.\nAttack: +${newItem.stats.attack}`;
            if (!newItem.description.includes(`\nAttack: +${newItem.stats.attack}`)) { // Append if not replaced
                 newItem.description += `\nAttack: +${newItem.stats.attack}`;
            }
            newItem.description += `\n(${prefix}: +${bonusAttack} Attack)`; // Add explicit note

            return newItem; // Return the modified copy
        }

        return item; // Return original item if no prefix applied
    }
    // --- End NEW FUNCTION ---

    // --- UI, Event Listeners, Buy/Leave Logic (To be added/adapted from Shop/Alchemist) ---

    showWeaponMerchantUI(items, discountPercent) {
        this.ui.clearMainArea();
        const merchantArea = this.ui.weaponMerchantArea;
        merchantArea.classList.remove('hidden');
        merchantArea.id = 'weapon-merchant-area'; // Use a unique ID
        merchantArea.innerHTML = `
             <h3>Traveling Arms Dealer <span style="color: #4CAF50;">(${discountPercent}% OFF!)</span></h3>
             <p class="shop-info">A selection of fine weaponry, traveler.</p>
             <div class="shop-content">
                 <div class="shop-items-container">
                     ${items.map((item, index) => {
                         const isBought = item.bought === true;
                         const canAfford = this.game.player.gold >= item.buyPrice;
                         return `
                             <div class="shop-item ${isBought ? 'item-bought' : ''}" data-item-id="${item.id}">
                                 <div class="shop-item-info">
                                     <span class="shop-item-name">${item.name}</span>
                                     <span class="shop-item-price">
                                         <span class="original-price">${item.originalPrice} gold</span>
                                         <span class="discounted-price">${item.buyPrice} gold</span>
                                     </span>
                                 </div>
                                 <button class="shop-item-button" data-index="${index}" ${isBought || !canAfford ? 'disabled' : ''}>
                                     ${isBought ? 'Bought' : 'Buy'}
                                 </button>
                             </div>
                         `;
                     }).join('')}
                 </div>
                 <div class="item-description">
                     Hover over a weapon to see its description.
                 </div>
             </div>
             <button id="weapon-merchant-leave-button" class="leave-button">Leave</button>
         `;

         // Ensure old area removed if re-entering
          const existingArea = document.getElementById('weapon-merchant-area');
          if (existingArea) existingArea.remove();

         document.getElementById('main-content').appendChild(merchantArea);
         this.setupWeaponMerchantEventListeners(items);

         // Initial description display
          if (items && items.length > 0) {
             const firstItemDiv = merchantArea.querySelector('.shop-item');
             const descriptionBox = merchantArea.querySelector('.item-description');
             if (firstItemDiv && descriptionBox) {
                 firstItemDiv.classList.add('selected');
                 const name = items[0].name || 'Unknown Weapon';
                 const desc = items[0].description || 'No description available.';
                 descriptionBox.innerHTML = `
                     <div class="item-desc-name">${name}</div>
                     <div class="item-desc-text">${desc}</div>
                 `;
             }
         }
         this.updateWeaponMerchantAffordability();
    }

     setupWeaponMerchantEventListeners(items) {
         const merchantArea = document.getElementById('weapon-merchant-area');
         if (!merchantArea) return;

         const itemDivs = merchantArea.querySelectorAll('.shop-item');
         const descriptionBox = merchantArea.querySelector('.item-description');

         itemDivs.forEach((itemDiv) => {
             const itemId = itemDiv.getAttribute('data-item-id');
             const itemData = items.find(i => i.id === itemId); // Get data from the passed array

             itemDiv.addEventListener('mouseenter', () => {
                 if (itemData && descriptionBox) {
                     const name = itemData.name || 'Unknown Weapon';
                     const desc = itemData.description || 'No description available.';
                     descriptionBox.innerHTML = `
                         <div class="item-desc-name">${name}</div>
                         <div class="item-desc-text">${desc}</div>
                     `;
                     itemDivs.forEach(el => el.classList.remove('selected'));
                     itemDiv.classList.add('selected');
                 }
             });
         });

         const buyButtons = merchantArea.querySelectorAll('.shop-item-button');
         buyButtons.forEach((button, index) => { // Index relative to displayed items
             button.onclick = (e) => {
                 e.stopPropagation();
                 // Find the actual index in the game's stored list
                 const displayedItem = items[index];
                 const itemIndexInGameArray = this.game.currentShopItems.findIndex(item => item.id === displayedItem.id);
                 if(itemIndexInGameArray !== -1) {
                    this.handleWeaponMerchantBuy(itemIndexInGameArray);
                 } else {
                    console.error("Could not find weapon in game data for index:", index);
                 }
             };
         });

         const leaveButton = document.getElementById('weapon-merchant-leave-button');
         if (leaveButton) {
             leaveButton.onclick = () => this.handleWeaponMerchantLeave();
         }
     }

     handleWeaponMerchantBuy(itemIndex) {
         if (!this.game || !this.game.currentShopItems || itemIndex < 0 || itemIndex >= this.game.currentShopItems.length) {
              console.error("Invalid item index for merchant buy:", itemIndex);
              return;
         }

         const item = this.game.currentShopItems[itemIndex];
         if (!item || item.bought) return;

         if (this.game.player.gold < item.buyPrice) {
             this.game.addLog(`Not enough gold for ${item.name} (${item.buyPrice} gold).`);
             return;
         }
         if (this.game.player.findFreeInventorySlot() === -1) {
             this.game.addLog("Inventory full!");
             return;
         }

         this.game.player.spendGold(item.buyPrice);
         this.game.player.addItem(item);
         this.game.addLog(`Bought ${item.name} for ${item.buyPrice} gold.`);
         this.game.currentShopItems[itemIndex].bought = true; // Mark as bought for this session

         // *** Re-render using the stored discount percent ***
         this.showWeaponMerchantUI(this.game.currentShopItems, this.currentDiscountPercent);

         this.ui.updatePlayerStats();
         this.ui.renderInventory();
     }

     updateWeaponMerchantAffordability() {
        const merchantArea = document.getElementById('weapon-merchant-area');
         if (!merchantArea) return;
         const itemButtons = merchantArea.querySelectorAll('.shop-item-button');
         itemButtons.forEach((button) => {
            const index = parseInt(button.dataset.index); // Index relative to displayed items
            if (isNaN(index) || index < 0 || index >= this.game.currentShopItems.length) return;

            const item = this.game.currentShopItems[index];
            if (item && !item.bought) { // Only check affordability if not bought
                button.disabled = this.game.player.gold < item.buyPrice;
            } else if (item && item.bought) {
                button.disabled = true; // Ensure bought items are disabled
            }
         });
     }


     handleWeaponMerchantLeave() {
         this.ui.clearMainArea();
         this.game.proceedToNextRound();
     }
} 