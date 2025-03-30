const ALCHEMIST_CONFIG = {
    NAME: 'Visit Alchemist',
    DESCRIPTION: "Visit the Alchemist to buy powerful potions:\n- Health Potions: Restore HP instantly\n- Attack Potions: Boost damage for combat\n- Defense Potions: Increase defense for combat\n- Speed Potions: Attack faster for combat",
    PROMPT: "Enter the Alchemist's shop?",
    STATE: 'alchemist',
    ENTRY_MESSAGE: "You find an Alchemist's shop, filled with mysterious potions.",
    MARKUP: 2.5,
    POTION_TIERS: {
        common: { chance: 0.8 },
        rare: { chance: 0.4 },
        special: { chance: 0.3 }
    }
};

ENCOUNTERS.alchemist = {
    // --- Core Encounter Properties ---
    type: 'alchemist', // Added for potential future use
    currentItems: [], // Store items for this specific encounter instance

    getText: () => ALCHEMIST_CONFIG.NAME,

    getDetails: (data, game) =>
        `${ALCHEMIST_CONFIG.DESCRIPTION}\n\n` +
        `Current gold: ${game.player.gold}\n\n` +
        `${ALCHEMIST_CONFIG.PROMPT}`,

    handle: (game, ui) => {
        game.state = ALCHEMIST_CONFIG.STATE;
        game.addLog(ALCHEMIST_CONFIG.ENTRY_MESSAGE);
        // Generate and store items locally for this encounter instance
        ENCOUNTERS.alchemist.currentItems = generateAlchemistItems();
        // Display the UI using the local method
        ENCOUNTERS.alchemist.displayUI(game, ui);
    },

    // --- UI and Interaction Logic ---

    displayUI: (game, ui) => {
        ui.clearMainArea();
        const mainContent = document.getElementById('main-content');
        const items = ENCOUNTERS.alchemist.currentItems; // Use locally stored items

        const alchemistArea = document.createElement('div');
        alchemistArea.id = 'alchemist-area'; // Keep ID for styling/clearing
        alchemistArea.innerHTML = `
            <h3>Alchemist's Shop</h3>
            <div class="shop-items-container">
                ${items.map((item, index) => `
                    <div class="shop-item" data-index="${index}" data-item-id="${item.id}">
                        <div class="shop-item-info">
                            <span class="shop-item-name">${item.name}</span>
                            <span class="shop-item-price">${item.buyPrice} gold</span>
                        </div>
                        <button class="shop-item-button" ${game.player.gold < item.buyPrice ? 'disabled' : ''}>
                            Buy
                        </button>
                    </div>
                `).join('')}
                ${items.length === 0 ? '<div class="shop-empty-message">No more potions available!</div>' : ''}
            </div>
            <div id="potion-description" class="potion-description">
                Click a potion to see its description
            </div>
            <div class="shop-buttons">
                <button id="alchemist-leave-button" class="shop-leave-button">Leave Shop</button>
            </div>
        `;

        mainContent.appendChild(alchemistArea);
        // Setup listeners using the local method
        ENCOUNTERS.alchemist.setupEventListeners(game, ui);
    },

    setupEventListeners: (game, ui) => {
        const items = ENCOUNTERS.alchemist.currentItems; // Use locally stored items
        const alchemistArea = document.getElementById('alchemist-area');
        if (!alchemistArea) return; // Area might have been cleared

        const potionItems = alchemistArea.querySelectorAll('.shop-item');
        const descriptionBox = alchemistArea.querySelector('#potion-description');

        potionItems.forEach((itemElement, index) => {
            const itemData = items[index]; // Get item data from the local array

            // Listener for description
            itemElement.addEventListener('click', () => {
                if (itemData && descriptionBox) {
                    descriptionBox.textContent = itemData.description || 'No description available.';
                    // Highlight selected item
                    potionItems.forEach(i => i.classList.remove('selected'));
                    itemElement.classList.add('selected');
                }
            });

            // Listener for buy button
            const buyButton = itemElement.querySelector('.shop-item-button');
            if (buyButton) {
                buyButton.onclick = (e) => {
                    e.stopPropagation(); // Prevent triggering description click
                    ENCOUNTERS.alchemist.handleBuy(game, ui, index);
                };
            }
        });

        // Listener for leave button
        const leaveButton = alchemistArea.querySelector('#alchemist-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => ENCOUNTERS.alchemist.handleLeave(game, ui);
        }
    },

    handleBuy: (game, ui, itemIndex) => {
        // Use locally stored items
        const items = ENCOUNTERS.alchemist.currentItems;
        if (itemIndex >= items.length) return;

        const item = items[itemIndex];
        if (!item) return;

        // Check affordability
        if (game.player.gold < item.buyPrice) {
            game.addLog(`You can't afford ${item.name} (${item.buyPrice} gold).`);
            return;
        }

        // Check inventory space
        if (game.player.findFreeInventorySlot() === -1) {
            game.addLog("Your inventory is full!");
            return;
        }

        // Process purchase
        game.player.spendGold(item.buyPrice);
        const newItemInstance = createItem(item.id); // Create a fresh instance for inventory
        if (!newItemInstance) { // Safety check if createItem fails
             game.player.addGold(item.buyPrice); // Refund
             game.addLog("Error purchasing item.");
             return;
        }
        // Make sure the bought item has the correct buy price (even though it's not used after buying)
        newItemInstance.buyPrice = item.buyPrice;

        if (game.player.addItem(newItemInstance)) {
            game.addLog(`You bought ${item.name} for ${item.buyPrice} gold.`);

            // --- Change item state instead of removing ---
            // Find the button for the purchased item
            const alchemistArea = document.getElementById('alchemist-area');
            if (alchemistArea) {
                const boughtButton = alchemistArea.querySelector(`.shop-item[data-index="${itemIndex}"] .shop-item-button`);
                if (boughtButton) {
                    boughtButton.textContent = "Bought";
                    boughtButton.disabled = true;
                }
            }
            // --------------------------------------------

            // Update core UI elements
            ui.updatePlayerStats();
            ui.renderInventory();

            // Remove the refresh call - we updated the button directly
            // ENCOUNTERS.alchemist.displayUI(game, ui);
        } else {
             // This case should be rare now due to the check above, but good to keep
             game.player.addGold(item.buyPrice); // Refund
             game.addLog("Failed to add item to inventory (unexpected error).");
        }
    },

    handleLeave: (game, ui) => {
        ENCOUNTERS.alchemist.currentItems = []; // Clear items when leaving
        ui.clearMainArea(); // Clears the #alchemist-area
        game.proceedToNextRound();
    }
};

