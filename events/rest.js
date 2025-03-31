class Rest {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    
    handle() {
        this.game.state = 'rest';
        this.game.player.maxHealth += 1;
        
        const healPercent = 0.2 + Math.random() * 0.5;
        const healAmount = Math.floor(game.player.maxHealth * healPercent);
        const actualHealed = game.player.heal(healAmount);
        
        let message = `Your maximum HP increases by 1 (now ${game.player.maxHealth}).`;
        message += `\nYou rest by the fire and recover ${actualHealed} HP.`;
        
        this.game.addLog(message);
        this.ui.updatePlayerStats();
        
        const restArea = document.getElementById('rest-area');
        restArea.classList.remove('hidden');
        restArea.innerHTML = `
            <div class="rest-campfire-container">
                 <div class="rest-campfire-icon">&#128150;</div> 
                 <h3>A Moment's Respite</h3>
                 <p class="rest-message">${message.replace(/\\n/g, '<br>')}</p> 
                 <button id="rest-continue-button">Continue Journey</button>
            </div>
        `;
        
        const continueButton = document.getElementById('rest-continue-button');
        continueButton.onclick = () => {
            restArea.classList.add('hidden');
            this.ui.game.proceedToNextRound();
        };
        
        if (actualHealed > 0) {
            setTimeout(() => {
                 this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal'); 
            }, 50);
        }
    }
}
