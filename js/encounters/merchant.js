ENCOUNTERS.wandering_merchant = {
    getText: () => "Meet Wandering Merchant",
    getDetails: (data, game) =>
        "A mysterious merchant offers unique services:\n" +
        "- Combine items into powerful artifacts\n" +
        "- Enhance weapons with magical power\n" +
        "- Transform shields into weapons\n\n" +
        `Current gold: ${game.player.gold}\n\n` +
        "Meet the merchant?",
    handle: (game, ui) => {
        game.state = 'wandering_merchant';
        game.addLog("You encounter a mysterious wandering merchant with unique offerings.");
        ui.showWanderingMerchantUI(MERCHANT_SPECIAL_OFFERS);
    }
}