class StatsUI {
    constructor(ui) {
        this.ui = ui;
    }

    render() {
        const player = this.ui.game.player;
        const previousRound = this.ui.statRound?.textContent;

        if (this.ui.statHealth) this.ui.statHealth.textContent = player.health;
        if (this.ui.statMaxHealth) this.ui.statMaxHealth.textContent = player.getMaxHealth();

        let attackBase = player.baseAttack + (player.equipment.weapon !== null ? (this.ui.game.player.inventory[player.equipment.weapon]?.stats?.attack || 0) : 0) + (player.equipment.ring !== null ? (this.ui.game.player.inventory[player.equipment.ring]?.stats?.attack || 0) : 0);
        let attackText = `${attackBase}`;

        const maxAttack = player.getAttack();
        let attackTooltip = this.ui.tooltipCache.attack.get(maxAttack);

        if (!attackTooltip) {
            attackTooltip = "<b>Max damage<\/b><br><br>Chance to hit:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let hits = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (maxAttack + 1));
                    const defenseRoll = Math.floor(Math.random() * (def + 1));
                    if (attackRoll > defenseRoll) {
                        hits++;
                    }
                }
                const hitChance = (hits / numSimulations) * 100;
                attackTooltip += `${def} Def: <b>${hitChance.toFixed(1)}%</b><br>`;
            }

            this.ui.tooltipCache.attack.set(maxAttack, attackTooltip);
        }

        if (player.tempAttack > 0) {
            attackText += ` <span class="boosted-stat">(+${player.tempAttack})</span>`;
            attackTooltip = attackTooltip + `<br>Boosted by +${player.tempAttack} (temporary, lasts until combat ends).`;
        }

        if (this.ui.statAttack) this.ui.statAttack.innerHTML = attackText;
        if (this.ui.statAttackElement) this.ui.statAttackElement.dataset.tooltipText = attackTooltip;

        let defenseBase = player.baseDefense;
        Object.values(player.equipment).forEach(index => {
            if (index !== null && this.ui.game.player.inventory[index]?.stats?.defense) {
                defenseBase += this.ui.game.player.inventory[index].stats.defense;
            }
        });
        let defenseText = `${defenseBase}`;

        const maxDefense = player.getDefense();
        let defenseTooltip = this.ui.tooltipCache.defense.get(maxDefense);

        if (!defenseTooltip) {
            defenseTooltip = "<b>Max block<\/b><br><br>Chance to block:<br>";
            const numSimulations = 2400;

            for (let atk = 0; atk <= 10; atk++) {
                let blocks = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (atk + 1));
                    const defenseRoll = Math.floor(Math.random() * (maxDefense + 1));
                    if (defenseRoll >= attackRoll) {
                        blocks++;
                    }
                }
                const blockChance = (blocks / numSimulations) * 100;
                defenseTooltip += `${atk} Atk: <b>${blockChance.toFixed(1)}%</b><br>`;
            }

            this.ui.tooltipCache.defense.set(maxDefense, defenseTooltip);
        }

        if (player.tempDefense > 0) {
            defenseText += ` <span class="boosted-stat">(+${player.tempDefense})</span>`;
            defenseTooltip = defenseTooltip + `<br>Boosted by +${player.tempDefense} (temporary, lasts until combat ends).`;
        }
        if (this.ui.statDefense) this.ui.statDefense.innerHTML = defenseText;
        if (this.ui.statDefenseElement) this.ui.statDefenseElement.dataset.tooltipText = defenseTooltip;

        const baseSpeed = player.equipment.weapon !== null ? (this.ui.game.player.inventory[player.equipment.weapon]?.speed ?? player.defaultAttackSpeed) : player.defaultAttackSpeed;
        let finalSpeed = Math.max(0.5, baseSpeed - player.tempSpeedReduction);
        let speedText = `${finalSpeed.toFixed(1)}s`;
        let speedTooltip = "Time between your attacks (lower is faster).";
        if (player.tempSpeedReduction > 0) {
            speedText += ` <span class="boosted-stat">(-${player.tempSpeedReduction.toFixed(1)}s)</span>`;
            speedTooltip = `Time between your attacks (lower is faster).\nBoosted by -${player.tempSpeedReduction.toFixed(1)}s (temporary, lasts until combat ends).`;
        }
        if (this.ui.statSpeed) this.ui.statSpeed.innerHTML = speedText; if (this.ui.statSpeedElement) this.ui.statSpeedElement.dataset.tooltipText = speedTooltip;

        const attackSpeed = player.getAttackSpeed();
        const cacheKey = `${maxAttack}_${attackSpeed}`;
        let dpsTooltip = this.ui.tooltipCache.dps.get(cacheKey);

        if (!dpsTooltip) {
            dpsTooltip = "<b>Damage per second<\/b><br><br>DPS against:<br>";
            const numSimulations = 2400;

            for (let def = 0; def <= 10; def++) {
                let totalDamage = 0;
                for (let i = 0; i < numSimulations; i++) {
                    const attackRoll = Math.floor(Math.random() * (maxAttack + 1));
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
        if (this.ui.statGoldElement) this.ui.statGoldElement.dataset.tooltipText = "Your current wealth."; if (this.ui.statHealthElement) this.ui.statHealthElement.dataset.tooltipText = "Current Health / Maximum Health"; if (this.ui.statDps) this.ui.statDps.textContent = (player.getAttack() / player.getAttackSpeed()).toFixed(1);

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
                roundTooltipText = `MINI-BOSS APPROACHING! (Round ${currentRound})`;
            } else if (currentRound === 30) {
                roundTooltipText = `FINAL BOSS! The Ancient Dragon awaits... (Round ${currentRound})`;
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

        const attack = this.ui.game.player.getAttack();
        const speed = this.ui.game.player.getAttackSpeed();
        const dps = speed > 0 ? (attack / speed) : 0;
        this.ui.statDps.textContent = dps.toFixed(1);
    }
}
