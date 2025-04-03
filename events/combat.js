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
            breathAttackTimer: enemy.hasBreathAttack ? enemy.breathAttackInterval : null
        };
        this.game = game;
        this.ui = ui;
        this.intervalId = null;
        this.tickRate = 100;
        this.timeScale = this.tickRate / 1000;
        this.isPlayerTurn = false;
        this.isEnemyTurn = false;

        this.player.attackTimer = 0;
        this.enemy.attackTimer = 0;
        this.player.pendingActionDelay = 0;
        this.player.attackTimerPaused = false;

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
        
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.remove('player-escape-animation');
            void playerSide.offsetWidth;
            playerSide.style.transform = 'none';
            playerSide.style.opacity = '1';
        }
        
        this.ui.showCombatUI(this.player, this.enemy);
        this.player.attackTimer = this.player.getAttackSpeed();
        this.enemy.attackTimer = this.enemy.speed;

        // --- Disable Run Button for Bosses --- 
        const runButton = document.getElementById('combat-run-button');
        if (runButton) {
            const isBossRound = [10, 20, 30].includes(this.game.currentRound);
            let tooltipText = "";
            
            if (isBossRound) {
                runButton.disabled = true;
                // Set specific tooltip based on boss round
                if (this.game.currentRound === 30) {
                    tooltipText = "No escape!";
                } else { // Rounds 10 or 20
                    tooltipText = "To the death!";
                }
                runButton.textContent = "Run (Disabled)";
                runButton.onclick = null; // Explicitly remove click handler
            } else {
                runButton.disabled = false;
                const minDamage = Math.floor(this.enemy.attack * 1);
                const maxDamage = Math.floor(this.enemy.attack * 3);
                tooltipText = `Attempt to flee, taking ${minDamage}-${maxDamage} damage.`;
                runButton.textContent = `Run (${minDamage}-${maxDamage} damage)`;
                runButton.onclick = () => this.handleRun(); // Restore click handler
            }

            // Add/Update Tooltip Listeners
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
            runButton._tooltipEnterHandler = enterHandler; // Store for removal
            runButton._tooltipLeaveHandler = leaveHandler; // Store for removal
        }
        // --------------------------------------

        this.intervalId = setInterval(() => this.tick(), this.tickRate);
    }

    tick() {
        let playerActed = false;
        let enemyActed = false;

        if (!this.player.attackTimerPaused) {
            this.player.attackTimer = Math.max(0, this.player.attackTimer - this.timeScale);
        }
        if (this.player.pendingActionDelay > 0) {
            this.player.pendingActionDelay = Math.max(0, this.player.pendingActionDelay - this.timeScale);
            if (this.player.pendingActionDelay === 0) {
                this.player.attackTimerPaused = false;
            }
        }
        this.enemy.attackTimer = Math.max(0, this.enemy.attackTimer - this.timeScale);
        if (this.enemy.breathAttackTimer !== null) {
            this.enemy.breathAttackTimer = Math.max(0, this.enemy.breathAttackTimer - this.timeScale);
        }

        // --- Check for enemy dynamic changes BEFORE updating UI ---
        const healthPercent = this.enemy.health / this.enemy.maxHealth;

        // Dynamic Speed Check (Venfing)
        if (this.enemy.name === MONSTERS['venfing']?.name) {
            const wasFast = this.enemy.currentSpeed === 0.6; // Check previous state
            let isNowFast = false;
            
            if (healthPercent < 0.5) {
                this.enemy.currentSpeed = 0.6;
                isNowFast = true;
            } else {
                this.enemy.currentSpeed = 1.2;
                isNowFast = false;
            }

            // Trigger speed animation ONLY when first becoming fast
            if (isNowFast && !wasFast) {
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-speed-enraged-pulse');
                    // Remove the class after the animation duration (0.6s)
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-speed-enraged-pulse');
                    }, 600); // Match animation duration
                }
                this.game.addLog("Ven'fing becomes faster!");
            }
        }
        
        // Harden Scales Check (Dragon)
        if (this.enemy.hardenThreshold && this.enemy.hardenDefenseBonus) {
            let shouldHarden = healthPercent < this.enemy.hardenThreshold;
            
            if (shouldHarden && !this.enemy.scalesHardened) {
                // Harden the scales
                this.enemy.currentDefense = this.enemy.defense + this.enemy.hardenDefenseBonus;
                this.enemy.scalesHardened = true;
                this.game.addLog(`<span style="color: #a0a0ff;">The ${this.enemy.name}'s scales harden! (+${this.enemy.hardenDefenseBonus} Defense)</span>`);
                
                // Trigger animation
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-scales-harden');
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-scales-harden');
                    }, 800); // Animation duration (adjust CSS too)
                }
            } else if (!shouldHarden && this.enemy.scalesHardened) {
                // Scales soften (if health goes back up - less likely but good to handle)
                this.enemy.currentDefense = this.enemy.defense;
                this.enemy.scalesHardened = false;
                // Optional: Log softening?
                // this.game.addLog(`The ${this.enemy.name}'s scales seem less rigid.`);
            }
        }

        // Enrage Attack Check (Before Enemy Attack)
        if (this.enemy.enrageThreshold && this.enemy.enrageAttackMultiplier) {
            const wasEnraged = this.enemy.currentAttack > this.enemy.attack; // Check previous state
            let isNowEnraged = false;

            if (healthPercent < this.enemy.enrageThreshold) {
                this.enemy.currentAttack = Math.round(this.enemy.attack * this.enemy.enrageAttackMultiplier);
                isNowEnraged = true;
            } else {
                this.enemy.currentAttack = this.enemy.attack; 
                isNowEnraged = false;
            }

            // Trigger animation ONLY when first becoming enraged
            if (isNowEnraged && !wasEnraged) {
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-enraged-pulse');
                    // Remove the class after the animation duration (0.5s)
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-enraged-pulse');
                    }, 500);
                }
            }
        }
        
        // --- Update UI Timers AND Stats --- 
        this.ui.updateCombatTimers(
            this.player.attackTimer,
            this.enemy.attackTimer,
            this.player.pendingActionDelay,
            this.enemy.breathAttackTimer,
            this.enemy.breathAttackInterval
        );
        this.ui.updateCombatStats(this.player, this.enemy); // Update stats every tick
        // ---------------------------------

        if (!this.player.attackTimerPaused && this.player.attackTimer <= 0) {
            this.playerAttack();
            playerActed = true;
            this.player.attackTimer = this.player.getAttackSpeed();
            if (this.checkCombatEnd()) return;
        }

        if (this.enemy.breathAttackTimer !== null && this.enemy.breathAttackTimer <= 0) {
            this.enemyBreathAttack();
            if (this.checkCombatEnd()) return;
            this.enemy.breathAttackTimer = this.enemy.breathAttackInterval;
        }

        if (this.enemy.attackTimer <= 0) {
            this.enemyAttack();
            enemyActed = true;
            this.enemy.attackTimer = this.enemy.currentSpeed;
            if (this.checkCombatEnd()) return;
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
    }

    enemyBreathAttack() {
        const damage = this.game.getRandomInt(this.enemy.breathAttackDamage[0], this.enemy.breathAttackDamage[1]);
        this.player.takeRawDamage(damage);
        
        const logMessage = `<span style="color: #ff8c00;">The ${this.enemy.name} breathes fire, engulfing you for ${damage} damage!</span>`;
        this.game.addLog(logMessage);
        
        this.ui.updateCombatantHealth(
            'player', 
            this.player.health, 
            this.player.getMaxHealth(), 
            damage, 
            0,
            false, 
            false 
        );
        this.ui.updatePlayerStats();
        
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.add('player-breath-hit');
            setTimeout(() => {
                playerSide.classList.remove('player-breath-hit');
            }, 1000);
        }
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
                    this.player.pendingActionDelay
                );
            }
            if (useResult.item?.healAmount) {
                this.ui.updateCombatantHealth('player', this.player.health, this.player.maxHealth, useResult.healedAmount, 0, true);
                this.ui.updatePlayerStats();
            }
            this.ui.renderInventory();
            this.ui.updateCombatStats(this.player, this.enemy); // Update stats after item use
        } else {
            this.game.addLog(useResult.message);
        }
    }

    checkCombatEnd() {
        let combatEnded = false;
        let playerWon = false;

        if (this.enemy.health <= 0) {
            combatEnded = true;
            playerWon = true;
        } else if (this.player.health <= 0) {
            this.game.addLog(`You were defeated by the ${this.enemy.name}...`);
            clearInterval(this.intervalId); // Stop combat immediately
            this.intervalId = null;
            // Delay the game over screen
            setTimeout(() => {
                this.game.endGame(false); 
            }, 1000); // 1000ms = 1 second delay
            combatEnded = true;
            playerWon = false;
        }

        // Only call endCombat if the player WON, otherwise game over is handled by timeout
        if (combatEnded && playerWon) {
            this.endCombat(true);
        }
        return combatEnded;
    }

    handleRun() {
        clearInterval(this.intervalId);
        this.intervalId = null;

        const multiplier = 1 + Math.random() * 2;
        const runDamage = Math.floor(this.enemy.attack * multiplier);
        const damageResult = this.player.takeDamage(runDamage);
        
        // Update player stats display immediately, but don't create splat on player side
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
                <p>But took <span style="color: #ff4444">${damageResult.actualDamage} damage</span> in the process!</p>
                ${this.player.health <= 0 ? 
                    `<p style="color: #ff4444">Unfortunately, you didn't survive the escape attempt...</p>` : 
                    ''}
                <button id="escape-continue">Continue</button>
            `;
            
            messageContainer.innerHTML = content;
            document.body.appendChild(messageContainer);
    
            // --- Create splat on the message box --- 
            this.ui.createDamageSplat('.escape-message-container', damageResult.actualDamage, 'damage');
            // -------------------------------------

            const continueButton = document.getElementById('escape-continue');
            continueButton.onclick = () => {
                messageContainer.remove();
                backdrop.remove();
                if (this.player.health <= 0) {
                    this.game.addLog(`You were defeated while trying to escape from the ${this.enemy.name}...`);
                    this.game.endGame(false);
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
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.ui.hideCombatUI();

        if (playerWon) {
            this.game.addLog(`You defeated the ${this.enemy.name}!`);

            const goldDropped = this.game.getRandomInt(this.enemy.goldDrop[0], this.enemy.goldDrop[1]);
            const droppedItems = [];
            if (this.enemy.lootTable && this.enemy.lootTable.length > 0) {
                this.enemy.lootTable.forEach(loot => {
                    if (Math.random() < loot.chance) {
                        const item = this.game.createItem(loot.itemId);
                        if (item) {
                            item.selected = true;
                            droppedItems.push(item);
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
}