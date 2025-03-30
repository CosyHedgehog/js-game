function createEncounter(options) {
    return {
        getText: options.getText || (() => options.name),
        getDetails: options.getDetails || (() => options.description),
        handle: options.handle
    };
}


function createShopEncounter(options) {
    return {
        getText: () => options.name,
        getDetails: (data, game) => 
            `${options.description}\n\n` +
            `Current gold: ${game.player.gold}\n\n` +
            `${options.prompt}`,
        handle: (game, ui) => {
            game.state = options.state;
            game.addLog(options.entryMessage);
            game.currentShopItems = options.generateItems();
            if (options.canReroll !== undefined) {
                game.shopCanReroll = options.canReroll;
            }
            options.showUI(ui, game.currentShopItems);
        }
    };
}