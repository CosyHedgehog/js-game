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

        if (this.ui.roundAreaElement) {
            this.ui.roundAreaElement.classList.remove('round-pulsing'); void this.ui.roundAreaElement.offsetWidth; this.ui.roundAreaElement.classList.add('round-pulsing');
        }
    }
}