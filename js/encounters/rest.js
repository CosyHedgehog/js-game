ENCOUNTERS.rest = {
    getText: () => 'Rest Site',
    getDetails: (data, game) => 
        `Rest at this site to recover 20-70% of your maximum health (${Math.floor(game.player.maxHealth * 0.2)}-${Math.floor(game.player.maxHealth * 0.7)} HP).\n` +
        `Your maximum HP will also increase by 1.\n\n` +
        `Do you want to rest here?`,
    handle: (game, ui) => {
        game.state = 'rest';
        const healPercent = 0.2 + Math.random() * 0.5;
        const healAmount = Math.floor(game.player.maxHealth * healPercent);
        const actualHealed = game.player.heal(healAmount);
        game.player.maxHealth += 1;
        
        let message = `You rest and recover ${actualHealed} HP.`;
        message += `\nYour maximum HP increases by 1 (now ${game.player.maxHealth}).`;
        game.addLog(message);
        ui.updatePlayerStats();
        ui.showRestUI(message);
    }
}