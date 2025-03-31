class Log {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    showLog() {
        if (!this.ui.outputLogArea.classList.contains('hidden')) {
            this.hideLog();
            return;
        }
        this.ui.outputLogArea.classList.remove('hidden');
        if (this.ui.toggleLogButton) {
            this.ui.toggleLogButton.textContent = 'Hide Log';
        }
        this.renderLog();
    }

    hideLog() {
        this.ui.outputLogArea.classList.add('hidden');
        if (this.toggleLogButton) {
            this.toggleLogButton.textContent = 'Show Log';
        }
    }

    renderLog() {
        if (!this.ui.outputLog || !this.ui.outputLogArea) {
            console.error("UI Error: Cannot render log, outputLog or outputLogArea element not found.");
            return;
        }

        this.ui.outputLog.innerHTML = '';
        this.game.logMessages.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            this.ui.outputLog.appendChild(li);
        });

        if (this.ui.outputLogArea) {
            this.ui.outputLogArea.scrollTop = this.ui.outputLogArea.scrollHeight;
        }
    }
}
