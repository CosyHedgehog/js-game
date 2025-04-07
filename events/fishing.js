class Fishing {

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    FISHING_AREAS = {
        shoreline: {
            name: 'Shallow Shoreline',
            description: 'Scrounge near the water\'s edge for anything edible. Contains Small Fish and Medium Fish.',
            fishRange: [1, 2],
            lootTable: [
                { itemId: 'small_fish', chance: 0.75 },
                { itemId: 'medium_fish', chance: 0.25 }
            ],
            monsterChance: 0.05,
            requiresRod: false
        },
        safe: {
            name: 'Calm Waters',
            description: 'A peaceful fishing spot. Low risk, low reward. Contains Small Fish and Medium Fish.',
            fishRange: [1, 3],
            lootTable: [
                { itemId: 'small_fish', chance: 0.65 },
                { itemId: 'medium_fish', chance: 0.35 },
            ],
            monsterChance: 0.1,
            requiresRod: true
        },
        moderate: {
            name: 'Rushing Stream',
            description: 'A faster flowing area. Medium risk, medium reward. Contains Small Fish, Medium Fish, and Large Fish.',
            fishRange: [2, 4],
            lootTable: [
                { itemId: 'small_fish', chance: 0.40 },
                { itemId: 'medium_fish', chance: 0.45 },
                { itemId: 'large_fish', chance: 0.15 }
            ],
            monsterChance: 0.3,
            requiresRod: true
        },
        dangerous: {
            name: 'Deep Waters',
            description: 'A treacherous fishing spot. High risk, high reward. Contains Small Fish, Medium Fish, and Large Fish.',
            fishRange: [4, 6],
            lootTable: [
                { itemId: 'small_fish', chance: 0.15 },
                { itemId: 'medium_fish', chance: 0.50 },
                { itemId: 'large_fish', chance: 0.35 }
            ],
            monsterChance: 0.6,
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
            const requirementText = needsRod && !hasFishingRod ? '<span class="requirement-missing">(Requires Fishing Rod)</span>' : '';
            const isDisabled = needsRod && !hasFishingRod ? 'disabled' : '';

            // Generate the actual requirement text span OR an empty string
            const actualRequirement = needsRod && !hasFishingRod ? `<span class="requirement-missing">Requires Fishing Rod</span>` : '';

            // Create placeholder text with the same content for height calculation, but make it invisible via CSS later
            const placeholder = `<span class="requirement-placeholder">Requires Fishing Rod</span>`;

            // Use the actual requirement if it exists, otherwise use the placeholder structure
            const requirementContent = actualRequirement || placeholder;

            return `
                    <div class="choice-card" data-area="${key}">
                        <h4 class="choice-title">${area.name}</h4>
                        ${requirementContent}
                        <p class="choice-description">${area.description}</p>
                        <div class="monster-stats-grid">
                            <span class="fishing-stat">Fish: ${area.fishRange[0]}-${area.fishRange[1]}</span>
                            <span class="fishing-stat monster-chance-stat">
                                <span class="fishing-stat-label">Monster Chance</span>
                                <span class="fishing-stat-value">${Math.round(area.monsterChance * 100)}%</span>
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
                this.game.proceedToNextRound();
                return;
            }
        }

        this.game.addLog(`You ${areaKey === 'shoreline' ? 'start searching' : 'cast your line'} in the ${area.name}...`);
        const fishCaughtCount = this.game.getRandomInt(area.fishRange[0], area.fishRange[1]);
        const caughtItems = [];

        const currentLootTable = area.lootTable;
        for (let i = 0; i < fishCaughtCount; i++) {
            const roll = Math.random();
            let cumulative = 0;
            for (const fish of currentLootTable) {
                cumulative += fish.chance;
                if (roll < cumulative) {
                    const fishItem = this.game.createItem(fish.itemId);
                    if (fishItem) {
                        caughtItems.push(fishItem);
                    }
                    break;
                }
            }
        }

        if (Math.random() < area.monsterChance) {
            this.game.addLog("Suddenly, something emerges from the water!");
            const monsterId = 'river_troll';
            const monsterData = MONSTERS[monsterId];
            if (!monsterData) {
                console.error("Monster data not found:", monsterId);
                this.game.addLog("An unknown creature appears!");
                this.game.proceedToNextRound();
                return;
            }
            this.game.currentCombat = new Combat(this.game.player, monsterData, this.game, this.ui);
            this.game.state = 'combat';
            this.game.currentCombat.start();
        } else {
            this.game.enterLootState(0, caughtItems);
        }
    }
}
