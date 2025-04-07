class EndUI {
    constructor(ui) { 
        this.ui = ui; 
    }

    render(win) {
        const backdrop = document.createElement('div');
        backdrop.className = 'escape-backdrop';
        document.body.appendChild(backdrop);

        const container = document.createElement('div');
        container.className = 'game-over-container';

        let content = '';
        if (win) {
            content = `
                <h2>Victory!</h2>
                <p>You have defeated the Ancient Dragon and saved the realm!</p>
                <p>Congratulations on completing your quest.</p>
                <button id="play-again-button">Play Again</button>
            `;
        } else {
            content = `
                <h2>Game Over</h2>
                <p>Your journey has come to an end...</p>
                <p>Better luck on your next adventure!</p>
                <button id="play-again-button">Play Again</button>
            `;
        }
        container.innerHTML = content;
        document.body.appendChild(container);

        const playAgainButton = container.querySelector('#play-again-button');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                backdrop.remove();
                container.remove();
                window.game = new Game();
                window.game.start();
            });
        } else {
            console.error('Could not find play-again-button within the container!');
        }
    }
}
