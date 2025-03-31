class Monster {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle(monsterId) {
        const monsterData = MONSTERS[monsterId];
        if (!monsterData) {
            console.error("Monster data not found:", monsterId);
            this.game.addLog("Error: Encountered an unknown creature.");
            this.game.proceedToNextRound();
            return;
        }
        this.game.addLog(`You encounter a ${monsterData.name}!`);
        this.game.currentCombat = new Combat(this.game.player, monsterData, this.game, this.ui);
        this.game.state = 'combat';
        this.game.currentCombat.start();
    }
}