// --- Item Generation Logic (kept in the same file) ---
function generateAlchemistItems() {
    const tiers = ALCHEMIST_CONFIG?.POTION_TIERS || {
        common: { chance: 0.8 },
        rare: { chance: 0.4 },
        special: { chance: 0.3 }
    };
    const commonItems = ['health_potion', 'attack_potion', 'defense_potion'];
    const rareItems = ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion'];
    const specialItems = ['speed_potion'];

    const availableItems = [];

    // Function to add item if roll succeeds
    const tryAddItem = (itemId, chance) => {
        if (Math.random() < chance) {
            const item = createItem(itemId);
            if (item) {
                // Use CONFIG for markup if available
                const markup = ALCHEMIST_CONFIG?.MARKUP || 2.5;
                item.buyPrice = Math.ceil(item.value * markup);
                availableItems.push(item);
            }
        }
    };

    commonItems.forEach(id => tryAddItem(id, tiers.common.chance));
    rareItems.forEach(id => tryAddItem(id, tiers.rare.chance));
    specialItems.forEach(id => tryAddItem(id, tiers.special.chance));

    // Ensure at least one item is always available
    if (availableItems.length === 0) {
        const basicPotion = createItem('health_potion');
        if (basicPotion) {
            const markup = CONFIG?.alchemist?.MARKUP || 2.5;
            basicPotion.buyPrice = Math.ceil(basicPotion.value * markup);
            availableItems.push(basicPotion);
        }
    }

    // Sort items for consistent display (optional)
    availableItems.sort((a, b) => a.buyPrice - b.buyPrice);

    return availableItems;
}