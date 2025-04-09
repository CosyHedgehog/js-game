class Fishing {

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    FISHING_AREAS = {
        shoreline: {
            name: '🐚 Shallow Shoreline',
            description: 'Scrounge near the water\'s edge. <br>Fish: <b>Small (75%)</b> - <b>Medium (25%)</b>.',
            fishRange: [1, 3],
            lootTable: [
                { itemId: 'small_fish', chance: 0.75 },
                { itemId: 'medium_fish', chance: 0.25 }
            ],
            ringChance: 0.05,
            monsterChance: 0.05,
            requiresRod: false
        },
        safe: {
            name: '🐟 Calm Waters',
            description: 'A peaceful spot. Home to a school of medium fish. <br>Fish: <b>Medium (100%)</b>.',
            fishRange: [3, 4],
            lootTable: [
                { itemId: 'medium_fish', chance: 1 }
            ],
            ringChance: 0.20,
            monsterChance: 0,
            requiresRod: true
        },
        moderate: {
            name: '🐠 Rushing Stream',
            description: 'A faster flowing area. <br>Fish: <b>Small (50%)</b> - <b>Medium (50%)</b>',
            fishRange: [4, 8],
            lootTable: [
                { itemId: 'small_fish', chance: 0.50 },
                { itemId: 'medium_fish', chance: 0.50 },
            ],
            ringChance: 0.10,
            monsterChance: 0.10,
            requiresRod: true
        },
        dangerous: {
            name: '🦈 Deep Waters',
            description: 'A treacherous fishing spot. <br>Fish: <b>Medium (40%)</b> - <b>Large (60%)</b>.',
            fishRange: [1, 2],
            lootTable: [
                { itemId: 'medium_fish', chance: 0.40 },
                { itemId: 'large_fish', chance: 0.60 }
            ],
            ringChance: 0.30,
            monsterChance: 0.40,
            requiresRod: true
        }
    };

    handle() {
        this.game.state = 'fishing';
        this.game.addLog("You approach a body of water, looking for fish.");
        this.showFishingAreaSelection();
    }

    showFishingAreaSelection() {
        this.ui.clearMainArea();

        const fishingAreaContainer = this.ui.fishingArea;
        fishingAreaContainer.id = 'fishing-area';
        fishingAreaContainer.classList.remove('hidden');

        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');

        fishingAreaContainer.innerHTML = `
            <div class="fishing-areas-container">
                ${Object.entries(this.FISHING_AREAS).map(([key, area]) => {
            const needsRod = area.requiresRod === true;
            const isDisabled = needsRod && !hasFishingRod ? 'disabled' : '';
            const actualRequirement = needsRod && !hasFishingRod ? `<span class="requirement-missing">Requires Fishing Rod</span>` : '';
            const placeholder = `<span class="requirement-placeholder">Requires Fishing Rod</span>`;
            const requirementContent = actualRequirement || placeholder;

            const updatedDescription = area.description;

        //     <span class="fishing-stat monster-chance-stat">
        //     <span class="fishing-stat-label">Monster Chance</span>
        //     <span class="fishing-stat-value">${Math.round(area.monsterChance * 100)}%</span>
        // </span>

            return `
                    <div class="choice-card" data-area="${key}">
                        <h4 class="choice-title">${area.name}</h4>
                        ${requirementContent}
                        <p class="choice-description">${updatedDescription}</p>
                        <div class="monster-stats-grid">
                            <span class="fishing-stat">Fish: ${area.fishRange[0]}-${area.fishRange[1]}</span>
                            <span class="fishing-stat">
                                <span class="fishing-stat-label">Treasure Chance</span>
                                <span class="fishing-stat-value">${Math.round(area.ringChance * 100)}%</span>
                            </span>
                        </div>
                        <button class="choice-start-button" ${isDisabled}>Fish Here</button>
                    </div>
                `}).join('')}
            </div>
        `;

        document.getElementById('main-content').appendChild(fishingAreaContainer);

        const fishingButtons = fishingAreaContainer.querySelectorAll('.choice-start-button');
        fishingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const areaKey = button.closest('.choice-card').dataset.area;
                this.startFishing(areaKey);
            });
        });
    }

    // Helper function to get a random ring based on the area
    getRandomRingForArea(areaKey) {
        let pool = [];
        let weights = [];

        switch (areaKey) {
            case 'shoreline':
            case 'safe':
                pool = COMMON_RINGS;
                weights = pool.map(() => 1);
                break;
            case 'moderate':
                pool = [...COMMON_RINGS, ...UNCOMMON_RINGS];
                break;
            case 'dangerous':
                pool = [...COMMON_RINGS, ...UNCOMMON_RINGS];
                break;
            default:
                console.warn("Unknown fishing area key for ring selection:", areaKey);
                return null;
        }

        if (pool.length === 0) return null;

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomWeight = Math.random() * totalWeight;
        let chosenRingId = null;

        for (let i = 0; i < pool.length; i++) {
            randomWeight -= weights[i];
            if (randomWeight <= 0) {
                chosenRingId = pool[i];
                break;
            }
        }

         // Fallback if something goes wrong (e.g., rounding issues)
         if (!chosenRingId) {
             chosenRingId = pool[pool.length - 1];
         }

        return chosenRingId;
    }


    startFishing(areaKey) {
        const area = this.FISHING_AREAS[areaKey];
        if (!area) {
            console.error("Invalid fishing area key:", areaKey);
            this.game.proceedToNextRound();
            return;
        }

        if (area.requiresRod) {
            const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');
            if (!hasFishingRod) {
                this.game.addLog("You need a Fishing Rod to fish here!");
                // No need to proceed, just return and let the player choose again
                return;
            }
        }

        this.game.addLog(`You ${areaKey === 'shoreline' ? 'start searching' : 'cast your line'} in the ${area.name}...`);
        const fishCaughtCount = this.game.getRandomInt(area.fishRange[0], area.fishRange[1]);
        const caughtItems = [];

        // Check for bonus ring drop first (once per attempt)
        if (area.ringChance && Math.random() < area.ringChance) {
            const ringId = this.getRandomRingForArea(areaKey);
            if (ringId) {
                const ringItem = this.game.createItem(ringId);
                if (ringItem) {
                    caughtItems.push(ringItem);
                    this.game.addLog("Alongside the fish, you find something shimmering!");
                } else {
                    console.error(`Failed to create bonus ring item with ID: ${ringId}`);
                }
            }
        }

        const currentLootTable = area.lootTable;
        for (let i = 0; i < fishCaughtCount; i++) {
            const roll = Math.random();
            let cumulative = 0;

            for (const lootEntry of currentLootTable) {
                cumulative += lootEntry.chance;
                if (roll < cumulative) {
                    const itemId = lootEntry.itemId;
                    if (itemId) {
                        const createdItem = this.game.createItem(itemId);
                        if (createdItem) {
                            caughtItems.push(createdItem);
                        } else {
                            console.error(`Failed to create item with ID: ${itemId}`);
                        }
                    }
                    break; // Exit inner loop once an item type is determined
                }
            }
        }

        // if (Math.random() < area.monsterChance) {
        //     this.game.addLog("Suddenly, something emerges from the water!");
        //     const monsterId = 'river_troll'; // TODO: Make monster dynamic based on area?
        //     const monsterData = MONSTERS[monsterId];
        //     if (!monsterData) {
        //         console.error("Monster data not found:", monsterId);
        //         this.game.addLog("An unknown creature appears!");
        //         this.game.proceedToNextRound();
        //         return;
        //     }
        //     // Need to pass the ui object to the Combat constructor
        //     this.game.currentCombat = new Combat(this.game.player, monsterData, this.game, this.ui);
        //     this.game.state = 'combat';
        //     this.game.currentCombat.start();
        // } else {
             if (caughtItems.length > 0) {
                this.game.enterLootState(0, caughtItems);
             } else {
                 this.game.addLog("You didn't find anything useful this time.");
                 this.game.proceedToNextRound(); // Proceed if nothing caught
             }
        // }
    }
}
