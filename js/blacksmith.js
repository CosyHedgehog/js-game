class Blacksmith {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    handle() {
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        if (!hasHammer) {
            this.game.addLog("You need a Blacksmith Hammer to use the forge!");
            this.game.proceedToNextRound();
            return;
        }
        this.game.state = 'blacksmith';
        this.game.addLog("You find a Blacksmith's forge. The smith offers to combine similar items.");
        this.ui.showBlacksmithUI();
    }
}
