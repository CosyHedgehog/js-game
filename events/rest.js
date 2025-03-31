class Rest {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    
    handle() {
        this.game.state = 'rest';
        
        // Increase max HP by 1 FIRST
        this.game.player.maxHealth += 1;
        
        // Calculate and apply healing based on the NEW max health
        const healPercent = 0.2 + Math.random() * 0.5; // Random between 20-70%
        const healAmount = Math.floor(game.player.maxHealth * healPercent); // Heal based on new max HP
        const actualHealed = game.player.heal(healAmount);
        
        // Create detailed message (reflecting the order)
        let message = `Your maximum HP increases by 1 (now ${game.player.maxHealth}).`;
        message += `\nYou rest by the fire and recover ${actualHealed} HP.`; // Updated message
        
        this.game.addLog(message);
        
        // Update UI stats immediately
        this.ui.updatePlayerStats();
        
        const restArea = document.getElementById('rest-area');
        restArea.classList.remove('hidden');
        // Add a container div with a specific class for styling
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
        
        // THEN create the heal splat animation
        if (actualHealed > 0) {
            // Short delay to ensure the element is definitely rendered
            setTimeout(() => {
                 this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal'); 
            }, 50); // 50ms delay should be sufficient
        }
    }
}
