// Configuration for Shrine event values
const SHRINE_ATTACK_INCREASE = 1;
const SHRINE_DEFENSE_INCREASE = 1;
const SHRINE_SPEED_REDUCTION = 0.2;

// Configuration for Shrine costs based on round
const SHRINE_COSTS_R1_5   = { hp: 5,  maxHp: 1, gold: 5  };
const SHRINE_COSTS_R6_10  = { hp: 8,  maxHp: 2, gold: 8  };
const SHRINE_COSTS_R11_15 = { hp: 11, maxHp: 3, gold: 11 };
const SHRINE_COSTS_R16_20 = { hp: 14, maxHp: 4, gold: 14 };
const SHRINE_COSTS_R21_25 = { hp: 17, maxHp: 5, gold: 17 };
const SHRINE_COSTS_R26_30 = { hp: 20, maxHp: 6, gold: 20 };

class Shrine {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        // Initialize properties to store current costs for this encounter
        this.currentHpCost = 0;
        this.currentMaxHpCost = 0;
        this.currentGoldCost = 0;
    }

    handle() {
        this.game.state = 'shrine';
        this.game.addLog("An ancient shrine pulses with power.");
        this.showShrineChoicesUI();
    }

    // Helper to get costs based on round
    getShrineCosts(round) {
        if (round <= 5) {
            return SHRINE_COSTS_R1_5;
        } else if (round <= 10) {
            return SHRINE_COSTS_R6_10;
        } else if (round <= 15) {
            return SHRINE_COSTS_R11_15;
        } else if (round <= 20) {
            return SHRINE_COSTS_R16_20;
        } else if (round <= 25) {
            return SHRINE_COSTS_R21_25;
        } else { // 26-30
            return SHRINE_COSTS_R26_30;
        }
    }

    showShrineChoicesUI() {
        this.ui.clearMainArea();
        const existingShrineArea = document.getElementById('shrine-area');
        if (existingShrineArea) existingShrineArea.remove();
        
        const shrineArea = document.createElement('div');
        shrineArea.id = 'shrine-area'; 
        shrineArea.classList.add('shrine-container');

        // Calculate and store costs for this encounter
        const costs = this.getShrineCosts(this.game.currentRound);
        this.currentHpCost = costs.hp;
        this.currentMaxHpCost = costs.maxHp;
        this.currentGoldCost = costs.gold;

        const canAffordSpeed = this.game.player.gold >= this.currentGoldCost;

        shrineArea.innerHTML = `
            <div class="shrine-icon">🗿</div> 
            <h3>Ancient Shrine</h3>
            <p class="shrine-prompt">The stone hums. Choose your offering.</p>
            <div class="shrine-choices"> 
                <div class="shrine-card">
                    <div class="shrine-card-content"> 
                        <h4>Offer Vitality</h4>
                        <p class="shrine-card-desc">Gain raw power.</p>
                        <div class="shrine-card-effect">
                             <div class="shrine-stats-grid"> 
                                <span class="shrine-stat shrine-cost">${this.currentHpCost} HP</span>
                                <span class="shrine-stat"><strong>+${SHRINE_ATTACK_INCREASE} Atk</strong></span>
                            </div>
                        </div>
                    </div> 
                    <button id="shrine-attack-button">Sacrifice</button> 
                </div>
                <div class="shrine-card">
                    <div class="shrine-card-content"> 
                        <h4>Offer Essence</h4>
                        <p class="shrine-card-desc">Harden your form.</p>
                        <div class="shrine-card-effect">
                            <div class="shrine-stats-grid"> 
                                <span class="shrine-stat shrine-cost">${this.currentMaxHpCost} Max HP</span>
                                <span class="shrine-stat"><strong>+${SHRINE_DEFENSE_INCREASE} Def </strong></span>
                            </div>
                        </div>
                    </div> 
                    <button id="shrine-defense-button">Sacrifice</button> 
                </div>
                <div class="shrine-card ${!canAffordSpeed ? 'choice-card-disabled' : ''}">
                    <div class="shrine-card-content"> 
                        <h4>Offer Wealth</h4>
                        <p class="shrine-card-desc">Quicken your reflexes.</p>
                        <div class="shrine-card-effect">
                            <div class="shrine-stats-grid"> 
                                <span class="shrine-stat shrine-cost">-${this.currentGoldCost} Gold</span>
                                <span class="shrine-stat"><strong>-${SHRINE_SPEED_REDUCTION.toFixed(1)}s</strong></span>
                            </div>
                        </div>
                    </div> 
                    <button id="shrine-speed-button" ${!canAffordSpeed ? 'disabled' : ''}>Sacrifice</button> 
                </div>
            </div>
        `;

        document.getElementById('main-content').appendChild(shrineArea);

        // Attach listeners
        document.getElementById('shrine-attack-button').onclick = () => this.handleShrineAttack();
        document.getElementById('shrine-defense-button').onclick = () => this.handleShrineDefense();
        const speedButton = document.getElementById('shrine-speed-button');
        if (!speedButton.disabled) {
            speedButton.onclick = () => this.handleShrineSpeed();
        }
    }

    handleShrineAttack() {
        const healthCost = this.currentHpCost; // Use stored cost
        const splat1Text = `-${healthCost} HP`; // Use stored cost for splat text
        const splat1Type = 'damage';
        
        this.game.player.takeRawDamage(healthCost);
        this.game.addLog(`You offer your vitality. The shrine drains ${healthCost} HP.`);
        this.ui.updatePlayerStats();

        const splat2Text = `${SHRINE_ATTACK_INCREASE} Atk`;
        const splat2Type = 'buff-attack';
        this.game.player.baseAttack += SHRINE_ATTACK_INCREASE;
        this.game.player.shrineAttackIncrease += SHRINE_ATTACK_INCREASE;
        this.game.addLog(`Raw power surges through you. Attack +${SHRINE_ATTACK_INCREASE}.`);
        this.ui.updatePlayerStats();
        this.showCompletionMessage("Power courses through you.", splat1Text, splat1Type, splat2Text, splat2Type);
    }

    handleShrineDefense() {
        const maxHealthCost = this.currentMaxHpCost; // Use stored cost
        const splat1Text = `-${maxHealthCost} Max HP`;
        const splat1Type = 'damage'; 
        
        // Adjust current health *before* changing max health base value
        if (this.game.player.health > (this.game.player.getMaxHealth() - maxHealthCost)) {
             this.game.player.health = this.game.player.getMaxHealth() - maxHealthCost;
        }
        this.game.player.maxHealth -= maxHealthCost;
        this.game.player.shrineDefenseIncrease += SHRINE_DEFENSE_INCREASE;
        this.game.addLog(`You offer your essence. Max HP permanently reduced by ${maxHealthCost}.`);
        this.ui.updatePlayerStats(); // Update stats after HP changes

        const splat2Text = `${SHRINE_DEFENSE_INCREASE} Def`;
        const splat2Type = 'buff-defense';
        this.game.player.baseDefense += SHRINE_DEFENSE_INCREASE;
        this.game.player.shrineDefenseIncrease += SHRINE_DEFENSE_INCREASE;
        this.game.addLog(`Your form hardens. Defense +${SHRINE_DEFENSE_INCREASE}.`);
        this.ui.updatePlayerStats(); // Update again after defense change
        this.showCompletionMessage("Your form feels tougher.", splat1Text, splat1Type, splat2Text, splat2Type);
    }

    handleShrineSpeed() {
        const goldCost = this.currentGoldCost; // Use stored cost
        const splat1Text = `-${goldCost} G`; 
        const splat1Type = 'damage';

        // Re-check affordability just in case
        if (!this.game.player.spendGold(goldCost)) {
            this.game.addLog("You lack the gold required for this sacrifice.");
            return; 
        }
        
        this.game.addLog(`You offer ${goldCost} gold to the shrine.`);
        this.ui.updatePlayerStats();

        const speedChange = SHRINE_SPEED_REDUCTION;
        const splat2Text = speedChange;
        const splat2Type = 'buff-speed';
        this.game.player.shrineSpeedReduction += speedChange;
        // Get the *actual* new speed after applying all modifiers for the log message
        const newSpeed = this.game.player.getAttackSpeed();
        this.game.addLog(`Your movements quicken. Attack Speed reduced by ${speedChange.toFixed(1)}s (Now ${newSpeed.toFixed(1)}s).`);
        this.ui.updatePlayerStats();
        this.showCompletionMessage("You feel lighter, faster.", splat1Text, splat1Type, splat2Text, splat2Type);
    }

    showCompletionMessage(message, splat1Text = null, splat1Type = null, splat2Text = null, splat2Type = null) {
        const shrineArea = document.getElementById('shrine-area');
        if (shrineArea) {
            shrineArea.innerHTML = `
                <div class="shrine-icon">🗿</div>
                <p class="shrine-message">${message}</p>
            `;
            this.addContinueButton(); 

            setTimeout(() => {
                const targetSelector = '#shrine-area .shrine-icon';
                if (splat1Text !== null && splat1Type !== null) {
                    this.ui.createDamageSplat(targetSelector, splat1Text, splat1Type);
                }
                if (splat2Text !== null && splat2Type !== null) {
                    setTimeout(() => {
                         if (this.game.player.health <= 0) {
                            this.game.addLog("Your sacrifice was too great...");
                            this.game.endGame(false); 
                            return;
                        }
                        this.ui.createDamageSplat(targetSelector, splat2Text, splat2Type);

                        let button = document.getElementById('shrine-continue-button');
                        button.disabled = false;

                    }, splat1Text !== null ? 500 : 50); 
                }
            }, 50); 

        } else {
            console.error("Shrine area not found to update UI!");
            this.endShrineEvent();
        }
    }

    addContinueButton(forceShow = false) {
        // Check if the area still exists before trying to add
        const shrineContainer = document.querySelector('#shrine-area'); 
        if (shrineContainer) {
             // If message element doesn't exist, create a simple container
             let messageContainer = shrineContainer.querySelector('.shrine-message');
             if (!messageContainer) {
                 messageContainer = document.createElement('div');
                 shrineContainer.appendChild(messageContainer); 
             }
             
            const continueButton = document.createElement('button');
            continueButton.id = 'shrine-continue-button';
            continueButton.textContent = 'Continue';
            continueButton.disabled = true;
            continueButton.onclick = () => this.endShrineEvent();
            // Append to shrineArea itself or a specific inner container
            shrineContainer.appendChild(continueButton);
        } else if (forceShow) {
             console.warn("Shrine container not found, but forcing continue button attempt.");
             // As a last resort, try adding to main content if area is gone
             const mainContent = document.getElementById('main-content');
             if(mainContent) {
                const continueButton = document.createElement('button');
                continueButton.id = 'shrine-continue-button';
                continueButton.textContent = 'Continue';
                continueButton.onclick = () => this.endShrineEvent();
                mainContent.appendChild(continueButton);
             } else {
                 console.error("Cannot add continue button: Shrine container and main-content not found.");
                 this.endShrineEvent(); // Proceed even if button fails
             }
        } else {
             console.error("Cannot add continue button: Shrine container not found.");
             this.endShrineEvent(); // Proceed even if button fails
        }
    }

    endShrineEvent() {
        const shrineArea = document.getElementById('shrine-area');
        if (shrineArea) {
            shrineArea.remove(); // Explicitly remove the element
        }
        this.ui.clearMainArea(); // Still call this to hide other potential areas
        this.game.proceedToNextRound();
    }
} 