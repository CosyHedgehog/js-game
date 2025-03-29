// js/combat.js

class Combat {
    constructor(player, enemy, game, ui) {
        this.player = player;
        this.enemy = { // Create a combat instance of the enemy
            ...enemy, // Copy base stats
            health: enemy.health, // Ensure current health is set
            maxHealth: enemy.health,
            attackTimer: 0,
        };
        this.game = game; // Reference to the main game logic
        this.ui = ui;     // Reference to the UI manager
        this.intervalId = null;
        this.tickRate = 500; // milliseconds (0.5 seconds)
        this.timeScale = this.tickRate / 1000; // 0.5
        this.isPlayerTurn = false; // Used if simultaneous attacks aren't desired
        this.isEnemyTurn = false;

        this.player.attackTimer = 0; // Reset timers at start of combat
        this.enemy.attackTimer = 0;
        this.player.pendingActionDelay = 0; // Reset action delay
    }

    start() {
        this.game.addLog(`Combat started: Player vs ${this.enemy.name}!`);
        this.ui.showCombatUI(this.player, this.enemy);
        this.player.attackTimer = this.player.getAttackSpeed(); // Initial delay before first attack
        this.enemy.attackTimer = this.enemy.speed;

        this.intervalId = setInterval(() => this.tick(), this.tickRate);
    }

    tick() {
        let playerActed = false;
        let enemyActed = false;

        // Decrement timers
        this.player.attackTimer = Math.max(0, this.player.attackTimer - this.timeScale);
        this.enemy.attackTimer = Math.max(0, this.enemy.attackTimer - this.timeScale);

        // Update UI timers
        this.ui.updateCombatTimers(this.player.attackTimer, this.enemy.attackTimer);

        // Check if player can attack
        if (this.player.attackTimer <= 0) {
            this.playerAttack();
            playerActed = true;
            // Apply pending delay AFTER attacking, then reset timer
            this.player.attackTimer = this.player.getAttackSpeed() + this.player.pendingActionDelay;
            this.player.pendingActionDelay = 0; // Reset delay after applying it
            if (this.checkCombatEnd()) return; // Check if enemy died
        }

        // Check if enemy can attack
        if (this.enemy.attackTimer <= 0) {
            this.enemyAttack();
            enemyActed = true;
            this.enemy.attackTimer = this.enemy.speed; // Reset timer
            if (this.checkCombatEnd()) return; // Check if player died
        }
    }

    playerAttack() {
        const playerAttackRoll = rollDamage(this.player.getAttack());
        const enemyDefense = this.enemy.defense || 0;
        const damageDealt = Math.max(0, playerAttackRoll - enemyDefense);
        this.enemy.health = Math.max(0, this.enemy.health - damageDealt);
        this.game.addLog(`You attack ${this.enemy.name} for ${damageDealt} damage. (${playerAttackRoll} - ${enemyDefense})`);
        this.ui.updateCombatantHealth('enemy', this.enemy.health, this.enemy.maxHealth);
    }

    enemyAttack() {
        const enemyAttackRoll = rollDamage(this.enemy.attack);
        const playerDefense = this.player.getDefense();
        const damageResult = this.player.takeDamage(enemyAttackRoll); // Use player's method
        this.game.addLog(`${this.enemy.name} attacks you for ${damageResult.actualDamage} damage. (${enemyAttackRoll} - ${playerDefense})`);
        this.ui.updateCombatantHealth('player', this.player.health, this.player.maxHealth);
        this.ui.updatePlayerStats(); // Update sidebar stats as well
    }

    // Call this when player uses an item during combat
    handlePlayerItemUse(useResult) {
        if (useResult.success) {
            this.game.addLog(useResult.message);
            if (useResult.actionDelay > 0) {
                this.player.pendingActionDelay += useResult.actionDelay; // Add delay to next attack
                this.game.addLog(`Your next attack is delayed by ${useResult.actionDelay}s!`);
            }
            // Update health display immediately if healed
            if (useResult.item?.healAmount) {
                this.ui.updateCombatantHealth('player', this.player.health, this.player.maxHealth);
                this.ui.updatePlayerStats();
            }
            this.ui.renderInventory(); // Re-render inv since item was consumed
            this.ui.hideContextMenu(); // Hide menu after use
        } else {
            this.game.addLog(useResult.message); // Log failure (e.g., health full)
        }
    }

    checkCombatEnd() {
        let combatEnded = false;
        let playerWon = false;

        if (this.enemy.health <= 0) {
            this.game.addLog(`You defeated the ${this.enemy.name}!`);
            combatEnded = true;
            playerWon = true;
        } else if (this.player.health <= 0) {
            this.game.addLog(`You were defeated by the ${this.enemy.name}...`);
            combatEnded = true;
            playerWon = false;
        }

        if (combatEnded) {
            this.endCombat(playerWon);
        }
        return combatEnded;
    }

    endCombat(playerWon) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.ui.hideCombatUI();

        if (playerWon) {
            this.game.addLog(`You defeated the ${this.enemy.name}!`);

            // Calculate Loot
            const goldDropped = getRandomInt(this.enemy.goldDrop[0], this.enemy.goldDrop[1]);
            const droppedItems = [];
            if (this.enemy.lootTable && this.enemy.lootTable.length > 0) {
                this.enemy.lootTable.forEach(loot => {
                    if (Math.random() < loot.chance) {
                        const item = createItem(loot.itemId);
                        if (item) {
                            item.selected = true;
                            droppedItems.push(item);
                        }
                    }
                });
            }

            // --- Store defeated enemy name BEFORE state transition ---
            const defeatedName = this.enemy.name; // Store locally first
            this.game.lastDefeatedEnemyName = defeatedName; // Store on game object
            // ---

            if (goldDropped > 0 || droppedItems.length > 0) {
                // Enter loot state, which will handle proceeding later
                this.game.enterLootState(goldDropped, droppedItems);
            } else {
                // No loot, proceed directly using the helper
                this.game.addLog("The enemy dropped nothing.");
                this.checkBossWinAndProceed(); // This checks boss/proceeds
            }

        } else {
            // Player lost
            this.game.addLog(`You were defeated by the ${this.enemy.name}...`);
            this.game.endGame(false);
        }
    }

    // Helper function to avoid code duplication
    checkBossWinAndProceed() {
        // If boss was defeated, trigger win condition
        if (this.enemy.name === MONSTERS[FINAL_BOSS]?.name) { // Added safety check
            this.game.endGame(true); // Player wins
        } else {
            this.game.proceedToNextRound(); // Go to next round choice/boss
        }
    }

    checkBossWinAndProceed() {
        // Use the stored name from the game object
        const defeatedName = this.game.lastDefeatedEnemyName;
        this.game.lastDefeatedEnemyName = null; // Clear the temporary name

        const isBossDefeated = defeatedName && MONSTERS[FINAL_BOSS] && defeatedName === MONSTERS[FINAL_BOSS].name;

        if (isBossDefeated) {
            console.log("checkBossWinAndProceed: Boss detected, calling endGame(true).");
            this.game.endGame(true); // Player wins
        } else {
            console.log("checkBossWinAndProceed: Not boss, calling proceedToNextRound().");
            this.game.proceedToNextRound(); // Go to next round
        }
    }
}