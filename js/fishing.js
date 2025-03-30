class Fishing {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        const hasFishingRod = this.game.player.inventory.some(item => item && item.id === 'fishing_rod');
        if (!hasFishingRod) {
            this.game.addLog("You need a Fishing Rod to fish here!");
            this.game.proceedToNextRound();
            return;
        }

        this.game.state = 'fishing';
        this.game.addLog("You found a good fishing spot and cast your line!");

        // Rest of the fishing logic remains the same
        const fishCaught = this.game.getRandomInt(1, 5);
        this.game.addLog(`You caught ${fishCaught} fish!`);

        // Generate fish based on rarity
        const caughtItems = [];
        for (let i = 0; i < fishCaught; i++) {
            const roll = Math.random();
            let cumulative = 0;

            for (const fish of FISHING_LOOT_TABLE) {
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

        this.game.enterLootState(0, caughtItems); // No gold, just fish
    }
}
