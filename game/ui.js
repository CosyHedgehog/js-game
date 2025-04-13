class UI {
    constructor() {
        this.cache = new CacheManager(this);
        this.tooltipManager = new TooltipManager(this);
        this.eventsUI = new EventsUI(this);
        this.inventoryUI = new InventoryUI(this);
        this.equipmentUI = new EquipmentUI(this);
        this.statsUI = new StatsUI(this);
        this.combatUI = new CombatUI(this);
        this.areaUI = new AreaUI(this);
        this.bossUI = new BossUI(this);
        this.splatUI = new SplatUI(this);
        this.roundUI = new RoundUI(this);
        this.EndUI = new EndUI(this);
        this.animationUI = new AnimationUI(this);
        this.startingUI = new Starting(this);
    }

    renderAll() {
        this.renderInventory();
        this.renderEquipment();
        this.updatePlayerStats();
    }

    clearMainArea() { this.cache.clearMainArea(); this.renderAll(); }

    renderStarting(game) { this.startingUI.render(game); }
    renderLoot(lootItems, goldAmount) { this.lootUI.render(lootItems, goldAmount); }
    renderRound(currentRound, maxRounds) { this.roundUI.render(currentRound, maxRounds); }
    renderArea(areaName) { this.areaUI.render(areaName); }
    renderInventory() { this.inventoryUI.render(); }
    renderEquipment() { this.equipmentUI.render(); }
    updatePlayerStats() { this.statsUI.render(); }
    renderCombat(player, enemy) { this.combatUI.render(player, enemy); }
    renderBossEncounter(bossData, bossId) { this.bossUI.render(bossData, bossId); }
    updateCombatTimers(playerTimer, enemyTimer, playerDelay = 0,
        enemyBreathTimer, enemyBreathInterval,
        enemyStunTimer, enemyStunInterval,
        enemyRegenTimer, enemyRegenInterval, enemySlimeTimer, enemySlimeInterval, enemyFormSwitchTimer, enemyFormSwitchInterval, currentForm) { this.combatUI.updateCombatTimers(playerTimer, enemyTimer, playerDelay = 0,
            enemyBreathTimer, enemyBreathInterval,
            enemyStunTimer, enemyStunInterval,
            enemyRegenTimer, enemyRegenInterval, enemySlimeTimer, enemySlimeInterval, enemyFormSwitchTimer, enemyFormSwitchInterval, currentForm); }
    updateCombatStats(player, enemy) { this.combatUI.updateCombatStats(player, enemy); }
    updateCombatantHealth(who, current, max, damage = 0, blocked = 0, isHeal = false, fullBlock = false) { this.combatUI.updateCombatantHealth(who, current, max, damage, blocked, isHeal, fullBlock); }
    createDamageSplat(selector, amount, type = 'damage', blocked = 0, fullBlock = false) { this.splatUI.render(selector, amount, type, blocked, fullBlock); }
    renderChoices(choices) { this.eventsUI.render(choices); }
    showTooltip(text, tooltipElement, event) { this.tooltipManager.showTooltip(text, tooltipElement, event);}
    hideTooltip(tooltipElement) { this.tooltipManager.hideTooltip(tooltipElement); }
    addStatTooltipListeners() { this.tooltipManager.addStatTooltipListeners(); }
    showEndScreen(win) { this.EndUI.render(win); }
    playPlayerAnimation(animationClass, duration) { this.animationUI.playPlayerAnimation(animationClass, duration); }

    triggerEnemyFormSwitchAnimation(newForm) {
        if (this.combatUI && typeof this.combatUI.triggerEnemyFormSwitchAnimation === 'function') {
            this.combatUI.triggerEnemyFormSwitchAnimation(newForm);
        } else {
            const enemySide = document.querySelector('.enemy-side');
            if (enemySide) {
                enemySide.classList.add('enemy-form-switch-pulse');
                setTimeout(() => {
                    enemySide.classList.remove('enemy-form-switch-pulse');
                }, 600); 
            }
        }
    }

    getEventAreaContainer(id) {
        // Implementation of getEventAreaContainer method
    }
}