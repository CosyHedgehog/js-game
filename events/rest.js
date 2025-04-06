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
        this.ui.clearMainArea();
        const restArea = this.ui.restArea;
        restArea.id = 'rest-area';        restArea.classList.remove('hidden');
        const minHealPercent = 0.5;
        const maxHealPercent = 0.9;
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
                     <div class="rest-card">
                         <h4>Rest by the Fire</h4>
                         <p>Recover a good portion of health (${minHealAmount}-${maxHealAmount} HP).</p>
                         <button id="rest-heal-button">Heal</button>
                     </div>
                     <div class="rest-card">
                         <h4>Sleep Soundly</h4>
                         <p>Bolster your constitution, increasing maximum health by 3.</p>
                         <button id="rest-sleep-button">Increase Max HP</button>
                     </div>
                     <div class="rest-card">
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

               const healPercent = 0.3 + Math.random() * 0.4;        const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent);
        const actualHealed = this.game.player.heal(healAmount);

               let message = `You rest by the fire and recover ${actualHealed} HP.`;
        this.game.addLog(message);

               this.ui.updatePlayerStats();

               setTimeout(() => {
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal');
        }, 50);
               this.addContinueButton();
    }

    handleRestSleep() {
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

               const maxHpIncrease = 3;
        this.game.player.maxHealth += maxHpIncrease;
       
               let message = `You sleep soundly. Your maximum HP increases by ${maxHpIncrease} (now ${this.game.player.getMaxHealth()}).`;
                             this.game.addLog(message);

               this.ui.updatePlayerStats();

               this.ui.createDamageSplat('#rest-area .rest-campfire-container', `${maxHpIncrease} Max HP`, 'max-hp');

               this.addContinueButton();
    }

    handleRestMeditate() {
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

        const maxHpIncrease = 1;
        setTimeout(() => {
            this.game.player.maxHealth += maxHpIncrease;
            this.ui.updatePlayerStats();
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', `${maxHpIncrease} Max HP`, 'max-hp');

            setTimeout(() => {
                const healPercent = 0.15 + Math.random() * 0.15;                const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent);
                const actualHealed = this.game.player.heal(healAmount);

                let message = `You meditate, strengthening your body and mind. Max HP +${maxHpIncrease} (now ${this.game.player.getMaxHealth()}).`;
                if (actualHealed > 0) {
                    message += ` You recover ${actualHealed} HP.`
                }
                this.game.addLog(message);

                this.ui.updatePlayerStats();
                this.ui.createDamageSplat('#rest-area .rest-campfire-container', actualHealed, 'heal');
            }, 500);
        }, 50);

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
                       this.endRestEvent();
        }
    }

    endRestEvent() {
               this.ui.clearMainArea();
        this.game.proceedToNextRound();
    }
}
