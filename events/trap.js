class Trap {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    TRAP_WEAPON_LOOT = [
        'wooden_sword',
        'rusty_sword',
        'quick_dagger'
    ];


    handle() {
        this.game.currentEncounterType = 'trap';
        this.game.addLog('You carefully approach a suspicious area...');

        const trapArea = document.getElementById('trap-area');
        trapArea.classList.remove('hidden');
        trapArea.innerHTML = `
            <h3>Suspicious Area</h3>
            <button id="disarm-trap-button">Attempt Disarm</button>
            <button id="skip-trap-button">Skip</button>
            <div id="trap-result-message" class="message"></div>
        `;

        const disarmButton = document.getElementById('disarm-trap-button');
        const skipButton = document.getElementById('skip-trap-button');

        if (disarmButton) {
            disarmButton.addEventListener('click', () => {
                let successChance = 0.30;
                const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');
                if (hasTools) {
                    successChance += 0.20;
                    this.game.addLog("Your Thief's Tools aid your attempt...");
                }

                const roll = Math.random();
                const trapResultMessage = document.getElementById('trap-result-message');
                const disarmButton = document.getElementById('disarm-trap-button');
                const skipButton = document.getElementById('skip-trap-button');

                if (roll <= successChance) {
                    if (disarmButton) disarmButton.disabled = true;
                    if (skipButton) skipButton.disabled = true;

                    const goldReward = Math.floor(Math.random() * 6) + 1;
                    const weaponRewardId = TRAP_WEAPON_LOOT[Math.floor(Math.random() * TRAP_WEAPON_LOOT.length)];
                    const weaponItem = this.game.createItem(weaponRewardId);

                    const weaponData = ITEMS[weaponRewardId];
                    const successMsg = `Success! You disarmed the trap. Found ${goldReward} gold and a ${weaponData.name}.`;
                    this.game.addLog(successMsg);

                    if (trapResultMessage) {
                        trapResultMessage.textContent = successMsg;
                        trapResultMessage.className = 'message success';
                    }

                    this.game.enterLootState(goldReward, [weaponItem]);
                    this.game.ui.updatePlayerStats();

                    if (this.game.player.health <= 0) {
                        return;
                    }
                } else {
                    const damageTaken = Math.floor(Math.random() * 3) + 1;
                    this.game.player.takeRawDamage(damageTaken);
                    this.game.ui.createDamageSplat('#trap-area', damageTaken, 'damage');
                    this.game.ui.updatePlayerStats();

                    const failMsg = `Failure! The trap triggers, dealing ${damageTaken} damage.`;
                    game.addLog(failMsg);

                    if (trapResultMessage) {
                        trapResultMessage.textContent = failMsg;
                        trapResultMessage.className = 'message failure';
                    }

                    if (this.game.player.health <= 0) {
                        this.game.endGame(false);
                        return;
                    }
                };
            })
        }
        if (skipButton) {
            skipButton.addEventListener('click', this.game.proceedToNextRound);
        }
    }
}
