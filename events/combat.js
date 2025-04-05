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
            timedStunTimer: enemy.hasTimedStun ? enemy.timedStunInterval : null
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
        
        this.player.activeEffects = {};

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

        // *** Stop round indicator animation ***
        if (this.game.ui.roundAreaElement) {
            this.game.ui.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
        }
        this.game.addLog(`You encounter a ${this.enemy.name}!`);
    }

    tick() {
        const now = Date.now();
        const delta = now - this.lastTickTime;
        this.lastTickTime = now;
        const tickSeconds = delta / 1000; // *** Use actual elapsed time ***

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
                this.player.isStunned = false; // Clear the stun flag when delay ends
                
                // Re-render inventory to remove stun effect from food
                this.ui.renderInventory(); 
            }
        }
        this.enemy.attackTimer = Math.max(0, this.enemy.attackTimer - this.timeScale);
        if (this.enemy.breathAttackTimer !== null) {
            this.enemy.breathAttackTimer = Math.max(0, this.enemy.breathAttackTimer - this.timeScale);
        }
        // *** Decrement Timed Stun Timer ***
        if (this.enemy.timedStunTimer !== null) {
            this.enemy.timedStunTimer = Math.max(0, this.enemy.timedStunTimer - this.timeScale);
        }

        // Handle Player Poison Effect
        if (this.player.activeEffects.poison) {
            const poison = this.player.activeEffects.poison;
            poison.timer = Math.max(0, poison.timer - tickSeconds); // Use tickSeconds
            poison.tickCooldown = Math.max(0, poison.tickCooldown - tickSeconds); // Use tickSeconds
            
            // Deal damage when tick cooldown reaches zero
            if (poison.tickCooldown <= 0 && poison.timer > 0) { 
                 // Roll damage within the stored range
                 const damageDealt = this.game.getRandomInt(poison.damageRange[0], poison.damageRange[1]);
                 poisonDamageThisTick = damageDealt; // Track for potential future use
                 this.player.takeRawDamage(damageDealt); 
                 this.game.addLog(`<span style="color: #ab47bc;">You take ${damageDealt} poison damage.</span>`);
                 this.ui.createDamageSplat('.player-side', damageDealt, 'poison'); 
                 poison.tickCooldown = 1.5; // Reset the cooldown
            }

            if (poison.timer <= 0) {
                this.game.addLog("The poison wears off.");
                delete this.player.activeEffects.poison;
            }
        }

        // *** Handle Player Burning Effect ***
        if (this.player.activeEffects.burning) {
            const burn = this.player.activeEffects.burning;
            // *** Decrement using actual elapsed time ***
            burn.timeRemaining = Math.max(0, burn.timeRemaining - tickSeconds); 
            burn.timeUntilNextTick = Math.max(0, burn.timeUntilNextTick - tickSeconds);

            // Deal damage when tick cooldown reaches zero
            if (burn.timeUntilNextTick <= 0) { 
                 const burnDmg = burn.damage; 
                 this.player.takeRawDamage(burnDmg); 
                 this.game.addLog(`<span style="color: #ff8c00;">You take ${burnDmg} burn damage!</span>`);
                 this.ui.createDamageSplat('.player-side', burnDmg, 'burn'); 
                 burn.timeUntilNextTick = burn.tickInterval; // Reset cooldown
            }

            // Expiry check (runs AFTER potential damage tick)
            if (burn.timeRemaining <= 0) {
                this.game.addLog("The fire subsides.");
                delete this.player.activeEffects.burning;
            }
        }

        // --- Check for enemy dynamic changes BEFORE updating UI ---
        const healthPercent = this.enemy.health / this.enemy.maxHealth;

        // Dynamic Speed Check (Venfing)
        if (this.enemy.name === MONSTERS['silverfang']?.name) {
            const wasFast = this.enemy.currentSpeed === 0.6; // Check previous state
            let isNowFast = false;
            
            if (healthPercent < 0.5) {
                this.enemy.currentSpeed = 0.6;
                isNowFast = true;
            } else {
                this.enemy.currentSpeed = 1.2;
                isNowFast = false;
            }

            // Get timer container element
            const enemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');

            // Trigger speed animation ONLY when first becoming fast
            if (isNowFast && !wasFast) {
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-speed-enraged-pulse');
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-speed-enraged-pulse');
                    }, 600); // Match animation duration
                }
                this.game.addLog("Ven'fing becomes faster!");
            }
            
            // Add/Remove border class based on current speed state
            if (enemyTimerContainer) {
                if (isNowFast) {
                    enemyTimerContainer.classList.add('enemy-timer-speed-boost');
                } else {
                    enemyTimerContainer.classList.remove('enemy-timer-speed-boost');
                }
            }
        }
        
        // Pack Tactics Check (Feral Hunter)
        if (this.enemy.packTactics) {
            const wasPackTacticsActive = this.enemy.currentAttack > this.enemy.attack;
            const shouldActivatePackTactics = healthPercent < 0.5;

            if (shouldActivatePackTactics && !wasPackTacticsActive) {
                this.enemy.packTacticsActive = true;
                this.enemy.currentAttack = this.enemy.attack + this.enemy.packDamageBonus;
                this.enemy.currentDefense = this.enemy.defense + this.enemy.packDefenseBonus;
                
                // Visual feedback
                const enemySide = document.querySelector('.enemy-side');
                if (enemySide) {
                    enemySide.classList.add('enemy-pack-tactics');
                    setTimeout(() => {
                        enemySide.classList.remove('enemy-pack-tactics');
                    }, 800);
                }
                
                this.game.addLog(`<span style="color: #ffd700">${this.enemy.name}'s pack tactics activate! (+${this.enemy.packDamageBonus} Attack, +${this.enemy.packDefenseBonus} Defense)</span>`);
            } else if (!shouldActivatePackTactics && wasPackTacticsActive) {
                this.enemy.currentAttack = this.enemy.attack;
                this.enemy.currentDefense = this.enemy.defense;
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
            this.enemy.breathAttackInterval,
            this.enemy.timedStunTimer,
            this.enemy.timedStunInterval
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

        // *** Check and trigger Timed Stun ***
        if (this.enemy.timedStunTimer !== null && this.enemy.timedStunTimer <= 0) {
            this.enemyTimedStunAttack(); // Call new function
            if (this.checkCombatEnd()) return; // Check if stun killed player (unlikely but possible)
            this.enemy.timedStunTimer = this.enemy.timedStunInterval; // Reset timer
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
        
        // Apply Poison if applicable
        if (this.enemy.appliesPoison && damageDealt > 0) { // Only apply if damage was dealt
            // *** Check poison chance ***
            const poisonProcChance = this.enemy.poisonChance || 1; // Default to 100% if not defined
            if (Math.random() < poisonProcChance) {
                if (!this.player.activeEffects.poison) { // Don't stack duration if already poisoned
                    this.player.activeEffects.poison = {
                        damageRange: this.enemy.poisonDamage, 
                        duration: this.enemy.poisonDuration,
                        timer: this.enemy.poisonDuration, 
                        tickCooldown: 1.5 
                    };
                    this.game.addLog(`<span style="color: #ab47bc;">You have been poisoned!</span>`);
                }
            } // End poison chance check
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
    }

    enemyBreathAttack() {
        // *** Calculate and apply INSTANT damage ***
        const damage = this.game.getRandomInt(this.enemy.breathAttackDamage[0], this.enemy.breathAttackDamage[1]);
        this.player.takeRawDamage(damage);
        
        // *** Update log message to include instant damage ***
        const logMessage = `<span style="color: #ff8c00;">The ${this.enemy.name} breathes fire, engulfing you for ${damage} damage!</span>`;
        this.game.addLog(logMessage);
        
        // *** Create splat for the instant damage ***
        this.ui.createDamageSplat('.player-side', damage, 'burn'); // Re-use burn style for splat
        
        // Visual effect for the breath hit (Shake animation)
        this.ui.playPlayerAnimation('player-breath-hit', 1000);

        // Apply the DoT effect (remains unchanged)
        if (this.enemy.breathDotDamage && this.enemy.breathDotDuration && this.enemy.breathDotTickInterval) {
            if (!this.player.activeEffects.burning) { 
                 this.player.activeEffects.burning = {
                    damage: this.enemy.breathDotDamage,
                    duration: this.enemy.breathDotDuration,
                    tickInterval: this.enemy.breathDotTickInterval,
                    timeRemaining: this.enemy.breathDotDuration,
                    timeUntilNextTick: this.enemy.breathDotTickInterval 
                 };
                 this.game.addLog("You are set ablaze!"); // Keep separate log for DoT application
            }
        } else {
             console.warn(`[Combat] ${this.enemy.name} hasBreathAttack but no DoT properties defined.`);
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
                    this.player.pendingActionDelay,
                    this.enemy.breathAttackTimer,
                    this.enemy.breathAttackInterval,
                    this.enemy.timedStunTimer,
                    this.enemy.timedStunInterval
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
            // Enemy defeated

            
            // Delay start of fade-out to see splat
            // setTimeout(() => {
                // Start fade-out animation
                if (this.ui.combatArea) {
                    this.ui.combatArea.classList.add('combat-ending');
                }

                this.game.addLog(`You defeated the ${this.enemy.name}!`);
                clearInterval(this.intervalId); // Stop combat immediately
                this.intervalId = null;
                
                // Wait for fade-out to finish before ending combat logic
                setTimeout(() => {

                    this.endCombat(true); // Call endCombat after fade-out
                }, 700); // Matches combat-fade-out duration

            // }, 300); // Initial delay to see the final hit
            
            combatEnded = true; 
            playerWon = true;
            return combatEnded; // Return immediately as combat is over

        } else if (this.player.health <= 0) {
            // Player defeated
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

        // This part is now only reached if player died (handled by its own timeout)
        // or if neither died yet.
        // if (combatEnded && playerWon) { // We moved the playerWon case into the setTimeout above
        //     this.endCombat(true);
        // }
        return combatEnded; // Will be false unless player died this tick
    }

    handleRun() {
        clearInterval(this.intervalId);
        this.intervalId = null;

        const multiplier = 1 + Math.random() * 2;
        const runDamage = Math.floor(this.enemy.attack * multiplier);
        this.player.takeRawDamage(runDamage);
        
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
                <p>But took <span style="color: #ff4444">${runDamage} damage</span> in the process!</p>
                ${this.player.health <= 0 ? 
                    `<p style="color: #ff4444">Unfortunately, you didn't survive the escape attempt...</p>` : 
                    ''}
                <button id="escape-continue">Continue</button>
            `;
            
            messageContainer.innerHTML = content;
            document.body.appendChild(messageContainer);
    
            // --- Create splat on the message box --- 
            this.ui.createDamageSplat('.escape-message-container', runDamage, 'damage');
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
        // Interval is already cleared 
        // this.ui.hideCombatUI(); // Let animation handle hiding
        
        this.player.activeEffects = {};

        // Cleanup: Remove speed boost class if present
        const enemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
        if (enemyTimerContainer) {
            enemyTimerContainer.classList.remove('enemy-timer-speed-boost');
        }

        if (playerWon) {
            this.game.addLog(`You defeated the ${this.enemy.name}!`);

            const goldDropped = this.game.getRandomInt(this.enemy.goldDrop[0], this.enemy.goldDrop[1]);
            const droppedItems = [];
            if (this.enemy.lootTable && this.enemy.lootTable.length > 0) {
                this.enemy.lootTable.forEach(loot => {
                    if (loot.itemId === 'gold') return; // Skip gold entries here, handled separately

                    if (Math.random() < loot.chance) {
                        let chosenItemId = null;

                        if (loot.itemTier) {
                            // Select item ID from tier list
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
                            // Filter out potential null/undefined entries in tier lists
                            const validItems = tierList.filter(id => id);
                            if (validItems.length > 0) {
                                chosenItemId = validItems[this.game.getRandomInt(0, validItems.length - 1)];
                            } else {
                                console.warn(`Item tier list '${loot.itemTier}' is empty or contains invalid entries.`);
                            }
                        } else if (loot.itemId) {
                            // Use specific item ID
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

    // *** NEW FUNCTION for Timed Stun ***
    enemyTimedStunAttack() {
        if (!this.enemy.hasTimedStun) return; // Safety check

        // Apply stun effect to player
        this.player.attackTimerPaused = true;
        this.player.pendingActionDelay = this.enemy.timedStunDuration;
        this.player.isStunned = true; // Set the stun flag
        this.game.addLog(`<span style="color: #ffff99;">${this.enemy.name} slams the ground, stunning you! (Attack delayed ${this.enemy.timedStunDuration}s)</span>`);
        
        // Trigger visual effect
        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            playerSide.classList.add('player-stunned-visual');
            // Remove class after animation (0.4s * 2 = 0.8s)
            setTimeout(() => {
                playerSide.classList.remove('player-stunned-visual');
            }, 800); 
        }
        // Create Stun splat
        this.ui.createDamageSplat('.player-side', 'Stunned!', 'stun');
        
        // Re-render inventory to show stun effect on food
        this.ui.renderInventory(); 
    }
}