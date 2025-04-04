class Rest {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }
    
    handle() {
        this.game.state = 'rest';
        this.game.addLog("The warmth of the fire is inviting. What will you do?");
        this.showRestChoicesUI();
    }

    showRestChoicesUI() {
        this.ui.clearMainArea(); // Clear previous content

        const restArea = this.ui.restArea;
        restArea.id = 'rest-area'; // Keep the ID for potential styling/splats
        restArea.classList.remove('hidden'); // Ensure it's visible

        const minHealPercent = 0.3;
        const maxHealPercent = 0.7;
        const minHealAmount = Math.floor(this.game.player.getMaxHealth() * minHealPercent);
        const maxHealAmount = Math.ceil(this.game.player.getMaxHealth() * maxHealPercent);

        const minMeditateHealPercent = 0.15;
        const maxMeditateHealPercent = 0.30;
        const minMeditateHealAmount = Math.floor(this.game.player.getMaxHealth() * minMeditateHealPercent);
        const maxMeditateHealAmount = Math.ceil(this.game.player.getMaxHealth() * maxMeditateHealPercent);

        restArea.innerHTML = `
            <div class="rest-campfire-container">
                 <div class="rest-campfire-icon">🔥</div> 
                 <h3>A Moment's Respite</h3>
                 <p class="rest-prompt">The warmth of the fire is inviting. What will you do?</p>
                 <div class="rest-choices">
                     <div class="rest-choice">
                         <h4>Rest by the Fire</h4>
                         <p>Recover a good portion of health (${minHealAmount}-${maxHealAmount} HP).</p>
                         <button id="rest-heal-button">Heal</button>
                     </div>
                     <div class="rest-choice">
                         <h4>Sleep Soundly</h4>
                         <p>Bolster your constitution, increasing maximum health by 3.</p>
                         <button id="rest-sleep-button">Increase Max HP</button>
                     </div>
                     <div class="rest-choice">
                         <h4>Meditate by the Flames</h4>
                         <p>Focus your inner strength. Max HP +1, recover some health (${minMeditateHealAmount}-${maxMeditateHealAmount} HP).</p>
                         <button id="rest-meditate-button">Meditate</button>
                     </div>
                 </div>
            </div>
        `;

        document.getElementById('main-content').appendChild(restArea);

        const healButton = document.getElementById('rest-heal-button');
        healButton.onclick = () => this.handleRestHeal();

        const sleepButton = document.getElementById('rest-sleep-button');
        sleepButton.onclick = () => this.handleRestSleep();

        const meditateButton = document.getElementById('rest-meditate-button');
        meditateButton.onclick = () => this.handleRestMeditate();
    }

    handleRestHeal() {
        // 1. Update UI first
        const restArea = document.getElementById('rest-area');
        if (restArea) {
            restArea.innerHTML = `
                <div class="rest-campfire-container">
                    <div class="rest-campfire-icon">🔥</div>
                    <p class="rest-message">You feel rested.</p>
                </div>
            `;
        } else {
            console.error("Rest area not found to update UI!");
            // Proceed even if UI fails, but log the error
        }

        // 2. Calculate effects
        const healPercent = 0.3 + Math.random() * 0.4; // 30% to 70%
        const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent);
        const actualHealed = this.game.player.heal(healAmount);
        
        // 3. Log result
        let message = `You rest by the fire and recover ${actualHealed} HP.`;
        this.game.addLog(message);
        
        // 4. Update stats display
        this.ui.updatePlayerStats();
        
        // 5. Show splat(s) over the new UI (with slight delay for DOM update)
        setTimeout(() => {
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal');
        }, 50); // Small delay
        
        // 6. Add Continue button
        this.addContinueButton();
    }

    handleRestSleep() {
        // 1. Update UI first
        const restArea = document.getElementById('rest-area');
        if (restArea) {
            restArea.innerHTML = `
                <div class="rest-campfire-container">
                    <div class="rest-campfire-icon">🔥</div>
                    <p class="rest-message">You feel rested.</p>
                </div>
            `;
        } else {
            console.error("Rest area not found to update UI!");
        }

        // 2. Calculate effects
        const maxHpIncrease = 3;
        this.game.player.maxHealth += maxHpIncrease;
        const actualHealed = this.game.player.heal(maxHpIncrease); 

        // 3. Log result
        let message = `You sleep soundly. Your maximum HP increases by ${maxHpIncrease} (now ${this.game.player.getMaxHealth()}).`;
        if (actualHealed > 0) {
            message += ` You feel refreshed, recovering ${actualHealed} HP.`;
        }
        this.game.addLog(message);
        
        // 4. Update stats display
        this.ui.updatePlayerStats();
        
        // 5. Show splat(s) over the new UI (with delays)
        setTimeout(() => {
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal');

            // Show separate splat for Max HP increase after a further delay
            setTimeout(() => {
                this.ui.createDamageSplat('#rest-area .rest-campfire-container', `+${maxHpIncrease} Max HP`, 'max-hp');
            }, 500); // Delay for Max HP splat relative to heal splat
        }, 50); // Small initial delay
        
        // 6. Add Continue button
        this.addContinueButton();
    }

    handleRestMeditate() {
        // 1. Update UI first
        const restArea = document.getElementById('rest-area');
        if (restArea) {
            restArea.innerHTML = `
                <div class="rest-campfire-container">
                    <div class="rest-campfire-icon">🔥</div>
                    <p class="rest-message">You feel rested.</p>
                </div>
            `;
        } else {
            console.error("Rest area not found to update UI!");
        }

        // 2. Calculate effects
        const maxHpIncrease = 1;
        this.game.player.maxHealth += maxHpIncrease;
  
        const healPercent = 0.15 + Math.random() * 0.15; // 15% to 30%
        const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent); 
        const actualHealed = this.game.player.heal(healAmount);
  
        // 3. Log result
        let message = `You meditate, strengthening your body and mind. Max HP +${maxHpIncrease} (now ${this.game.player.getMaxHealth()}).`;
        if (actualHealed > 0) { 
            message += ` You recover ${actualHealed} HP.`
        }
        this.game.addLog(message);
        
        // 4. Update stats display
        this.ui.updatePlayerStats();
  
        // 5. Show splat(s) over the new UI (with delays)
        setTimeout(() => {
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal');

            // Show separate splat for Max HP increase after a further delay
            setTimeout(() => {
                this.ui.createDamageSplat('#rest-area .rest-campfire-container', `+${maxHpIncrease} Max HP`, 'max-hp');
            }, 500); // Delay for Max HP splat relative to heal splat
        }, 50); // Small initial delay
  
        // 6. Add Continue button
        this.addContinueButton();
    }

    addContinueButton() {
        const restContainer = document.querySelector('#rest-area .rest-campfire-container');
        if (restContainer) {
            const continueButton = document.createElement('button');
            continueButton.id = 'rest-continue-button';
            continueButton.textContent = 'Continue Journey';
            continueButton.onclick = () => this.endRestEvent();
            restContainer.appendChild(continueButton);
        } else {
            console.error("Cannot add continue button: Rest container not found.");
            // Fallback: proceed automatically if UI element is missing
            this.endRestEvent();
        }
    }

    endRestEvent() {
        // Proceed immediately when called
        this.ui.clearMainArea();
        this.game.proceedToNextRound();
    }
}
