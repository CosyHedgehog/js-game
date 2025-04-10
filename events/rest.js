// Configuration for Rest event values
const REST_FIRE_MIN_HEAL_PERCENT = 0.70; // 30%
const REST_FIRE_MAX_HEAL_PERCENT = 0.90; // 70%

const REST_SLEEP_MAX_HP_INCREASE = 3;

const REST_MEDITATE_MAX_HP_INCREASE = 1;
const REST_MEDITATE_MIN_HEAL_PERCENT = 0.25; // 15%
const REST_MEDITATE_MAX_HEAL_PERCENT = 0.50; // 30%

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
        restArea.id = 'rest-area'; restArea.classList.remove('hidden');
        
        // Use constants for display ranges
        const minHealAmount = Math.floor(this.game.player.getMaxHealth() * REST_FIRE_MIN_HEAL_PERCENT);
        const maxHealAmount = Math.ceil(this.game.player.getMaxHealth() * REST_FIRE_MAX_HEAL_PERCENT);
        const minMeditateHealAmount = Math.floor(this.game.player.getMaxHealth() * REST_MEDITATE_MIN_HEAL_PERCENT);
        const maxMeditateHealAmount = Math.ceil(this.game.player.getMaxHealth() * REST_MEDITATE_MAX_HEAL_PERCENT);

        restArea.innerHTML = `
            <div class="rest-campfire-container">
                 <div class="rest-campfire-icon">🔥</div>
                 <h3>A Moment's Respite</h3>
                 <p class="rest-prompt">The warmth of the fire is inviting. What will you do?</p>
                 <div class="rest-choices">
                     <div class="rest-card">
                         <h4>Rest by the Fire</h4>
                         <p>A hearty rest by the fire.</p>
                         <div class="rest-stats-grid">
                             <span class="rest-stat rest-heal">${minHealAmount}-${maxHealAmount} HP</span>
                         </div>
                         <button id="rest-heal-button">Rest</button>
                     </div>
                    <div class="rest-card">
                         <h4>Meditate by the Flames</h4>
                         <p>Focus your inner strength.</p>
                         <div class="rest-stats-grid">
                            <span class="rest-stat rest-heal">${minMeditateHealAmount}-${maxMeditateHealAmount} HP</span>
                            <span class="rest-stat rest-maxhp">${REST_MEDITATE_MAX_HP_INCREASE} Max HP</span>
                         </div>
                         <button id="rest-meditate-button">Meditate</button>
                     </div>
                     <div class="rest-card">
                         <h4>Sleep Soundly</h4>
                         <p>Bolster your constitution.</p>
                         <div class="rest-stats-grid">
                            <span class="rest-stat rest-maxhp">${REST_SLEEP_MAX_HP_INCREASE} Max HP</span>
                         </div>
                         <button id="rest-sleep-button">Sleep</button>
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

        // Use constants for calculation
        const healRange = REST_FIRE_MAX_HEAL_PERCENT - REST_FIRE_MIN_HEAL_PERCENT;
        const healPercent = REST_FIRE_MIN_HEAL_PERCENT + Math.random() * healRange;
        const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent);
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

        // Use constant for max HP increase
        const maxHpIncrease = REST_SLEEP_MAX_HP_INCREASE;
        this.game.player.maxHealth += maxHpIncrease;

        let message = `You sleep soundly. Your maximum HP increases by ${maxHpIncrease} (now ${this.game.player.getMaxHealth()}).`;
        this.game.addLog(message);

        this.ui.updatePlayerStats();

        this.ui.createDamageSplat('#rest-area .rest-campfire-container', `+${maxHpIncrease} Max HP`, 'max-hp');

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

        // Use constant for max HP increase
        const maxHpIncrease = REST_MEDITATE_MAX_HP_INCREASE;
        setTimeout(() => {
            this.game.player.maxHealth += maxHpIncrease;
            this.ui.updatePlayerStats();
            this.ui.createDamageSplat('#rest-area .rest-campfire-container', `+${maxHpIncrease} Max HP`, 'max-hp');

            setTimeout(() => {
                // Use constants for calculation
                const healRange = REST_MEDITATE_MAX_HEAL_PERCENT - REST_MEDITATE_MIN_HEAL_PERCENT;
                const healPercent = REST_MEDITATE_MIN_HEAL_PERCENT + Math.random() * healRange;
                const healAmount = Math.floor(this.game.player.getMaxHealth() * healPercent);
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
            continueButton.textContent = 'Continue';
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
