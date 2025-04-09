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
            itemPool: COMMON_ITEMS
        },
        risky: {
            name: 'Risky Trap',
            description: 'A dangerous trap with high damage but good disarm chance.',
            disarmChance: 0.4,
            damageRange: [1, 4],
            itemPool: [...COMMON_ITEMS, ...UNCOMMON_ITEMS]
        },
        challenging: {
            name: 'Challenging Trap',
            description: 'A complex trap difficult to disarm.',
            disarmChance: 0.2,
            damageRange: [2, 5],
            itemPool: UNCOMMON_ITEMS
        },
        deadly: {
            name: 'Deadly Trap',
            description: 'A highly dangerous trap with high risk and high reward.',
            disarmChance: 0.1,
            damageRange: [3, 7],
            itemPool: RARE_ITEMS
        }
    };

    handle() {
        this.game.state = 'trap';
        this.game.addLog('You carefully approach a suspicious area...');
        this.showTrapAreaSelection();
    }

    showTrapAreaSelection() {
        this.ui.clearMainArea();

        // --- Explicitly remove previous trap area if it exists ---
        const existingTrapArea = document.getElementById('trap-area');
        if (existingTrapArea) {
            existingTrapArea.remove();
        }
        // -------------------------------------------------------

        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');

        const trapArea = document.createElement('div'); // Create a new element
        trapArea.id = 'trap-area'; // Assign the ID
        // trapArea.classList.remove('hidden'); // No need if creating anew

        // Set innerHTML for the new element
        trapArea.innerHTML = `
            <div class="trap-areas-container">
                ${Object.entries(this.TRAP_REWARDS).map(([key, area]) => {
            const baseChance = Math.round(area.disarmChance * 100);
            const adjustedChance = hasTools ? Math.min(100, Math.round((area.disarmChance + 0.2) * 100)) : baseChance;
            const toolBonus = hasTools ? `<span class="tool-bonus"> (+20%)</span>` : '';
            const requiresTools = (key === 'challenging' || key === 'deadly');
            const canAttempt = !requiresTools || hasTools;
            const requirementText = requiresTools && !hasTools ? `<span class="requirement-missing">Requires: Thief's Tools</span>` : '';
            const buttonDisabled = requiresTools && !hasTools ? 'disabled' : '';

            return `
                        <div class="choice-card ${!canAttempt ? 'choice-card-disabled' : ''}" data-risk="${key}">
                            <h4 class="choice-title">${area.name}</h4>
                            ${requirementText}
                            <p class="choice-description">${area.description}</p>
                            <div class="monster-stats-grid">
                                <span class="trap-stat">
                                    <span>Disarm Chance: ${adjustedChance}%${toolBonus}</span>
                                </span>
                                <span class="trap-stat">Damage: ${area.damageRange[0]}-${area.damageRange[1]}</span>
                            </div>
                            <button class="choice-start-button" ${buttonDisabled}>Attempt Disarm</button>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
        
        // Append the new element to main-content
        document.getElementById('main-content').appendChild(trapArea);

        // Attach listeners to the new buttons
        const trapButtons = trapArea.querySelectorAll('.choice-start-button');

        trapButtons.forEach((button, index) => {
            if (!button.disabled) {
                const handleTrapClick = function(event) {
                    const clickedButton = event.currentTarget;
                    const choiceCard = clickedButton.closest('.choice-card');
                    if (choiceCard) {
                        const areaKey = choiceCard.dataset.risk;
                        if (areaKey) {
                            this.startTrapDisarm(areaKey);
                        } else {
                            console.error("Could not find data-risk on parent choice card.");
                        }
                    } else {
                        console.error("Could not find parent choice card for button.");
                    }
                };

                button.addEventListener('click', handleTrapClick.bind(this));
            }
        });
    }

    startTrapDisarm(areaKey) {
        const area = this.TRAP_REWARDS[areaKey];
        // Ensure area exists before proceeding
        if (!area) {
            console.error(`[Trap Log] Invalid areaKey passed to startTrapDisarm: ${areaKey}`);
            return;
        }

        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');
        const requiresTools = (areaKey === 'challenging' || areaKey === 'deadly');

        if (requiresTools && !hasTools) {
            this.game.addLog(`You need Thief's Tools to attempt disarming the ${area.name}.`);
            console.warn(`Attempted to disarm ${areaKey} trap without tools.`);
            return;
        }

        this.game.addLog(`You attempt to disarm the ${area.name}...`);
        let successChance = area.disarmChance;
        if (hasTools) {
            successChance += 0.2;
        }
         successChance = Math.max(0, Math.min(1, successChance));

        const roll = Math.random();

        if (roll <= successChance) {
            const rewardItemId = area.itemPool[Math.floor(Math.random() * area.itemPool.length)];
            const rewardItem = this.game.createItem(rewardItemId);
            // Check if item creation was successful before accessing itemData
            if (!rewardItem) {
                 console.error(`[Trap Log] Failed to create item with ID: ${rewardItemId}`);
                 this.game.addLog("You disarmed the trap, but the reward crumbled to dust.");
                 this.game.proceedToNextRound();
                 return;
            }
            const itemData = ITEMS[rewardItemId]; // Should exist if rewardItem was created

            const successMsg = `Success! You disarmed the trap and found a ${itemData?.name || 'an item'}.`; // Safe access
            this.game.addLog(successMsg);
            this.game.enterLootState(0, [rewardItem]); // Pass rewardItem in an array
            this.game.ui.updatePlayerStats();
        } else {
            const damageTaken = this.game.getRandomInt(area.damageRange[0], area.damageRange[1]);
            this.game.player.takeRawDamage(damageTaken);
            // Target the stats grid within the specific card for the splat (slightly higher)
            const trapSelector = `.choice-card[data-risk="${areaKey}"] .monster-stats-grid`;
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