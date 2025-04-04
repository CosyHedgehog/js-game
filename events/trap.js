class Trap {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    TRAP_REWARDS = {
        safe: {
            name: 'Safe Trap',
            description: 'A simple trap with low risk and low reward.',
            disarmChance: 0.7,
            damageRange: [1, 2],
            itemPool: ['bread', 'cooked_meat', 'wooden_shield', 'leather_helm']
        },
        risky: {
            name: 'Risky Trap',
            description: 'A dangerous trap with high damage but good disarm chance.',
            disarmChance: 0.4,
            damageRange: [1, 4],
            itemPool: ['leather_armor', 'leather_legs', 'health_potion']
        },
        challenging: {
            name: 'Challenging Trap',
            description: 'A complex trap difficult to disarm.',
            disarmChance: 0.2,
            damageRange: [2, 5],
            itemPool: ['iron_helm', 'iron_sword', 'iron_armor', 'speed_potion']
        },
        deadly: {
            name: 'Deadly Trap',
            description: 'A highly dangerous trap with high risk and high reward.',
            disarmChance: 0.1,
            damageRange: [3, 7],
            itemPool: ['steel_greatsword', 'steel_armor', 'dragon_ring']
        }
    };

    handle() {
        this.game.state = 'trap';
        this.game.addLog('You carefully approach a suspicious area...');
        this.showTrapAreaSelection();
    }

    showTrapAreaSelection() {
        this.ui.clearMainArea();

        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');

        const trapArea = document.getElementById('trap-area');
        trapArea.classList.remove('hidden');
        trapArea.innerHTML = `
            <div class="trap-areas-container">
                ${Object.entries(this.TRAP_REWARDS).map(([key, area]) => {
                    const baseChance = Math.round(area.disarmChance * 100);
                    const adjustedChance = hasTools ? Math.min(100, Math.round((area.disarmChance + 0.2) * 100)) : baseChance;
                    const toolBonus = hasTools ? ` (+20%)` : '';
                    return `
                        <div class="trap-area-option" data-risk="${key}">
                            <h4>${area.name}</h4>
                            <p>${area.description}</p>
                            <div class="trap-area-details">
                                <p>Disarm Chance: ${adjustedChance}%${toolBonus}</p>
                                <p>Damage: ${area.damageRange[0]}-${area.damageRange[1]}</p>
                            </div>
                            <button class="trap-area-button">Attempt Disarm</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        const trapButtons = trapArea.querySelectorAll('.trap-area-button');
        trapButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const areaKey = Object.keys(this.TRAP_REWARDS)[index];
                this.startTrapDisarm(areaKey);
            });
        });
    }

    startTrapDisarm(areaKey) {
        const area = this.TRAP_REWARDS[areaKey];
        this.game.addLog(`You attempt to disarm the ${area.name}...`);
        
        let successChance = area.disarmChance;
        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');
        if (hasTools) {
            successChance += 0.2;
            this.game.addLog("Your Thief's Tools aid your attempt...");
        }

        const roll = Math.random();

        if (roll <= successChance) {
            const rewardItemId = area.itemPool[Math.floor(Math.random() * area.itemPool.length)];
            const rewardItem = this.game.createItem(rewardItemId);
            const itemData = ITEMS[rewardItemId];
            
            const successMsg = `Success! You disarmed the trap and found a ${itemData.name}.`;
            this.game.addLog(successMsg);
            this.game.enterLootState(0, [rewardItem]);
            this.game.ui.updatePlayerStats();
        } else {
            const damageTaken = this.game.getRandomInt(area.damageRange[0], area.damageRange[1]);
            this.game.player.takeRawDamage(damageTaken);
            const trapSelector = `.trap-area-option[data-risk="${areaKey}"]`;
            this.game.ui.createDamageSplat(trapSelector, damageTaken, 'damage');
            this.game.ui.updatePlayerStats();

            const failMsg = `Failure! The trap triggers, dealing ${damageTaken} damage.`;
            this.game.addLog(failMsg);

            if (this.game.player.health <= 0) {
                this.game.endGame(false);
                return;
            }
        }
    }
}
