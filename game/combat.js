class Combat {
    constructor(player, enemy, game, ui) {
        this.player = player;
        this.enemy = {
            ...enemy,
            health: enemy.health,
            maxHealth: enemy.health,
            attackTimer: 0,
            currentSpeed: enemy.speed,
            currentAttack: enemy.attack,
            currentDefense: enemy.defense,
            scalesHardened: false,
            breathAttackTimer: enemy.hasBreathAttack ? enemy.breathAttackInterval : null,
            timedStunTimer: enemy.hasTimedStun ? enemy.timedStunInterval : null,
            ferocityActive: false,
            ferocityTimer: 0,
            regenerationActive: enemy.name === 'Moss Giant',
            regenerationTimer: enemy.name === 'Moss Giant' ? 5 : 0,
            regenerationAmount: enemy.name === 'Moss Giant' ? 1 : 0,
            regenerationInterval: enemy.name === 'Moss Giant' ? 5 : null
        };
        this.game = game;
        this.ui = ui;
        this.intervalId = null;
        this.tickRate = 100;
        this.timeScale = this.tickRate / 1000;
        this.isPlayerTurn = false;
        this.isEnemyTurn = false;
        this.lastTickTime = Date.now();

        this.player.attackTimer = 0;
        this.enemy.attackTimer = 0;
        this.player.pendingActionDelay = 0;
        this.player.attackTimerPaused = false;

        this.player.activeEffects = {};

        const runButton = document.getElementById('combat-run-button');
        if (runButton) {
            const minDamage = Math.floor(this.enemy.attack * 1);
            const maxDamage = Math.floor(this.enemy.attack * 3);
            runButton.textContent = `Run (${minDamage}-${maxDamage} damage)`;
            runButton.onclick = () => this.handleRun();
        }
    }

    start() {
        this.game.addLog(`Combat started: Player vs ${this.enemy.name}!`);

        this.player.attackTimer = 0;
        this.enemy.attackTimer = 0;
        this.player.pendingActionDelay = 0;
        this.player.attackTimerPaused = false;

        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.remove('player-escape-animation');
            void playerSide.offsetWidth;
            playerSide.style.transform = 'none';
            playerSide.style.opacity = '1';
        }

        this.ui.renderCombat(this.player, this.enemy);
        this.player.attackTimer = this.player.getAttackSpeed();
        this.enemy.attackTimer = this.enemy.speed;

        const runButton = document.getElementById('combat-run-button');
        if (runButton) {
            const isBossRound = [10, 20, 30].includes(this.game.currentRound);
            let tooltipText = "";

            if (isBossRound) {
                runButton.disabled = true;
                if (this.game.currentRound === 30) {
                    tooltipText = "No escape!";
                } else {
                    tooltipText = "To the death!";
                }
                runButton.textContent = "Run (Disabled)";
                runButton.onclick = null;
            } else {
                runButton.disabled = false;
                const minDamage = Math.floor(this.enemy.attack * 1);
                const maxDamage = Math.floor(this.enemy.attack * 3);
                tooltipText = `Attempt to flee, taking ${minDamage}-${maxDamage} damage.`;
                runButton.textContent = `Run (${minDamage}-${maxDamage} damage)`;
                runButton.onclick = () => this.handleRun();
            }

            runButton.removeEventListener('mouseenter', runButton._tooltipEnterHandler);
            runButton.removeEventListener('mouseleave', runButton._tooltipLeaveHandler);

            const enterHandler = (e) => {
                this.ui.showTooltip(tooltipText.replace(/\n/g, '<br>'), this.ui.statTooltip, e);
            };
            const leaveHandler = () => {
                this.ui.hideTooltip(this.ui.statTooltip);
            };

            runButton.addEventListener('mouseenter', enterHandler);
            runButton.addEventListener('mouseleave', leaveHandler);
            runButton._tooltipEnterHandler = enterHandler; runButton._tooltipLeaveHandler = leaveHandler;
        }

        this.intervalId = setInterval(() => this.tick(), this.tickRate);

        this.lastTickTime = Date.now();

        if (this.game.ui.roundAreaElement) {
            this.game.ui.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
        }
        this.game.addLog(`You encounter a ${this.enemy.name}!`);
    }

    tick() {
        const now = Date.now();
        const delta = now - this.lastTickTime;
        this.lastTickTime = now;
        const tickSeconds = delta / 1000;
        let playerActed = false;
        let enemyActed = false;
        let poisonDamageThisTick = 0;

        if (!this.player.attackTimerPaused) {
            this.player.attackTimer = Math.max(0, this.player.attackTimer - this.timeScale);
        }
        if (this.player.pendingActionDelay > 0) {
            this.player.pendingActionDelay = Math.max(0, this.player.pendingActionDelay - this.timeScale);
            if (this.player.pendingActionDelay === 0) {
                this.player.attackTimerPaused = false;
                this.player.isStunned = false;
                this.ui.renderInventory();
            }
        }
        this.enemy.attackTimer = Math.max(0, this.enemy.attackTimer - this.timeScale);
        if (this.enemy.breathAttackTimer !== null) {
            this.enemy.breathAttackTimer = Math.max(0, this.enemy.breathAttackTimer - this.timeScale);
        }
        if (this.enemy.timedStunTimer !== null) {
            this.enemy.timedStunTimer = Math.max(0, this.enemy.timedStunTimer - this.timeScale);
        }

        if (this.enemy.ferocityActive) {
            this.enemy.ferocityTimer = Math.max(0, this.enemy.ferocityTimer - this.timeScale);
            if (this.enemy.ferocityTimer <= 0) {
                this.enemy.ferocityActive = false;
                this.enemy.currentDefense -= this.enemy.ferocityDefBonus; this.game.addLog(`${this.enemy.name}'s ferocity fades.`);
            }
        }

        if (this.player.activeEffects.poison) {
            const poison = this.player.activeEffects.poison;
            poison.timer = Math.max(0, poison.timer - tickSeconds); poison.tickCooldown = Math.max(0, poison.tickCooldown - tickSeconds);
            if (poison.tickCooldown <= 0 && poison.timer > 0) {
                const damageDealt = this.game.getRandomInt(poison.damageRange[0], poison.damageRange[1]);
                poisonDamageThisTick = damageDealt; this.player.takeRawDamage(damageDealt);
                this.game.addLog(`<span style="color: #ab47bc;">You take ${damageDealt} poison damage.</span>`);
                this.ui.createDamageSplat('.player-side', damageDealt, 'poison');
                poison.tickCooldown = 1.5;
            }

            if (poison.timer <= 0) {
                this.game.addLog("The poison wears off.");
                delete this.player.activeEffects.poison;
            }
        }

        if (this.player.activeEffects.burning) {
            const burn = this.player.activeEffects.burning;
            burn.timeRemaining = Math.max(0, burn.timeRemaining - tickSeconds);
            burn.timeUntilNextTick = Math.max(0, burn.timeUntilNextTick - tickSeconds);

            if (burn.timeUntilNextTick <= 0) {
                const burnDmg = burn.damage;
                this.player.takeRawDamage(burnDmg);
                this.game.addLog(`<span style="color: #ff8c00;">You take ${burnDmg} burn damage!</span>`);
                this.ui.createDamageSplat('.player-side', burnDmg, 'burn');
                burn.timeUntilNextTick = burn.tickInterval;
            }

            if (burn.timeRemaining <= 0) {
                this.game.addLog("The fire subsides.");
                delete this.player.activeEffects.burning;
            }
        }

        if (this.enemy.regenerationActive) {
            this.enemy.regenerationTimer = Math.max(0, this.enemy.regenerationTimer - this.timeScale);
            if (this.enemy.regenerationTimer <= 0) {
                const potentialHeal = this.enemy.regenerationAmount;
                const actualHeal = (this.enemy.health < this.enemy.maxHealth) ? potentialHeal : 0;

                if (actualHeal > 0) {
                    this.enemy.health = Math.min(this.enemy.maxHealth, this.enemy.health + actualHeal);
                    this.game.addLog(`<span style="color: #66bb6a;">${this.enemy.name} regenerates ${actualHeal} health.</span>`);
                } else {
                    this.game.addLog(`<span style="color: #a0a0a0;">${this.enemy.name} tries to regenerate, but is already at full health.</span>`);
                }

                this.ui.updateCombatantHealth('enemy', this.enemy.health, this.enemy.maxHealth, actualHeal, 0, true);

                this.enemy.regenerationTimer = 5;
            }
        }

        const healthPercent = this.enemy.health / this.enemy.maxHealth;

        if (this.enemy.speedIncreaseThreshold && this.enemy.speedIncreasePercent) {
            const baseSpeed = this.enemy.speed; // Original speed from definition
            const fasterSpeed = baseSpeed * (1 - this.enemy.speedIncreasePercent); 
            const wasSpeedIncreased = this.enemy.currentSpeed === fasterSpeed;
            const shouldIncreaseSpeed = healthPercent < this.enemy.speedIncreaseThreshold;
            if (shouldIncreaseSpeed && !wasSpeedIncreased) {
                this.enemy.currentSpeed = fasterSpeed;
                this.game.addLog(`<span style="color: #64b5f6;">${this.enemy.name} quickens its movements!</span>`);
                
                const enemySide = document.querySelector('.enemy-side');
                const enemySpdStat = document.getElementById('combat-enemy-spd');

                if (enemySide) {
                    enemySide.classList.add('enemy-speed-enraged-pulse'); 
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-speed-enraged-pulse');
                    }, 600);
                    enemySide.classList.add('enemy-speed-boost-active'); 
                }
                if (enemySpdStat) {
                    enemySpdStat.classList.add('stat-highlight-speed');
                }
            } else if (!shouldIncreaseSpeed && !wasSpeedIncreased) {
                this.enemy.currentSpeed = baseSpeed;
                const enemySide = document.querySelector('.enemy-side');
                const enemySpdStat = document.getElementById('combat-enemy-spd');
                if (enemySide) {
                    enemySide.classList.remove('enemy-speed-boost-active');
                }
                if (enemySpdStat) {
                    enemySpdStat.classList.remove('stat-highlight-speed');
                }
            }
        }

        if (this.enemy.enrageThreshold && this.enemy.enrageAttackMultiplier) {
            const wasEnraged = this.enemy.currentAttack > this.enemy.attack; let isNowEnraged = false;

            if (healthPercent < this.enemy.enrageThreshold) {
                this.enemy.currentAttack = Math.round(this.enemy.attack * this.enemy.enrageAttackMultiplier);
                isNowEnraged = true;
            } else {
                this.enemy.currentAttack = this.enemy.attack;
                isNowEnraged = false;
            }

            if (isNowEnraged && !wasEnraged) {
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-enraged-pulse');
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-enraged-pulse');
                    }, 500);
                }
            }
        }

        this.ui.updateCombatTimers(
            this.player.attackTimer,
            this.enemy.attackTimer,
            this.player.pendingActionDelay,
            this.enemy.breathAttackTimer,
            this.enemy.breathAttackInterval,
            this.enemy.timedStunTimer,
            this.enemy.timedStunInterval,
            this.enemy.regenerationTimer,
            this.enemy.regenerationInterval
        );
        this.ui.updateCombatStats(this.player, this.enemy);
        if (!this.player.attackTimerPaused && this.player.attackTimer <= 0) {
            this.playerAttack();
            playerActed = true;
            this.player.attackTimer = this.player.getAttackSpeed();
            // if (this.checkCombatEnd()) return;
        }

        if (this.enemy.breathAttackTimer !== null && this.enemy.breathAttackTimer <= 0) {
            this.enemyBreathAttack();
            this.enemy.breathAttackTimer = this.enemy.breathAttackInterval;
        }

        if (this.enemy.timedStunTimer !== null && this.enemy.timedStunTimer <= 0) {
            this.enemyTimedStunAttack();
            this.enemy.timedStunTimer = this.enemy.timedStunInterval;
        }

        if (this.enemy.attackTimer <= 0) {
            this.enemyAttack();
            enemyActed = true;
            this.enemy.attackTimer = this.enemy.currentSpeed;
            // if (this.checkCombatEnd()) return;
        }
    }

    playerAttack() {
        const playerAttackRoll = this.game.rollDamage(this.player.getAttack());
        const enemyDefenseRoll = this.game.rollDamage(this.enemy.currentDefense || 0);
        const actualBlocked = Math.min(playerAttackRoll, enemyDefenseRoll);
        const damageDealt = Math.max(0, playerAttackRoll - enemyDefenseRoll);

        this.enemy.health = Math.max(0, this.enemy.health - damageDealt);

        if (damageDealt === 0 && actualBlocked > 0) {
            this.game.addLog(`You attack ${this.enemy.name} but they block all ${actualBlocked} damage!`);
        } else {
            this.game.addLog(`You attack ${this.enemy.name} for ${damageDealt} damage. (${playerAttackRoll} - ${actualBlocked} blocked)`);
        }

        this.ui.updateCombatantHealth(
            'enemy',
            this.enemy.health,
            this.enemy.maxHealth,
            damageDealt,
            actualBlocked,
            false,
            damageDealt === 0 && actualBlocked > 0
        );
        this.ui.updatePlayerStats();

        if (this.enemy.hasFerocity && damageDealt > 0 && !this.enemy.ferocityActive) {
            this.enemy.ferocityActive = true;
            this.enemy.ferocityTimer = this.enemy.ferocityDuration;
            this.enemy.currentDefense += this.enemy.ferocityDefBonus; this.game.addLog(`<span style="color: #ffc107;">${this.enemy.name} becomes ferocious! (+${this.enemy.ferocityDefBonus} Defense)</span>`);

            const enemySide = document.querySelector('.enemy-side');
            if (enemySide) {
                enemySide.classList.add('enemy-pack-tactics'); setTimeout(() => {
                    enemySide.classList.remove('enemy-pack-tactics');
                }, 800);
            }
        }
        this.checkCombatEnd();
    }

    enemyAttack() {
        const enemyAttackRoll = this.game.rollDamage(this.enemy.currentAttack);
        const playerDefenseRoll = this.game.rollDamage(this.player.getDefense());
        const actualBlocked = Math.min(enemyAttackRoll, playerDefenseRoll);
        const damageDealt = Math.max(0, enemyAttackRoll - playerDefenseRoll);

        this.player.health = Math.max(0, this.player.health - damageDealt);

        let logMessage = `${this.enemy.name} attacks`;
        if (this.enemy.currentAttack > this.enemy.attack) {
            logMessage += ` <span style="color: #ff6b6b;">[ENRAGED]</span>`;
        }

        if (damageDealt === 0 && actualBlocked > 0) {
            logMessage += ` but you block all ${actualBlocked} damage!`;
        } else {
            logMessage += ` you for ${damageDealt} damage. (${enemyAttackRoll} - ${actualBlocked} blocked)`;
        }
        this.game.addLog(logMessage);

        if (this.enemy.appliesPoison && damageDealt > 0) {
            const poisonProcChance = this.enemy.poisonChance || 1; if (Math.random() < poisonProcChance) {
                if (!this.player.activeEffects.poison) {
                    this.player.activeEffects.poison = {
                        damageRange: this.enemy.poisonDamage,
                        duration: this.enemy.poisonDuration,
                        timer: this.enemy.poisonDuration,
                        tickCooldown: 1.5
                    };
                    this.game.addLog(`<span style="color: #ab47bc;">You have been poisoned!</span>`);
                }
            }
        }

        this.ui.updateCombatantHealth(
            'player',
            this.player.health,
            this.player.getMaxHealth(),
            damageDealt,
            actualBlocked,
            false,
            damageDealt === 0 && actualBlocked > 0
        );
        this.ui.updatePlayerStats();

        this.checkCombatEnd();
    }

    enemyBreathAttack() {
        const damage = this.game.getRandomInt(this.enemy.breathAttackDamage[0], this.enemy.breathAttackDamage[1]);
        this.player.takeRawDamage(damage);

        const logMessage = `<span style="color: #ff8c00;">The ${this.enemy.name} breathes fire, engulfing you for ${damage} damage!</span>`;
        this.game.addLog(logMessage);

        this.ui.createDamageSplat('.player-side', damage, 'burn');
        this.ui.playPlayerAnimation('player-breath-hit', 1000);

        if (this.enemy.breathDotDamage && this.enemy.breathDotDuration && this.enemy.breathDotTickInterval) {
            if (!this.player.activeEffects.burning) {
                this.player.activeEffects.burning = {
                    damage: this.enemy.breathDotDamage,
                    duration: this.enemy.breathDotDuration,
                    tickInterval: this.enemy.breathDotTickInterval,
                    timeRemaining: this.enemy.breathDotDuration,
                    timeUntilNextTick: this.enemy.breathDotTickInterval
                };
                this.game.addLog("You are set ablaze!");
            }
        } else {
            console.warn(`[Combat] ${this.enemy.name} hasBreathAttack but no DoT properties defined.`);
        }

        this.checkCombatEnd();
    }

    handlePlayerItemUse(useResult) {
        if (useResult.success) {
            this.game.addLog(useResult.message);
            if (useResult.actionDelay > 0) {
                this.player.attackTimerPaused = true;
                this.player.pendingActionDelay = useResult.actionDelay;
                this.game.addLog(`Your next attack is delayed by ${useResult.actionDelay}s!`);
                this.ui.updateCombatTimers(
                    this.player.attackTimer,
                    this.enemy.attackTimer,
                    this.player.pendingActionDelay,
                    this.enemy.breathAttackTimer,
                    this.enemy.breathAttackInterval,
                    this.enemy.timedStunTimer,
                    this.enemy.timedStunInterval,
                    this.enemy.regenerationTimer,
                    this.enemy.regenerationInterval
                );
            }
            if (useResult.item?.healAmount) {
                this.ui.updateCombatantHealth('player', this.player.health, this.player.maxHealth, useResult.healedAmount, 0, true);
                this.ui.updatePlayerStats();
            }
            this.ui.renderInventory();
            this.ui.updateCombatStats(this.player, this.enemy);
            this.ui.updatePlayerStats();
        } else {
            this.game.addLog(useResult.message);
        }
    }

    checkCombatEnd() {
        let combatEnded = false;
        let playerWon = false;

        if (this.enemy.health <= 0) {


            if (this.ui.combatArea) {
                this.ui.combatArea.classList.add('combat-ending');
            }

            this.game.addLog(`You defeated the ${this.enemy.name}!`);
            clearInterval(this.intervalId); this.intervalId = null;

            setTimeout(() => {
                this.endCombat(true);
            }, 700);

            combatEnded = true;
            playerWon = true;
            return combatEnded;
        } else if (this.player.health <= 0) {
            this.ui.updateCombatantHealth('player', this.player.health, this.player.maxHealth, 0, 0, true);
            this.game.addLog(`You were defeated by the ${this.enemy.name}...`);
            clearInterval(this.intervalId); this.intervalId = null;

            console.error("checkCombatEnd", this.enemy.health, this.player.health);

            setTimeout(() => {
                this.endCombat(false);
            }, 700); 
            combatEnded = true;
            playerWon = false;
        }

        return combatEnded;
    }

    handleRun() {
        clearInterval(this.intervalId);
        this.intervalId = null;

        const multiplier = 1 + Math.random() * 2;
        const runDamage = Math.floor(this.enemy.attack * multiplier);
        this.player.takeRawDamage(runDamage);

        this.ui.updatePlayerStats();

        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.add('player-escape-animation');
        }

        setTimeout(() => {
            const combatArea = document.querySelector('#combat-area');
            if (combatArea) {
                combatArea.classList.add('hidden');
            }

            const backdrop = document.createElement('div');
            backdrop.className = 'escape-backdrop';
            document.body.appendChild(backdrop);

            const messageContainer = document.createElement('div');
            messageContainer.className = 'escape-message-container';

            const content = `
                <h3>${this.player.health <= 0 ? 'Failed to Escape!' : 'Escape Successful!'}</h3>
                <p>You fled from the ${this.enemy.name}...</p>
                <p>But took <span style="color: #ff4444">${runDamage} damage</span> in the process!</p>
                ${this.player.health <= 0 ?
                    `<p style="color: #ff4444">Unfortunately, you didn't survive the escape attempt...</p>` :
                    ''}
                <button id="escape-continue">${this.player.health <= 0 ? 'Play Again' : 'Continue'}</button>
            `;

            messageContainer.innerHTML = content;
            document.body.appendChild(messageContainer);

            this.ui.createDamageSplat('.escape-message-container', runDamage, 'damage');

            const continueButton = document.getElementById('escape-continue');
            continueButton.onclick = () => {
                messageContainer.remove();
                backdrop.remove();
                if (this.player.health <= 0) {
                    this.game.addLog(`You were defeated while trying to escape from the ${this.enemy.name}...`);
                    window.game = new Game();
                    window.game.start();
                } else {
                    this.game.addLog(`You successfully fled from the ${this.enemy.name}!`);
                    this.player.resetCombatBuffs();
                    this.endCombat(false, true);
                }
            };
        }, 250);
    }

    endCombat(playerWon, ranAway = false) {
        this.player.resetCombatBuffs();

        const enemySide = document.querySelector('.enemy-side');
        const enemySpdStat = document.getElementById('combat-enemy-spd');
        if (enemySide) {
            enemySide.classList.remove('enemy-speed-boost-active');
        }
        if (enemySpdStat) {
            enemySpdStat.classList.remove('stat-highlight-speed');
        }
        this.player.activeEffects = {};

        if (playerWon) {
            this.game.addLog(`You defeated the ${this.enemy.name}!`);

            const goldDropped = this.game.getRandomInt(this.enemy.goldDrop[0], this.enemy.goldDrop[1]);
            const droppedItems = [];
            if (this.enemy.lootTable && this.enemy.lootTable.length > 0) {
                this.enemy.lootTable.forEach(loot => {
                    if (loot.itemId === 'gold') return;
                    if (Math.random() < loot.chance) {
                        let chosenItemId = null;

                        if (loot.itemTier) {
                            let tierList;
                            switch (loot.itemTier) {
                                case 'commonItem': tierList = COMMON_ITEMS; break;
                                case 'uncommonItem': tierList = UNCOMMON_ITEMS; break;
                                case 'rareItem': tierList = RARE_ITEMS; break;
                                case 'commonFood': tierList = COMMON_FOOD; break;
                                case 'uncommonFood': tierList = UNCOMMON_FOOD; break;
                                case 'rareFood': tierList = RARE_FOOD; break;
                                default: tierList = []; console.warn("Unknown itemTier:", loot.itemTier);
                            }
                            const validItems = tierList.filter(id => id);
                            if (validItems.length > 0) {
                                chosenItemId = validItems[this.game.getRandomInt(0, validItems.length - 1)];
                            } else {
                                console.warn(`Item tier list '${loot.itemTier}' is empty or contains invalid entries.`);
                            }
                        } else if (loot.itemId) {
                            chosenItemId = loot.itemId;
                        }

                        if (chosenItemId) {
                            const item = this.game.createItem(chosenItemId);
                            if (item) {
                                item.selected = true;
                                droppedItems.push(item);
                            } else {
                                console.error(`Failed to create item with ID: ${chosenItemId}`);
                            }
                        }
                    }
                });
            }
            const defeatedName = this.enemy.name;
            this.game.lastDefeatedEnemyName = defeatedName;

            if (goldDropped > 0 || droppedItems.length > 0) {
                this.game.enterLootState(goldDropped, droppedItems);
            } else {
                this.game.addLog("The enemy dropped nothing.");
                this.checkBossWinAndProceed();
            }

        } else if (ranAway) {
            this.game.proceedToNextRound();
        } else {
            this.game.addLog(`You were defeated by the ${this.enemy.name}...`);
            this.game.endGame(false);
        }
    }

    checkBossWinAndProceed() {
        const defeatedName = this.game.lastDefeatedEnemyName;
        this.game.lastDefeatedEnemyName = null;

        const isBossDefeated = defeatedName && MONSTERS[FINAL_BOSS] && defeatedName === MONSTERS[FINAL_BOSS].name;

        if (isBossDefeated) {
            this.game.endGame(true);
        } else {
            this.game.proceedToNextRound();
        }
    }

    enemyTimedStunAttack() {
        if (!this.enemy.hasTimedStun) return;
        this.player.attackTimerPaused = true;
        this.player.pendingActionDelay = this.enemy.timedStunDuration;
        this.player.isStunned = true; this.player.activeEffects.stun = {
            duration: this.enemy.timedStunDuration,
        }
        this.game.addLog(`<span style="color: #ffff99;">${this.enemy.name} hurls a massive boulder, stunning you! (Attack delayed ${this.enemy.timedStunDuration}s)</span>`);

        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.add('player-stunned-visual');
            setTimeout(() => {
                playerSide.classList.remove('player-stunned-visual');
            }, 800);
        }
        this.ui.createDamageSplat('.player-side', 'Stunned!', 'stun');

        this.ui.renderInventory();
    }
}