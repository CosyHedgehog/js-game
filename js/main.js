document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI(null);
    const game = new Game(ui);

    const playButton = document.getElementById('play-button');
    const quitButton = document.getElementById('quit-button');
    const restartButton = document.getElementById('restart-button');

    playButton.addEventListener('click', () => {
        game.startGame();
    });

    quitButton.addEventListener('click', () => {
        ui.addLog("Quitting... (Reload page to play again)");
        playButton.disabled = true;
        quitButton.disabled = true;
        ui.switchScreen('start-screen');
    });

    restartButton.addEventListener('click', () => {
        window.location.reload();
    });

    ui.switchScreen('start-screen');
});