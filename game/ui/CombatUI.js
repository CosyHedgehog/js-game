class CombatUI {
    constructor(ui) { this.ui = ui; }

    render(player, enemy) {
        this.ui.clearMainArea();
        this.ui.combatArea.classList.remove('hidden');
        document.getElementById('combat-enemy-name').textContent = enemy.name;

        const initialPlayerPercentage = (player.health / player.getMaxHealth()) * 100;
        if (this.ui.combatPlayerHp) this.ui.combatPlayerHp.textContent = `${player.health}/${player.getMaxHealth()}`;
        const playerHealthBar = document.querySelector('.player-health');
        if (playerHealthBar) playerHealthBar.style.width = `${initialPlayerPercentage}%`;

        const initialEnemyPercentage = (enemy.health / enemy.maxHealth) * 100;
        if (this.ui.combatEnemyHp) this.ui.combatEnemyHp.textContent = `${enemy.health}/${enemy.maxHealth}`;
        const enemyHealthBar = document.querySelector('.enemy-health');
        if (enemyHealthBar) enemyHealthBar.style.width = `${initialEnemyPercentage}%`;

        this.updateCombatTimers(player.attackTimer, enemy.attackTimer);
        this.updateCombatStats(player, enemy);

        // --- Initial Mechanic Icon Setup --- 
        const iconContainer = document.querySelector('.enemy-side .mechanic-icon-container');
        if (iconContainer && (enemy.isBoss || enemy.isMiniBoss) && enemy.mechanicTooltips) {
            iconContainer.classList.remove('hidden');
            this.attachMechanicTooltipListener(enemy); // Attach listener
        } else if (iconContainer) {
            iconContainer.classList.add('hidden'); // Hide if not applicable
        }
        // --- End Initial Setup ---
    }

    updateCombatTimers(playerTimer, enemyTimer, playerDelay = 0,
        enemyBreathTimer, enemyBreathInterval,
        enemyStunTimer, enemyStunInterval,
        enemyRegenTimer, enemyRegenInterval,
        enemySlimeTimer, enemySlimeInterval,
        enemyFormSwitchTimer, enemyFormSwitchInterval,
        currentEnemyForm) {
            const playerTimerEl = document.getElementById('combat-player-timer');
        const playerTimerBar = document.querySelector('.player-timer');
        const enemyTimerEl = document.getElementById('combat-enemy-timer');
        const enemyTimerBar = document.querySelector('.enemy-timer');
        const enemyBreathTimerEl = document.getElementById('combat-enemy-breath-timer');
        const enemyBreathTimerContainer = document.querySelector('.breath-timer');
        const enemyBreathTimerBar = document.querySelector('.enemy-breath-timer');
        const enemyStunTimerEl = document.getElementById('combat-enemy-stun-timer');
        const enemyStunTimerContainer = document.querySelector('.stun-timer');
        const enemyStunTimerBar = document.querySelector('.enemy-stun-timer');
        const enemyRegenTimerEl = document.getElementById('combat-enemy-regen-timer');
        const enemyRegenTimerContainer = document.querySelector('.regen-timer');
        const enemyRegenTimerBar = document.querySelector('.enemy-regen-timer');
        const enemySlimeTimerEl = document.getElementById('combat-enemy-slime-timer');
        const enemySlimeTimerContainer = document.querySelector('.slime-timer');
        const enemySlimeTimerBar = document.querySelector('.enemy-slime-timer');
        const enemyFormSwitchTimerEl = this.ui.combatEnemyFormSwitchTimerText;
        const enemyFormSwitchTimerContainer = this.ui.combatEnemyFormSwitchTimerContainer;
        const enemyFormSwitchTimerBar = this.ui.combatEnemyFormSwitchTimerBar;

        const playerHealthBar = document.querySelector('.player-health');
        if (this.ui.game.player.healOverTimeEffects && this.ui.game.player.healOverTimeEffects.length > 0) {
            playerHealthBar.classList.add('player-healing-effect');
        } else {
            playerHealthBar.classList.remove('player-healing-effect');
        }

        if (playerTimerEl) playerTimerEl.textContent = playerTimer.toFixed(1);
        if (playerTimerBar) {
            const playerTotalTime = this.ui.game.player.getAttackSpeed();
            const playerProgress = 1 - (playerTimer / playerTotalTime);
            playerTimerBar.style.width = `${Math.min(100, playerProgress * 100)}%`;
            const playerContainer = playerTimerBar.closest('.attack-timer');
            if (playerContainer) {
                if (playerDelay > 0) {
                    playerContainer.classList.add('player-delayed');
                    playerTimerEl.textContent = `Delayed ${playerDelay.toFixed(1)}s`;

                    if (this.ui.game.player.isStunned) {
                        playerTimerBar.style.width = `${(playerDelay / this.ui.game.player.activeEffects.stun.duration) * 100}%`;
                    } else {
                        playerTimerBar.style.width = `${(playerDelay / 2) * 100}%`;
                    }

                    playerTimerBar.style.backgroundColor = '#ffd700';
                } else {
                    playerContainer.classList.remove('player-delayed');
                    playerTimerBar.style.width = `${1 - (playerTimer - this.ui.game.player.getAttackSpeed)}%`;
                    playerTimerBar.style.backgroundColor = '';
                }
            }
        }

        if (enemyTimerEl) enemyTimerEl.textContent = enemyTimer.toFixed(1);
        if (enemyTimerBar) {
            const enemyTotalTime = this.ui.game.currentCombat.enemy.currentSpeed;
            const enemyProgress = 1 - (enemyTimer / enemyTotalTime);
            enemyTimerBar.style.width = `${Math.min(100, enemyProgress * 100)}%`;
        }

        if (enemyBreathTimerContainer) {
            if (enemyBreathInterval !== null && enemyBreathInterval > 0) {
                enemyBreathTimerContainer.classList.remove('hidden');
                if (enemyBreathTimerEl) enemyBreathTimerEl.textContent = enemyBreathTimer.toFixed(1);
                if (enemyBreathTimerBar) {
                    const breathProgress = 1 - (enemyBreathTimer / enemyBreathInterval);
                    enemyBreathTimerBar.style.width = `${Math.min(100, breathProgress * 100)}%`;
                }
            } else {
                enemyBreathTimerContainer.classList.add('hidden');
            }
        }

        if (enemyStunTimerContainer) {
            if (enemyStunInterval !== null && enemyStunInterval > 0) {
                enemyStunTimerContainer.classList.remove('hidden');
                if (enemyStunTimerEl) enemyStunTimerEl.textContent = enemyStunTimer.toFixed(1);
                if (enemyStunTimerBar) {
                    const stunProgress = 1 - (enemyStunTimer / enemyStunInterval);
                    enemyStunTimerBar.style.width = `${Math.min(100, stunProgress * 100)}%`;
                }
            } else {
                enemyStunTimerContainer.classList.add('hidden');
            }
        }

        if (enemyRegenTimerContainer) {
            if (enemyRegenInterval !== null && enemyRegenInterval > 0) {
                enemyRegenTimerContainer.classList.remove('hidden');
                if (enemyRegenTimerEl) enemyRegenTimerEl.textContent = enemyRegenTimer.toFixed(1);
                if (enemyRegenTimerBar) {
                    const regenProgress = 1 - (enemyRegenTimer / enemyRegenInterval);
                    enemyRegenTimerBar.style.width = `${Math.min(100, regenProgress * 100)}%`;
                }
            } else {
                enemyRegenTimerContainer.classList.add('hidden');
            }
        }

        if (enemySlimeTimerContainer) {
            if (enemySlimeInterval !== null && enemySlimeInterval > 0) {
                enemySlimeTimerContainer.classList.remove('hidden');
                if (enemySlimeTimerEl) enemySlimeTimerEl.textContent = enemySlimeTimer.toFixed(1);
                if (enemySlimeTimerBar) {
                    const slimeProgress = 1 - (enemySlimeTimer / enemySlimeInterval);
                    enemySlimeTimerBar.style.width = `${Math.min(100, slimeProgress * 100)}%`;
                }
            } else {
                enemySlimeTimerContainer.classList.add('hidden');
            }
        }

        if (enemyFormSwitchTimerContainer) {
            if (enemyFormSwitchInterval !== null && enemyFormSwitchInterval > 0) {
                enemyFormSwitchTimerContainer.classList.remove('hidden');
                if (enemyFormSwitchTimerEl) enemyFormSwitchTimerEl.textContent = enemyFormSwitchTimer.toFixed(1);
                if (enemyFormSwitchTimerBar) {
                    const formProgress = 1 - (enemyFormSwitchTimer / enemyFormSwitchInterval);
                    enemyFormSwitchTimerBar.style.width = `${Math.min(100, formProgress * 100)}%`;

                    if (currentEnemyForm === 'thorns') {
                        enemyFormSwitchTimerBar.style.background = 'linear-gradient(to right, #66bb6a, #43a047)'; 
                        if (enemyFormSwitchTimerEl) enemyFormSwitchTimerEl.style.color = '#a5d6a7';
                    } else if (currentEnemyForm === 'regenerate') {
                        enemyFormSwitchTimerBar.style.background = 'linear-gradient(to right, #a1887f, #795548)'; 
                        if (enemyFormSwitchTimerEl) enemyFormSwitchTimerEl.style.color = '#bcaaa4';
                    } else {
                        enemyFormSwitchTimerBar.style.background = '';
                        if (enemyFormSwitchTimerEl) enemyFormSwitchTimerEl.style.color = '';
                    }
                }
            } else {
                enemyFormSwitchTimerContainer.classList.add('hidden');
            }
        }
    }

    updateCombatStats(player, enemy) {
        if (this.ui.combatPlayerAtk) {
            this.ui.combatPlayerAtk.textContent = `⚔️ ${player.getAttack()}`;
        }
        if (this.ui.combatPlayerDef) {
            this.ui.combatPlayerDef.textContent = `🛡️ ${player.getDefense()}`;
        }
        if (this.ui.combatPlayerSpd) {
            this.ui.combatPlayerSpd.textContent = `⚡️ ${player.getAttackSpeed().toFixed(1)}s`;
        }
        if (this.ui.combatPlayerHp) {
            const playerMaxHp = player.getMaxHealth();
            this.ui.combatPlayerHp.textContent = `${Math.ceil(player.health)}/${playerMaxHp}`;
            const playerHealthBar = document.querySelector('.player-health');
            if (playerHealthBar) {
                playerHealthBar.style.width = `${(player.health / playerMaxHp) * 100}%`;
            }
        }

        if (this.ui.combatEnemyAtk) {
            this.ui.combatEnemyAtk.textContent = `⚔️ ${enemy.currentAttack}`;
            if (enemy.currentAttack > enemy.attack) {
                this.ui.combatEnemyAtk.classList.add('enraged');
            } else {
                this.ui.combatEnemyAtk.classList.remove('enraged');
            }
        }
        if (this.ui.combatEnemyDef) {
            this.ui.combatEnemyDef.textContent = `🛡️ ${enemy.currentDefense}`;
            if (enemy.scalesHardened) {
                this.ui.combatEnemyDef.classList.add('hardened');
            } else {
                this.ui.combatEnemyDef.classList.remove('hardened');
            }
        }
        if (this.ui.combatEnemySpd) {
            this.ui.combatEnemySpd.textContent = `⚡️ ${enemy.currentSpeed.toFixed(1)}s`;
        }
        if (this.ui.combatEnemyHp) {
            const enemyMaxHp = enemy.maxHealth;
            this.ui.combatEnemyHp.textContent = `${Math.ceil(enemy.health)}/${enemyMaxHp}`;
            const enemyHealthBar = document.querySelector('.enemy-health');
            if (enemyHealthBar) {
                enemyHealthBar.style.width = `${(enemy.health / enemyMaxHp) * 100}%`;
            }
        }

        const playerSide = document.querySelector('.player-side');
        if (playerSide) {
            if (player.activeEffects.poison) {
                playerSide.classList.add('player-poisoned');
            } else {
                playerSide.classList.remove('player-poisoned');
            }
            if (!player.activeEffects.burning) {
                playerSide.classList.remove('player-burning');
            }
        }

        this.ui.addStatTooltipListeners('.player-side .combat-stats', this.ui.statTooltip);

        const regenTimerContainer = this.ui.combatArea.querySelector('.regen-timer');
        if (regenTimerContainer) {
            regenTimerContainer.addEventListener('mouseenter', (e) => {
                this.ui.showTooltip("The giant is regenerating.", this.ui.statTooltip, e);
            });
            regenTimerContainer.addEventListener('mouseleave', () => {
                this.ui.hideTooltip(this.ui.statTooltip);
            });
        }

        this.updateCombatTimers(
            player.attackTimer,
            enemy.attackTimer,
            player.pendingActionDelay,
            enemy.breathAttackTimer,
            enemy.breathAttackInterval,
            enemy.timedStunTimer,
            enemy.timedStunInterval,
            enemy.regenerationTimer,
            enemy.regenerationInterval,
            enemy.slimeAttackTimer,
            enemy.slimeInterval,
            enemy.formSwitchTimer,
            enemy.formSwitchInterval,
            enemy.currentForm
        );

        this.updateVisualForm(enemy);

        // --- Re-attach Tooltip on Stats Update (if applicable) --- 
        const iconContainer = document.querySelector('.enemy-side .mechanic-icon-container');
         if (iconContainer && !iconContainer.classList.contains('hidden')) {
             this.attachMechanicTooltipListener(enemy);
         }
         // --- End Re-attach Tooltip ---
    }

    updateCombatantHealth(who, current, max, damage = 0, blocked = 0, isHeal = false, fullBlock = false) {
        const percentage = (current / max) * 100;
        let splatType = isHeal ? 'heal' : 'damage';

        if (who === 'player') {
            this.ui.combatPlayerHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.player-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');

            this.ui.createDamageSplat('.player-side', damage, splatType, blocked, fullBlock);

            const player = this.ui.game.player;
            const isHealing = player.healOverTimeEffects && player.healOverTimeEffects.length > 0;

            if (isHealing) {
                healthBar.classList.add('player-healing-effect');
                // Add tooltip if not already present
                if (!healthBar._tooltipEnterHandler) {
                     const enterHandler = (e) => {
                        this.ui.showTooltip("You are healing over time.", this.ui.statTooltip, e);
                    };
                    const leaveHandler = () => {
                        this.ui.hideTooltip(this.ui.statTooltip);
                    };
                    healthBar.addEventListener('mouseenter', enterHandler);
                    healthBar.addEventListener('mouseleave', leaveHandler);
                    healthBar._tooltipEnterHandler = enterHandler;
                    healthBar._tooltipLeaveHandler = leaveHandler;
                }
            } else {
                healthBar.classList.remove('player-healing-effect');
                // Remove tooltip if present
                 if (healthBar._tooltipEnterHandler) {
                    healthBar.removeEventListener('mouseenter', healthBar._tooltipEnterHandler);
                    healthBar.removeEventListener('mouseleave', healthBar._tooltipLeaveHandler);
                    delete healthBar._tooltipEnterHandler;
                    delete healthBar._tooltipLeaveHandler;
                    this.ui.hideTooltip(this.ui.statTooltip); // Hide if visible
                }
            }

        } else if (who === 'enemy') {
            this.ui.combatEnemyHp.textContent = `${current}/${max}`;
            const healthBar = document.querySelector('.enemy-health');
            healthBar.style.width = `${percentage}%`;
            healthBar.classList.remove('damage-taken');
            void healthBar.offsetWidth;
            healthBar.classList.add('damage-taken');
            this.ui.createDamageSplat('.enemy-side', damage, splatType, blocked, fullBlock);

            if (this.ui.game?.currentCombat?.enemy?.currentForm === 'regenerate') {
                 healthBar.classList.add('enemy-healing-effect');
            } else {
                 healthBar.classList.remove('enemy-healing-effect');
            }
        }
    }

    updateVisualForm(enemy) {
        const enemySide = document.querySelector('.enemy-side');
        const enemyHealthBar = document.querySelector('.enemy-health');
        const mechanicIcon = enemySide?.querySelector('.mechanic-icon');
        if (!enemySide || !enemyHealthBar) return;

        const currentForm = enemy.currentForm;

        // Clear previous form classes
        enemySide.classList.remove('form-thorns', 'form-regenerate');
        enemyHealthBar.classList.remove('enemy-healing-effect');
        if (mechanicIcon) mechanicIcon.textContent = '?'; // Default icon

        if (currentForm === 'thorns') {
            enemySide.classList.add('form-thorns');
        } else if (currentForm === 'regenerate') {
            enemySide.classList.add('form-regenerate');
            enemyHealthBar.classList.add('enemy-healing-effect');
        }
        // else: Default state (no form classes, default icon)
    }

    triggerEnemyFormSwitchAnimation(newForm) {
        const enemySide = document.querySelector('.enemy-side');
        const enemy = this.ui.game?.currentCombat?.enemy;
        if (enemySide && enemy) {
            enemySide.classList.add('enemy-form-switch-pulse');
            this.updateVisualForm(enemy);
            this.attachMechanicTooltipListener(enemy);
            setTimeout(() => {
                enemySide.classList.remove('enemy-form-switch-pulse');
            }, 600);
        }
    }

    attachMechanicTooltipListener(enemy) {
        const iconContainer = document.querySelector('.enemy-side .mechanic-icon-container');
        const tooltipManager = this.ui.tooltipManager;

        if (!iconContainer || !enemy || !enemy.mechanicTooltips || !tooltipManager || !this.ui.statTooltip) {
            return; // Exit if prerequisites missing
        }

        const enterHandler = (e) => {
            let stateKey = 'default'; // Default key for simple mechanics

            // --- Determine current state for tooltip key --- 
            if (enemy.hasFormSwitching) {
                stateKey = enemy.currentForm; // e.g., 'thorns', 'regenerate'
            } else if (enemy.enrageThreshold) {
                stateKey = enemy.currentAttack > enemy.attack ? 'enraged' : 'normal';
            } else if (enemy.hardenThreshold) {
                stateKey = enemy.scalesHardened ? 'hardened' : 'normal';
            } else if (enemy.speedIncreaseThreshold) {
                stateKey = enemy.currentSpeed < enemy.speed ? 'quickened' : 'normal';
            }
            // Add more else if for other state-based mechanics here
            // --- End state determination ---

            const tooltipText = enemy.mechanicTooltips[stateKey] || 
                                enemy.mechanicTooltips['default'] || // Fallback to default if stateKey not found
                                "Current mechanic details unavailable."; // Final fallback
                                
            tooltipManager.showTooltip(tooltipText.replace(/\n/g, '<br>'), this.ui.statTooltip, e);
        };

        const leaveHandler = () => {
            tooltipManager.hideTooltip(this.ui.statTooltip);
        };

        // Remove previous listeners first
        if (iconContainer._mechanicTooltipEnterHandler) {
            iconContainer.removeEventListener('mouseenter', iconContainer._mechanicTooltipEnterHandler);
        }
        if (iconContainer._mechanicTooltipLeaveHandler) {
            iconContainer.removeEventListener('mouseleave', iconContainer._mechanicTooltipLeaveHandler);
        }

        // Add new listeners
        iconContainer.addEventListener('mouseenter', enterHandler);
        iconContainer.addEventListener('mouseleave', leaveHandler);

        // Store handlers
        iconContainer._mechanicTooltipEnterHandler = enterHandler;
        iconContainer._mechanicTooltipLeaveHandler = leaveHandler;
    }
}
