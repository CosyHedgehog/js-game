ENCOUNTERS.trap = createEncounter({
    name: "Investigate Suspicious Area",
    description: "You notice something odd about this area.\nIt could be dangerous, but might hide treasure.\n\nInvestigate?",
    handle: (game, ui) => {
        game.state = 'trap';
        const roll = Math.random();
        if (roll < 0.3) { // 30% chance of treasure
            game.addLog("You carefully avoid the trap and find treasure!");
            game.enterLootState(getRandomInt(5, 15), []); // Gold reward
        } else {
            const damage = getRandomInt(3, 8);
            game.player.takeDamage(damage);
            game.addLog(`You trigger a trap and take ${damage} damage!`);
            ui.updatePlayerStats();
            game.proceedToNextRound();
        }
    }
})