class CacheManager {
    constructor(ui) {
        this.ui = ui;
        this.ui.draggedItemIndex = null;
        this.ui.draggedItem = null;
        this.ui.lootArea = document.getElementById('loot-area');
        this.ui.lootGold = document.getElementById('loot-gold');
        this.ui.lootItemsContainer = document.getElementById('loot-items');
        this.ui.lootTakeButton = document.getElementById('loot-take-button');
        this.ui.startScreen = document.getElementById('start-screen');
        this.ui.gameScreen = document.getElementById('game-screen');
        this.ui.endScreen = document.getElementById('end-screen');
        this.ui.endMessage = document.getElementById('end-message');
        this.ui.choicesArea = document.getElementById('choices-area');
        this.ui.combatArea = document.getElementById('combat-area');
        this.ui.shopArea = document.getElementById('shop-area');
        this.ui.restArea = document.getElementById('rest-area');
        this.ui.inventoryArea = document.getElementById('inventory-area');
        this.ui.equipmentArea = document.getElementById('equipment-area');
        this.ui.playerStatsArea = document.getElementById('player-stats-area');
        this.ui.inventoryGrid = document.getElementById('inventory-grid');
        this.ui.itemTooltip = document.getElementById('item-tooltip');
        this.ui.treasureArea = document.getElementById('treasure-area');
        this.ui.forgeArea = document.getElementById('forge-area');
        this.ui.mainContent = document.getElementById('main-content');
        this.ui.equipmentTextDisplay = {};
        this.ui.equipTooltip = document.getElementById('equip-tooltip');
        this.ui.statTooltip = document.getElementById('stat-tooltip');
        this.ui.statHealth = document.getElementById('stat-health-2');
        this.ui.statMaxHealth = document.getElementById('stat-max-health-2');
        this.ui.statAttack = document.getElementById('stat-attack-2');
        this.ui.statDefense = document.getElementById('stat-defense-2');
        this.ui.statSpeed = document.getElementById('stat-speed-2');
        this.ui.statGold = document.getElementById('stat-gold-2');
        this.ui.statRound = document.getElementById('stat-round');
        this.ui.combatPlayerHp = document.getElementById('combat-player-hp');
        this.ui.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.ui.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.ui.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.ui.combatEnemyBreathTimerContainer = document.querySelector('.enemy-side .breath-timer');
        this.ui.combatEnemyBreathTimerText = document.getElementById('combat-enemy-breath-timer');
        this.ui.combatEnemyBreathTimerBar = document.querySelector('.enemy-breath-timer');
        this.ui.combatEnemyStunTimerContainer = document.querySelector('.enemy-side .stun-timer');
        this.ui.combatEnemyStunTimerText = document.getElementById('combat-enemy-stun-timer');
        this.ui.combatEnemyStunTimerBar = document.querySelector('.enemy-stun-timer');
        this.ui.combatEnemySlimeTimerContainer = document.querySelector('.enemy-side .slime-timer');
        this.ui.shopItemsContainer = document.getElementById('shop-items');
        this.ui.shopRerollButton = document.getElementById('shop-reroll-button');
        this.ui.outputLogArea = document.getElementById('output-log-area');
        this.ui.outputLog = document.getElementById('output-log');
        this.ui.fishingArea = document.getElementById('fishing-area');
        this.ui.equipSlots = {
            helm: document.getElementById('equip-helm'),
            shield: document.getElementById('equip-shield'),
            body: document.getElementById('equip-body'),
            legs: document.getElementById('equip-legs'),
            ring: document.getElementById('equip-ring')
        };
        this.ui.combatPlayerAtk = document.getElementById('combat-player-atk');
        this.ui.combatPlayerDef = document.getElementById('combat-player-def');
        this.ui.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        this.ui.combatEnemyDef = document.getElementById('combat-enemy-def');
        this.ui.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        this.ui.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
        this.ui.combatPlayerSpd = document.getElementById('combat-player-spd');
        this.ui.combatEnemySpd = document.getElementById('combat-enemy-spd');
        this.ui.roundAreaElement = document.getElementById('round-area');
        this.ui.areaDescriptionElement = document.getElementById('area-description');
        this.ui.statDps = document.getElementById('stat-dps-2');
        this.ui.tooltipCache = { attack: new Map(), defense: new Map(), dps: new Map() };
        this.ui.weaponMerchantArea = document.getElementById('weapon-merchant-area');
        this.ui.shrineArea = document.getElementById('shrine-area');
        this.ui.treasureRoomArea = document.getElementById('treasure-room-area');

        this.cacheDynamicElements();
    }

