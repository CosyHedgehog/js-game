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
                <h2 style="color: green;">Victory!</h2>
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
        const playAgainButtons = document.querySelectorAll('#play-again-button');
        console.log("playAgainButtons", playAgainButtons);
        if (playAgainButtons.length > 0) {
            playAgainButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Disable button to prevent multiple clicks during fade
                    button.disabled = true;
                    
                    const fadeDuration = 500; // Match CSS animation duration

                    // Start fade out
                    document.body.classList.add('body-fade-out');

                    // Wait for fade out animation
                    setTimeout(() => {
                        // Remove end screen elements
                        const backdrops = document.querySelectorAll('.escape-backdrop');
                        const containers = document.querySelectorAll('.game-over-container');
                        backdrops.forEach(backdrop => backdrop.remove());
                        containers.forEach(container => container.remove());

                        // Restart game
                        window.game = new Game();
                        window.game.start();

                        // Remove fade-out and start fade-in
                        document.body.classList.remove('body-fade-out');
                        document.body.classList.add('body-fade-in');

                        // Clean up fade-in class after animation
                        setTimeout(() => {
                            document.body.classList.remove('body-fade-in');
                        }, fadeDuration);

                    }, fadeDuration);
                });
            });
        } else {
            console.error('Could not find any play-again-buttons!');
        }
    }
}
