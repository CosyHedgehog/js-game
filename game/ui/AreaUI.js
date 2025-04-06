class AreaUI {
    constructor(ui) { this.ui = ui; }

    render(areaName) {
        this.ui.clearMainArea();
        const transitionDiv = document.createElement('div');
        transitionDiv.id = 'area-transition-screen';
        transitionDiv.className = 'area-transition-container';
        const title = document.createElement('h2');
        title.textContent = `Entering ${areaName}...`;
        const continueButton = document.createElement('button');
        continueButton.id = 'area-transition-continue-button';
        continueButton.textContent = 'Venture Forth';
        continueButton.onclick = () => {
            transitionDiv.classList.add('fade-out');
            continueButton.disabled = true;
            setTimeout(() => {
                this.ui.game.continueAfterAreaTransition();
            }, 500);
        };
        transitionDiv.appendChild(title);
        transitionDiv.appendChild(continueButton);
        this.ui.mainContent.appendChild(transitionDiv);
    }
}

