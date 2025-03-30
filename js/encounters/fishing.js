ENCOUNTERS.fishing = {
    getText: () => 'Go Fishing!',
    getDetails: () => 
        "Try your luck fishing!\n" +
        "You might catch 1-5 fish of varying sizes:\n" +
        "- Small Fish (Common) - Heals 2 HP\n" +
        "- Medium Fish (Uncommon) - Heals 5 HP\n" +
        "- Large Fish (Rare) - Heals 8 HP\n\n" +
        "Go fishing?",
    handle: (game, ui) => {
        const hasFishingRod = game.player.inventory.some(item => item && item.id === 'fishing_rod');
        if (!hasFishingRod) {
            game.addLog("You need a Fishing Rod to fish here!");
            game.proceedToNextRound();
            return;
        }

        game.state = 'fishing';
        game.addLog("You found a good fishing spot and cast your line!");

        const fishCaught = getRandomInt(1, 5);
        game.addLog(`You caught ${fishCaught} fish!`);

        const caughtItems = [];
        for (let i = 0; i < fishCaught; i++) {
            const roll = Math.random();
            let cumulative = 0;
            
            for (const fish of FISHING_LOOT_TABLE) {
                cumulative += fish.chance;
                if (roll < cumulative) {
                    const fishItem = createItem(fish.itemId);
                    if (fishItem) {
                        fishItem.selected = true;
                        caughtItems.push(fishItem);
                    }
                    break;
                }
            }
        }

        game.enterLootState(0, caughtItems);
    }
}