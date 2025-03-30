class Armoury {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        const hasHammer = game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            game.addLog("You need a Blacksmith Hammer to use the armoury!");
            game.proceedToNextRound();
            return;
        }
        game.state = 'armourer';
        game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        ui.showArmourerUI();
    }
}
