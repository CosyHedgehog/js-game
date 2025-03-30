ENCOUNTERS.shrine = {
    getText: () => "Approach Mystic Shrine",
    getDetails: (data, game) => 
        "A mysterious shrine pulses with ancient magic.\n" +
        "Offer gold to receive random beneficial effects:\n" +
        "- Minor Blessing (5 gold): Small stat boost\n" +
        "- Major Blessing (15 gold): Significant enhancement\n" +
        "- Divine Favor (30 gold): Powerful permanent upgrade\n\n" +
        `Current gold: ${game.player.gold}\n\n` +
        "Approach the shrine?",
    handle: (game, ui) => {
        game.state = 'shrine';
        game.addLog("You discover a mysterious shrine pulsing with ancient magic.");
        ui.showShrineUI();
    }
}