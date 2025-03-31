class Fishing {

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    FISHING_LOOT_TABLE = [
        { itemId: 'small_fish', chance: 0.6 },
        { itemId: 'medium_fish', chance: 0.3 },
        { itemId: 'large_fish', chance: 0.1 }
    ];

    FISHING_AREAS = {
        safe: {
            name: 'Calm Waters',
            description: 'A peaceful fishing spot. Low risk, low reward.',
            fishRange: [1, 3],
            monsterChance: 0
        },
        moderate: {
            name: 'Rushing Stream',
            description: 'A faster flowing area. Medium risk, medium reward.',
            fishRange: [2, 4],
            monsterChance: 0.3
        },
        dangerous: {
            name: 'Deep Waters',
            description: 'A treacherous fishing spot. High risk, high reward.',
            fishRange: [4, 6],
            monsterChance: 0.6
        }
    };

    handle() {
        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');
        if (!hasFishingRod) {
            this.game.addLog("You need a Fishing Rod to fish here!");
            this.game.proceedToNextRound();
            return;
        }

        this.game.state = 'fishing';
        this.showFishingAreaSelection();
    }

    showFishingAreaSelection() {
        this.ui.clearMainArea();

        const fishingArea = document.getElementById('fishing-area');
        fishingArea.classList.remove('hidden');
        fishingArea.innerHTML = `
            <h3>Choose a Fishing Spot</h3>
            <div class="fishing-areas-container">
                ${Object.entries(this.FISHING_AREAS).map(([key, area]) => `
                    <div class="fishing-area-option" data-area="${key}">
                        <h4>${area.name}</h4>
                        <p>${area.description}</p>
                        <div class="fishing-area-details">
                            <p>Fish: ${area.fishRange[0]}-${area.fishRange[1]}</p>
                            <p>Monster Chance: ${Math.round(area.monsterChance * 100)}%</p>
                        </div>
                        <button class="fishing-area-button">Fish Here</button>
                    </div>
                `).join('')}
            </div>
        `;

        const fishingButtons = fishingArea.querySelectorAll('.fishing-area-button');
        fishingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const areaKey = button.closest('.fishing-area-option').dataset.area;
                this.startFishing(areaKey);
            });
        });
    }

    startFishing(areaKey) {
        const area = this.FISHING_AREAS[areaKey];
        this.game.addLog(`You cast your line in the ${area.name}!`);
        const fishCaught = this.game.getRandomInt(area.fishRange[0], area.fishRange[1]);
        const caughtItems = [];
        for (let i = 0; i < fishCaught; i++) {
            const roll = Math.random();
            let cumulative = 0;
            for (const fish of this.FISHING_LOOT_TABLE) {
                cumulative += fish.chance;
                if (roll < cumulative) {
                    const fishItem = this.game.createItem(fish.itemId);
                    if (fishItem) {
                        fishItem.selected = true;
                        caughtItems.push(fishItem);
                    }
                    break;
                }
            }
        }

        if (Math.random() < area.monsterChance) {
            this.game.addLog("Suddenly, a river troll monster appears!");
            this.game.currentCombat = new Combat(this.game.player, MONSTERS['river_troll'], this.game, this.ui);
            this.game.state = 'combat';
            this.game.currentCombat.start();
        } else {
            this.game.enterLootState(0, caughtItems);
        }
    }
}
