class Treasure {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    handle() {
        this.game.state = 'looting';
        this.game.addLog("You find a treasure chest!");
        const goldFound = this.game.getRandomInt(1, 15);
        this.game.addLog(`You open it and find ${goldFound} gold!`);
        this.game.enterLootState(goldFound, []);
    }
}   