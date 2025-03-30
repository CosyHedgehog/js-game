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
        this.game.state = 'armourer';
        this.game.addLog("You find an Armourer's tools. You can use them to reinforce a piece of armor.");
        this.ui.showArmourerUI();
    }
}
