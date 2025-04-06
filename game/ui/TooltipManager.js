class TooltipManager {
    constructor(ui) {
        this.ui = ui;

        document.addEventListener('click', (event) => {
            if (this.itemTooltip && !this.itemTooltip.contains(event.target) && !event.target.closest('.inventory-slot, .shop-item span, .equip-slot')) {
                this.hideTooltip(this.itemTooltip);
            }
            if (this.equipTooltip && !this.equipTooltip.contains(event.target) && !event.target.closest('.equip-slot, .inventory-slot')) {
                this.hideTooltip(this.equipTooltip);
            }
        }, true);

        this.addStatTooltipListeners();
        this.addCombatUITooltipListeners();
    }

    showTooltip(text, tooltipElement, event) {
        if (!tooltipElement) {
            return;
        }
        tooltipElement.innerHTML = text;
        tooltipElement.classList.remove('hidden');

        let top = event.clientY + 15;
        let left = event.clientX + 15;
        tooltipElement.style.left = '0px';
        tooltipElement.style.top = '0px';
        const rect = tooltipElement.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (left + rect.width > vw - 20) { left = event.clientX - rect.width - 15; }
        if (top + rect.height > vh - 20) { top = event.clientY - rect.height - 15; }
        left = Math.max(10, left);
        top = Math.max(10, top);
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
    }

    hideTooltip(tooltipElement) { tooltipElement?.classList.add('hidden'); }

    addCombatUITooltipListeners() {
        if (!this.ui.statTooltip) {
            console.error("Stat tooltip element not found. Cannot add combat UI tooltips.");
            return;
        }

        const combatElements = {
            playerAtk: { el: this.ui.combatPlayerAtk, text: "Your current attack power." },
            playerDef: { el: this.ui.combatPlayerDef, text: "Your current defense value." },
            playerSpd: { el: this.ui.combatPlayerSpd, text: "Your current attack speed." },
            enemyAtk: { el: this.ui.combatEnemyAtk, text: "Enemy's current attack power." },
            enemyDef: { el: this.ui.combatEnemyDef, text: "Enemy's current defense value." },
            enemySpd: { el: this.ui.combatEnemySpd, text: "Enemy's current attack speed." },
            playerTimer: { el: this.ui.combatPlayerTimerContainer, text: "Attack every X seconds." },
            enemyTimer: { el: this.ui.combatEnemyTimerContainer, text: "Attack every X seconds." },
            enemyBreathTimer: { el: this.ui.combatEnemyBreathTimerContainer, text: "Firebreath every X seconds." },
            stunTimer: { el: this.ui.combatEnemyStunTimerContainer, text: "Slams ground every X seconds." }
        };

        const playerHealthBarContainer = document.querySelector('.player-side .health-bar-container');

        const poisonEnterHandler = (e) => {
            if (this.ui.game?.player?.activeEffects?.poison) {
                this.showTooltip("You are poisoned!", this.ui.statTooltip, e);
            }
        };
        const poisonLeaveHandler = () => {
            this.hideTooltip(this.ui.statTooltip);
        };

        if (playerHealthBarContainer) {
            playerHealthBarContainer.removeEventListener('mouseenter', playerHealthBarContainer._tooltipEnterHandler);
            playerHealthBarContainer.removeEventListener('mouseleave', playerHealthBarContainer._tooltipLeaveHandler);
            playerHealthBarContainer.addEventListener('mouseenter', poisonEnterHandler);
            playerHealthBarContainer.addEventListener('mouseleave', poisonLeaveHandler);
            playerHealthBarContainer._tooltipEnterHandler = poisonEnterHandler;
            playerHealthBarContainer._tooltipLeaveHandler = poisonLeaveHandler;
        } else {
            console.warn("Combat Tooltip Listener: Player health bar container not found.");
        }

        for (const key in combatElements) {
            const { el, text } = combatElements[key];
            if (el) {
                el.dataset.tooltipTextBase = text;

                const enterHandler = (e) => {
                    let dynamicText = el.dataset.tooltipTextDynamic;
                    let tooltipText = "No description available.";
                    if (dynamicText) {
                        tooltipText = dynamicText;
                    } else {
                        tooltipText = combatElements[key]?.text || "No description available.";
                    }

                    if (key === 'playerTimer') {
                        if (this.ui.game.player.isStunned) {
                            tooltipText = 'You are Stunned!';
                        } else if (this.ui.game.player.pendingActionDelay > 0) {
                            tooltipText = 'You are Eating!';
                        } else {
                            tooltipText = tooltipText.replace('X', this.ui.game?.player?.getAttackSpeed().toFixed(1) || '?');
                        }
                    } else if (key === 'enemyTimer') {
                        tooltipText = tooltipText.replace('X', this.ui.game?.currentCombat?.enemy?.currentSpeed.toFixed(1) || '?');
                    } else if (key === 'enemyBreathTimer') {
                        tooltipText = tooltipText.replace('X', this.ui.game?.currentCombat?.enemy?.breathAttackInterval?.toFixed(1) || '?');
                    } else if (key === 'stunTimer') {
                        tooltipText = tooltipText.replace('X', this.ui.game?.currentCombat?.enemy?.timedStunInterval?.toFixed(1) || '?');
                    }

                    this.ui.showTooltip(tooltipText.replace(/\n/g, '<br>'), this.ui.statTooltip, e);
                };
                const leaveHandler = () => {
                    this.ui.hideTooltip(this.ui.statTooltip);
                };

                el.removeEventListener('mouseenter', el._tooltipEnterHandler);
                el.removeEventListener('mouseleave', el._tooltipLeaveHandler);

                el.addEventListener('mouseenter', enterHandler);
                el.addEventListener('mouseleave', leaveHandler);

                el._tooltipEnterHandler = enterHandler;
                el._tooltipLeaveHandler = leaveHandler;
            } else {
                console.warn(`Combat Tooltip Listener: Element for key '${key}' not found.`);
            }
        }
    }

    addStatTooltipListeners() {
        const statElements = {
            hp: this.ui.statHealthElement,
            attack: this.ui.statAttackElement,
            defense: this.ui.statDefenseElement,
            speed: this.ui.statSpeedElement,
            gold: this.ui.statGoldElement,
            dps: this.ui.statDpsElement,
            round: this.ui.roundAreaElement,
            area: this.ui.areaDescriptionElement
        };

        for (const key in statElements) {
            const element = statElements[key];

            if (element && this.ui.statTooltip) {
                const enterHandler = (e) => {
                    const tooltipText = element.dataset.tooltipText || "No description available.";
                    this.showTooltip(tooltipText.replace(/\\n/g, '<br>'), this.ui.statTooltip, e);
                };
                const leaveHandler = () => {
                    this.hideTooltip(this.ui.statTooltip);
                };

                element.removeEventListener('mouseenter', element._tooltipEnterHandler);
                element.removeEventListener('mouseleave', element._tooltipLeaveHandler);

                element.addEventListener('mouseenter', enterHandler);
                element.addEventListener('mouseleave', leaveHandler);

                element._tooltipEnterHandler = enterHandler;
                element._tooltipLeaveHandler = leaveHandler;

            } else {
                if (!element) console.warn(`Tooltip Listener: Element for stat '${key}' not found during listener attachment.`);
                if (!this.ui.statTooltip) console.warn(`Tooltip Listener: Stat tooltip element not found during listener attachment.`);
            }
        }
    }
}
