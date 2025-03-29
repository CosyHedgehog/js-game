// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI(null); // Create UI first
    const game = new Game(ui); // Then create Game, passing UI

    const playButton = document.getElementById('play-button');
    const quitButton = document.getElementById('quit-button');
    const restartButton = document.getElementById('restart-button');

    playButton.addEventListener('click', () => {
        game.startGame();
    });

    quitButton.addEventListener('click', () => {
        // In a browser context, closing the window might be blocked.
        // We can just disable the game or go back to a blank state.
        ui.addLog("Quitting... (Reload page to play again)");
        // Or potentially: window.close(); but it often doesn't work.
        playButton.disabled = true;
        quitButton.disabled = true;
        ui.switchScreen('start-screen'); // Go back to start maybe
    });

    restartButton.addEventListener('click', () => {
        // Resetting requires creating a new game instance or a deep reset method
        // Easiest for now: reload the page
        window.location.reload();
        // Or:
        // game = new Game(ui); // Create new game instance
        // ui.game = game; // Update UI's game reference
        // ui.switchScreen('start-screen');
        // ui.outputLog.innerHTML = ''; // Clear log visually
    });

    // Initial setup
    ui.switchScreen('start-screen');

});