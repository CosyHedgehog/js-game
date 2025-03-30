class Sharpen {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        this.game.state = 'sharpen';
        this.game.addLog("You find a sharpening stone. You can use it to enhance a weapon's attack power.");
        this.ui.showSharpenUI();
    }
}