    cacheDynamicElements() {
        this.ui.combatPlayerHp = document.getElementById('combat-player-hp');
        this.ui.combatEnemyHp = document.getElementById('combat-enemy-hp');
        this.ui.combatPlayerTimer = document.getElementById('combat-player-timer');
        this.ui.combatEnemyTimer = document.getElementById('combat-enemy-timer');
        this.ui.shopItemsContainer = document.getElementById('shop-items');
        this.ui.shopRerollButton = document.getElementById('shop-reroll-button');
        this.ui.equipmentTextDisplay = {}; 
        const equipmentDisplay = document.getElementById('equipment-text-display');
        if (equipmentDisplay) {
            const pElements = equipmentDisplay.querySelectorAll('p[data-slot]');
            pElements.forEach(pElement => {
                const slot = pElement.dataset.slot;
                if (slot) {
                    this.ui.equipmentTextDisplay[slot] = pElement;
                }
            });
        } else {
            console.error("Could not find #equipment-text-display to cache elements.");
        }

        this.ui.lootGold = document.getElementById('loot-gold');
        this.ui.lootItemsContainer = document.getElementById('loot-items');
        this.ui.lootTakeButton = document.getElementById('loot-take-button');
        if (this.ui.lootTakeButton && !this.ui.lootTakeButton.onclick) {
            this.ui.lootTakeButton.onclick = () => this.game.collectLoot();
        }

        this.ui.statHealth = document.getElementById('stat-health-2');
        this.ui.statMaxHealth = document.getElementById('stat-max-health-2');
        this.ui.statAttack = document.getElementById('stat-attack-2');
        this.ui.statDefense = document.getElementById('stat-defense-2');
        this.ui.statSpeed = document.getElementById('stat-speed-2');
        this.ui.statGold = document.getElementById('stat-gold-2');
        this.ui.statRound = document.getElementById('stat-round');
        if (!this.ui.inventoryArea) {
            this.ui.inventoryArea = document.getElementById('inventory-area');
            if (!this.ui.inventoryArea) {
                console.error("CRITICAL FAILURE: Could not find #inventory-area even in cacheDynamicElements.");
            }
        }

        this.ui.statHealthElement = document.getElementById('stat-health-2')?.closest('.stat-item');
        this.ui.statAttackElement = document.getElementById('stat-attack-2')?.closest('.stat-item');
        this.ui.statDefenseElement = document.getElementById('stat-defense-2')?.closest('.stat-item');
        this.ui.statSpeedElement = document.getElementById('stat-speed-2')?.closest('.stat-item');
        this.ui.statDpsElement = document.getElementById('stat-dps-2')?.closest('.stat-item');
        this.ui.statGoldElement = document.getElementById('stat-gold-2')?.closest('#inventory-header');
        this.ui.roundAreaElement = document.getElementById('round-area')?.querySelector('.stat-item');

        if (!this.ui.combatPlayerAtk) this.ui.combatPlayerAtk = document.getElementById('combat-player-atk');
        if (!this.ui.combatPlayerDef) this.ui.combatPlayerDef = document.getElementById('combat-player-def');
        if (!this.ui.combatEnemyAtk) this.ui.combatEnemyAtk = document.getElementById('combat-enemy-atk');
        if (!this.ui.combatEnemyDef) this.ui.combatEnemyDef = document.getElementById('combat-enemy-def');
        if (!this.ui.combatPlayerTimerContainer) this.ui.combatPlayerTimerContainer = document.querySelector('.player-side .attack-timer:not(.breath-timer)');
        if (!this.ui.combatEnemyTimerContainer) this.ui.combatEnemyTimerContainer = document.querySelector('.enemy-side .attack-timer:not(.breath-timer)');
        if (!this.ui.shrineArea) this.ui.shrineArea = document.getElementById('shrine-area');

        if (!this.ui.combatEnemySlimeTimerContainer) this.ui.combatEnemySlimeTimerContainer = document.querySelector('.enemy-side .slime-timer');
        if (!this.ui.combatEnemyFormSwitchTimerContainer) this.ui.combatEnemyFormSwitchTimerContainer = document.querySelector('.enemy-side .form-switch-timer');
        if (!this.ui.combatEnemyFormSwitchTimerText) this.ui.combatEnemyFormSwitchTimerText = document.getElementById('combat-enemy-form-switch-timer');
        if (!this.ui.combatEnemyFormSwitchTimerBar) this.ui.combatEnemyFormSwitchTimerBar = document.querySelector('.enemy-form-switch-timer');
    }

    clearMainArea() {
        this.ui.choicesArea.innerHTML = '';
        this.ui.choicesArea.classList.add('hidden');
        this.ui.combatArea?.classList.add('hidden');
        this.ui.combatArea?.classList.remove('combat-ending');
        this.ui.shopArea?.classList.add('hidden');
        this.ui.restArea?.classList.add('hidden');
        this.ui.lootArea?.classList.add('hidden');
        this.ui.fishingArea?.classList.add('hidden');
        this.ui.outputLogArea?.classList.add('hidden');
        this.ui.treasureArea?.classList.add('hidden');
        this.ui.forgeArea?.classList.add('hidden');
        this.ui.weaponMerchantArea?.classList.add('hidden');
        this.ui.shrineArea?.classList.add('hidden');
        document.getElementById('trap-area')?.classList.add('hidden');
        document.getElementById('blacksmith-area')?.remove();
        document.getElementById('sharpen-area')?.remove();
        document.getElementById('armourer-area')?.remove();
        document.getElementById('alchemist-area')?.remove();
        document.getElementById('starting-pack-area')?.remove();
        document.getElementById('area-transition-screen')?.remove();
        this.ui.treasureRoomArea?.classList.add('hidden');
        this.cacheDynamicElements();
    }
}
