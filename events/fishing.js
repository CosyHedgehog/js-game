class Fishing {

    // --- Configuration ---
    FISH_CHANCE_SMALL = 0.40; // 40%
    FISH_CHANCE_MEDIUM = 0.40; // 40%
    FISH_CHANCE_LARGE = 0.20; // 20%
    // Note: Ensure these add up to 1.00 (or close enough due to floating point)
    // --- End Configuration ---

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    FISHING_AREAS = {
        shoreline: {
            name: 'Shallow Shoreline',
            description: 'Scour the shallow waters and muddy banks.',
            fishRange: [1, 3],
            ringChance: 0.05,
            requiresRod: false
        },
        safe: {
            name: 'Waterlogged Cave',
            description: 'Explore the dripping cave and its hidden pool.',
            fishRange: [3, 4],
            ringChance: 0.20,
            requiresRod: true
        },
        moderate: {
            name: 'Rushing Stream',
            description: 'Battle the current in this fast-flowing stream.',
            fishRange: [4, 8],
            ringChance: 0.10,
            requiresRod: true
        },
        dangerous: {
            name: 'Murky Depths',
            description: 'Plunge your line into the dark, unknown depths.',
            fishRange: [1, 3],
            ringChance: 0.30,
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
        fishingAreaContainer.innerHTML = '';

        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');

        const mainContainerHTML = `
            <div class="fishing-main-container">
                <div class="fishing-icon">🎣</div> 
                <h3>Choose Fishing Spot</h3>
                <p class="fishing-rating-explanation">Ratings: Fish Quantity / Treasure Chance (Low/Med/High). Rod required for Med/High.</p>
                <div class="fishing-choices">
                ${Object.entries(this.FISHING_AREAS).map(([key, area]) => {
            const needsRod = area.requiresRod === true;
            const isDisabled = needsRod && !hasFishingRod ? 'disabled' : '';
            const disabledCardClass = isDisabled ? 'disabled' : ''; // Class for the card
            
                        // REMOVED requirementText logic
                        // const requirementText = needsRod && !hasFishingRod 
                        //     ? `<span class="requirement-missing-small">Requires Rod</span>` 
                        //     : `<span class="requirement-placeholder-small">&nbsp;</span>`;

                        // --- Button Text Logic ---
                        let buttonText = "Fish"; // Default
                        if (key === 'shoreline') {
                            buttonText = "Scrounge";
                        } else if (key === 'safe') {
                            buttonText = "Explore";
                        } else if (key === 'moderate') {
                            buttonText = "Wade";
                        } else if (key === 'dangerous') {
                            buttonText = "Plunge";
                        }
                        // ---

                        // --- Fish Level Logic ---
                        let fishLevel = "Med"; // Changed from Medium
                        let fishLevelClass = "fish-level-medium";
                        if (key === 'shoreline' || key === 'dangerous') {
                            fishLevel = "Low";
                            fishLevelClass = "fish-level-low";
                        } else if (key === 'moderate') {
                            fishLevel = "High";
                            fishLevelClass = "fish-level-high";
                        } // 'safe' (Waterlogged Cave) defaults to Med
                        // const fishDisplay = `<span class="info-icon ${fishLevelClass}">Fish: ${fishLevel}</span>`;
                        // --- REMOVED old fishDisplay

                        // Simplified Treasure Chance Display & Coloring
                        let treasureText = 'None';
                        let treasureLevelClass = 'treasure-level-none'; // Default class
                        if (area.ringChance > 0.25) {
                            treasureText = 'High';
                            treasureLevelClass = 'treasure-level-high';
                        } else if (area.ringChance > 0.10) {
                            treasureText = 'Med';
                            treasureLevelClass = 'treasure-level-medium';
                        } else if (area.ringChance > 0) {
                            treasureText = 'Low';
                            treasureLevelClass = 'treasure-level-low';
                        }
                        // const treasureDisplay = `<span class="info-icon treasure-chance ${treasureLevelClass}">💎: ${treasureText}</span>`; // Added colon and class
                        // --- REMOVED old treasureDisplay

            // Extract short description
            const shortDesc = area.description.split('<br>')[0];

            return `
                            <div class="fishing-choice-card ${disabledCardClass}" data-area="${key}">
                                <h4>${area.name}</h4>
                                <p class="fishing-card-desc">${shortDesc}</p>
                                <!-- REMOVED requirementText span -->
                                <div class="fishing-info-grid">
                                    <span class="info-header">Fish</span>
                                    <span class="info-header">Treasure</span>
                                    <span class="info-value ${fishLevelClass}">${fishLevel}</span>
                                    <span class="info-value ${treasureLevelClass}">${treasureText}</span>
                                </div>
                                <button class="choice-start-button" ${isDisabled}>${buttonText}</button> 
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        fishingAreaContainer.innerHTML = mainContainerHTML;

        const fishingButtons = fishingAreaContainer.querySelectorAll('.fishing-choice-card .choice-start-button');
        fishingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const areaKey = button.closest('.fishing-choice-card').dataset.area;
                
                // Check if it's the shoreline (Scrounge) area
                if (areaKey === 'shoreline') {
                    // Skip animation, start fishing/scrounging directly
                    this.startFishing(areaKey);
                } else {
                    // For other areas, show the fishing animation
                    this.showFishingAnimation(areaKey);
                }
            });
        });
    }

    showFishingAnimation(areaKey) {
        this.ui.clearMainArea();
        this.ui.fishingArea.innerHTML = '';
        const animationContainer = document.createElement('div');
        animationContainer.id = 'fishing-animation';
        animationContainer.innerHTML = `
            <div class="fishing-animation-container">
                <div class="fishing-rod-anim">🎣</div>
                <div class="fishing-line-anim"></div>
                <div class="fishing-water-anim">
                    <div class="wave-anim"></div>
                    <div class="wave-anim"></div>
                    <div class="wave-anim"></div>
                </div>
                <p class="fishing-status-text">Casting line...</p>
            </div>
        `;
        this.ui.fishingArea.appendChild(animationContainer);
        this.ui.fishingArea.classList.remove('hidden');

        const statusText = animationContainer.querySelector('.fishing-status-text');

        // setTimeout(() => {
        //     if (statusText) statusText.textContent = "Waiting for a bite...";
        // }, 1000);

        // setTimeout(() => {
        //      if (statusText) statusText.textContent = "Something's biting!";
        // }, 2000);

        setTimeout(() => {
            this.startFishing(areaKey);
        }, 1000);
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

        for (let i = 0; i < fishCaughtCount; i++) {
            const roll = Math.random();
            let itemId = null;

            if (roll < this.FISH_CHANCE_SMALL) {
                itemId = 'small_fish';
            } else if (roll < this.FISH_CHANCE_SMALL + this.FISH_CHANCE_MEDIUM) {
                itemId = 'medium_fish';
            } else {
                itemId = 'large_fish';
            }

            if (itemId) {
                const createdItem = this.game.createItem(itemId);
                if (createdItem) {
                    caughtItems.push(createdItem);
                } else {
                    console.error(`Failed to create item with ID: ${itemId}`);
                }
            }
        }

             if (caughtItems.length > 0) {
                this.game.enterLootState(0, caughtItems);
             } else {
                 this.game.addLog("You didn't find anything useful this time.");
                 this.game.proceedToNextRound(); // Proceed if nothing caught
             }
    }
}
