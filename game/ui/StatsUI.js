class StatsUI {
    constructor(ui) {
        this.ui = ui;
    }

    render() {
        const player = this.ui.game.player;
        const previousRound = this.ui.statRound?.textContent;

        if (this.ui.statHealth) this.ui.statHealth.textContent = player.health;
        if (this.ui.statMaxHealth) this.ui.statMaxHealth.textContent = player.getMaxHealth();

        // Display Heal Over Time info
        let hotTooltipText = "";
        const isHealingActive = player.healOverTimeEffects && player.healOverTimeEffects.length > 0;
        const healthStatItem = this.ui.statHealthElement?.closest('.stat-item'); // Find the parent stat-item

        let healthText = `${player.health}`; // Default health text

        if (isHealingActive) {
            // Find the maximum remaining time among active effects (needed for display)
            const maxTimeLeft = player.healOverTimeEffects.reduce((max, effect) => Math.max(max, effect.timeLeft), 0);
            
            // Update health text to include max time left
            healthText = `${player.health} (${Math.ceil(maxTimeLeft)}s)`; 

            // Generate tooltip text by listing each effect
            hotTooltipText = ""; // Reset
            player.healOverTimeEffects.forEach(effect => {
                hotTooltipText += `<br>Healing +${effect.heal} HP every ${effect.interval}s)`;
            });
             
            healthStatItem?.classList.add('stat-item-healing'); // Add class for green color
        } else {
             healthStatItem?.classList.remove('stat-item-healing'); // Remove class for green color
        }

        // --- Display HP (potentially with time) ---
        if (this.ui.statHealth) this.ui.statHealth.textContent = healthText; // Display number and time suffix
        // --- End HP Display ---

        // Set the combined tooltip on the correct element
        let baseHealthTooltip = "Health / Max Health";
        if (this.ui.statHealthElement) { // Target the correct element for tooltip
            // Combine base tooltip with HoT details if active

            // Rebuild the HoT part here as well to ensure consistency
            let currentHotTooltipLines = "";
            if (isHealingActive) {
                 player.healOverTimeEffects.forEach(effect => {
                    currentHotTooltipLines += `<br>Healing +${effect.heal} HP every ${effect.interval}s`;
                });
            }

           this.ui.statHealthElement.dataset.tooltipText = baseHealthTooltip + currentHotTooltipLines; 
        }

        const totalAttack = player.getAttack();
        const tempAttackBonus = player.getTempAttackBonus();
        let attackText = `${totalAttack}`;
        let attackTooltip = this.ui.tooltipCache.attack.get(totalAttack);

        if (!attackTooltip) {
            attackTooltip = "<b>Max damage<\/b><br><br>Chance to hit:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let hits = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (totalAttack + 1));
                    const defenseRoll = Math.floor(Math.random() * (def + 1));
                    if (attackRoll > defenseRoll) {
                        hits++;
                    }
                }
                const hitChance = (hits / numSimulations) * 100;
                attackTooltip += `${def} Def: <b>${hitChance.toFixed(1)}%</b><br>`;
            }

            this.ui.tooltipCache.attack.set(totalAttack, attackTooltip);
        }

        if (tempAttackBonus > 0) {
            attackText += ` <span class=\"boosted-stat\">(+${tempAttackBonus})</span>`;
            attackTooltip = attackTooltip + `<br>Boosted by +${tempAttackBonus} <br> (until combat ends).`;
        }
        // Add shrine contribution to tooltip if applicable
        if (player.shrineAttackIncrease > 0) {
             attackTooltip += `<br>+${player.shrineAttackIncrease} from shrine`;
        }

        if (this.ui.statAttack) this.ui.statAttack.innerHTML = attackText;
        if (this.ui.statAttackElement) this.ui.statAttackElement.dataset.tooltipText = attackTooltip;

        const totalDefense = player.getDefense();
        const tempDefenseBonus = player.getTempDefenseBonus();
        let defenseText = `${totalDefense}`;
        let defenseTooltip = this.ui.tooltipCache.defense.get(totalDefense);

        if (!defenseTooltip) {
            defenseTooltip = "<b>Max block<\/b><br><br>Chance to block:<br>";
            const numSimulations = 2400;

            for (let atk = 0; atk <= 10; atk++) {
                let blocks = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (atk + 1));
                    const defenseRoll = Math.floor(Math.random() * (totalDefense + 1));
                    if (defenseRoll >= attackRoll) {
                        blocks++;
                    }
                }
                const blockChance = (blocks / numSimulations) * 100;
                defenseTooltip += `${atk} Atk: <b>${blockChance.toFixed(1)}%</b><br>`;
            }

            this.ui.tooltipCache.defense.set(totalDefense, defenseTooltip);
        }

        if (tempDefenseBonus > 0) {
            defenseText += ` <span class=\"boosted-stat\">(+${tempDefenseBonus})</span>`;
            defenseTooltip = defenseTooltip + `<br>Boosted by +${tempDefenseBonus} <br> (until combat ends).`;
        }
        // Add shrine contribution to tooltip if applicable
        if (player.shrineDefenseIncrease > 0) {
            defenseTooltip += `<br>+${player.shrineDefenseIncrease} from shrine`;
        }
        if (this.ui.statDefense) this.ui.statDefense.innerHTML = defenseText;
        if (this.ui.statDefenseElement) this.ui.statDefenseElement.dataset.tooltipText = defenseTooltip;

        const baseSpeed = player.equipment.weapon !== null ? (this.ui.game.player.inventory[player.equipment.weapon]?.speed ?? player.defaultAttackSpeed) : player.defaultAttackSpeed;
        const ringReduction = player.equipment.ring !== null ? (this.ui.game.player.inventory[player.equipment.ring]?.stats?.speedBonus ?? 0) : 0;
        let shrineReduction = player.shrineSpeedReduction;
        let finalSpeed = Math.max(0.5, baseSpeed - player.tempSpeedReduction - ringReduction - shrineReduction);
        let speedText = `${finalSpeed.toFixed(1)}s`;
        let speedTooltip = "Time between your attacks <br> (lower is faster, minimum 0.5s).";
        if (player.tempSpeedReduction > 0) {
            speedText += ` <span class=\"boosted-stat\">(-${player.tempSpeedReduction.toFixed(1)}s)</span>`;
            speedTooltip = `Time between your attacks <br> (lower is faster, minimum 0.5s).<br>Boosted by -${player.tempSpeedReduction.toFixed(1)}s <br> (until combat ends).`;
        }
         // Add shrine contribution to tooltip if applicable
        if (player.shrineSpeedReduction > 0) {
            speedTooltip += `<br>-${player.shrineSpeedReduction.toFixed(1)}s from shrine`;
        }
        if (this.ui.statSpeed) this.ui.statSpeed.innerHTML = speedText;
        if (this.ui.statSpeedElement) this.ui.statSpeedElement.dataset.tooltipText = speedTooltip;

        const attackSpeed = player.getAttackSpeed();
        const cacheKey = `${totalAttack}_${attackSpeed}`;
        let dpsTooltip = this.ui.tooltipCache.dps.get(cacheKey);

        if (!dpsTooltip) {
            dpsTooltip = "<b>Damage per second<\/b><br><br>DPS against:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let totalDamage = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (totalAttack + 1));
                    const defenseRoll = Math.floor(Math.random() * (def + 1));
                    const damage = Math.max(0, attackRoll - defenseRoll);
                    totalDamage += damage;
                }
                const avgDamagePerHit = totalDamage / numSimulations;
                const dpsAgainstDef = attackSpeed > 0 ? (avgDamagePerHit / attackSpeed) : 0;
                dpsTooltip += `${def} Def: <b>${dpsAgainstDef.toFixed(2)}</b><br>`;
            }

            this.ui.tooltipCache.dps.set(cacheKey, dpsTooltip);
        }

        if (this.ui.statDpsElement) this.ui.statDpsElement.dataset.tooltipText = dpsTooltip;

        if (this.ui.statGold) this.ui.statGold.textContent = player.gold;
        if (this.ui.statGoldElement) this.ui.statGoldElement.dataset.tooltipText = "Your current wealth.";
        if (this.ui.statDps) this.ui.statDps.textContent = (totalAttack / attackSpeed).toFixed(1);

        if (this.ui.statRound && this.ui.game && this.ui.roundAreaElement) {
            const currentRound = this.ui.game.currentRound;
            const currentRoundText = `${currentRound}`;
            const maxRoundsElement = document.getElementById('stat-max-rounds');

            if (this.ui.statRound.textContent !== currentRoundText) {
                this.ui.statRound.textContent = currentRoundText;
                this.ui.roundAreaElement.classList.remove('round-pulsing');
                void this.ui.roundAreaElement.offsetWidth;
                this.ui.roundAreaElement.classList.add('round-pulsing');
                setTimeout(() => {
                    this.ui.roundAreaElement.classList.remove('round-pulsing');
                }, 700);
            }
            if (maxRoundsElement) maxRoundsElement.textContent = this.ui.game.maxRounds;

            let roundTooltipText = `Current Round: ${currentRound} / ${this.ui.game.maxRounds}`;
            if (currentRound === 10 || currentRound === 20) {
                roundTooltipText = `Prepare to fight!`;
            } else if (currentRound === 30) {
                roundTooltipText = `The Ancient Dragon awaits...`;
            }

            this.ui.roundAreaElement.dataset.tooltipText = roundTooltipText;
        }

        if (this.ui.areaDescriptionElement) {
            let areaName = "Unknown Area"; let areaTooltip = "You are somewhere mysterious..."; const currentAreaId = this.ui.game.currentArea;
            let currentTier = null;

            const roundForLookup = this.ui.game.currentRound === 0 ? 1 : this.ui.game.currentRound;

            for (const tier of AREA_CONFIG) {
                if (roundForLookup >= tier.startRound && roundForLookup <= tier.endRound) {
                    currentTier = tier;
                    break;
                }
            }

            if (currentTier && currentTier.areas && currentTier.areas[currentAreaId]) {
                areaName = currentTier.areas[currentAreaId].name;
                areaTooltip = currentTier.areas[currentAreaId].tooltip;
            } else if (currentAreaId) {
                console.warn(`Area info not found in AREA_CONFIG for: ${currentAreaId} in current tier (lookup round: ${roundForLookup}).`);
            }

            this.ui.areaDescriptionElement.textContent = areaName;
            this.ui.areaDescriptionElement.dataset.tooltipText = areaTooltip;
        }

        const attack = player.getAttack();
        const speed = player.getAttackSpeed();
        const dps = speed > 0 ? (attack / speed) : 0;
        this.ui.statDps.textContent = dps.toFixed(1);
    }
}
