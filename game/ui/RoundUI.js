class RoundUI {
    constructor(ui) {
        this.ui = ui;
    }

    render(currentRound, maxRounds) {
        if (this.ui.statRound) {
            this.ui.statRound.textContent = currentRound;
        }
        const maxRoundEl = document.getElementById('stat-max-rounds');
        if (maxRoundEl && maxRoundEl.textContent !== maxRounds.toString()) {
            maxRoundEl.textContent = maxRounds;
        }

        if (this.ui.roundAreaElement && this.ui.statRound) {
            // Remove the old animation from the area
            this.ui.roundAreaElement.classList.remove('round-pulsing');

            // Add the new animation to the round number
            const roundNumberEl = this.ui.statRound;
            roundNumberEl.classList.remove('round-number-animated'); 
            void roundNumberEl.offsetWidth; // Trigger reflow
            roundNumberEl.classList.add('round-number-animated');

            // Handle miniboss/finalboss glow
            this.ui.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
            if (currentRound === 10 || currentRound === 20) {
                this.ui.roundAreaElement.classList.add('round-miniboss');
            } else if (currentRound === maxRounds) { 
                this.ui.roundAreaElement.classList.add('round-finalboss');
            }
        }
    }
}