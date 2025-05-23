class Player {
    constructor() {
        this.gold = 0;
        this.maxHealth = 10;
        this.health = 10;
        this.baseAttack = 1;
        this.baseDefense = 1;
        this.inventory = new Array(18).fill(null);
        this.equipment = {
            helm: null,
            body: null,
            legs: null,
            weapon: null,
            shield: null,
            ring: null
        };
        this.attackTimer = 0;
        this.pendingActionDelay = 0;
        this.defaultAttackSpeed = 2.0;
        this.tempAttack = 0;
        this.tempDefense = 0;
        this.tempSpeedReduction = 0;
        this.shrineAttackIncrease = 0;
        this.shrineDefenseIncrease = 0;
        this.shrineSpeedReduction = 0;
        this.healOverTimeEffects = [];
        this.activeEffects = {};
        this.isStunned = false;
        this.slimedItems = {};
    }

    getMaxHealth() {
        let totalMaxHealth = this.maxHealth;
        Object.values(this.equipment).forEach(index => {
            if (index !== null && this.inventory[index]?.stats?.maxHealth) {
                totalMaxHealth += this.inventory[index].stats.maxHealth;
            }
        });
        return totalMaxHealth;
    }

    getAttack() {
        let totalAttack = this.baseAttack + this.tempAttack;
        const weaponIndex = this.equipment.weapon;
        if (weaponIndex !== null && this.inventory[weaponIndex]?.stats?.attack) {
            totalAttack += this.inventory[weaponIndex].stats.attack;
        }
        const ringIndex = this.equipment.ring;
        if (ringIndex !== null && this.inventory[ringIndex]?.stats?.attack) {
            totalAttack += this.inventory[ringIndex].stats.attack;
        }
        return totalAttack;
    }

    getAttackSpeed() {
        const weaponIndex = this.equipment.weapon;
        let baseSpeed = weaponIndex !== null ? (this.inventory[weaponIndex]?.speed ?? this.defaultAttackSpeed) : this.defaultAttackSpeed;
        if(this.equipment.ring != null && this.inventory[this.equipment.ring]?.stats?.speedBonus) {
            baseSpeed = baseSpeed - this.inventory[this.equipment.ring].stats.speedBonus;
        }
        let totalSpeedReduction = this.tempSpeedReduction;
        const ringIndex = this.equipment.ring;
        if (ringIndex !== null && this.inventory[ringIndex]?.stats?.speedReduction) {
            totalSpeedReduction += this.inventory[ringIndex].stats.speedReduction;
        }
        if (this.shrineSpeedReduction) {
            totalSpeedReduction += this.shrineSpeedReduction;
        }

        return Math.max(0.5, baseSpeed - totalSpeedReduction);
    }

    getDefense() {
        let totalDefense = this.baseDefense + this.tempDefense;
        Object.values(this.equipment).forEach(index => {
            if (index !== null && this.inventory[index]?.stats?.defense) {
                totalDefense += this.inventory[index].stats.defense;
            }
        });
        return totalDefense;
    }

    // --- Added Getters for Temporary Bonuses ---
    getTempAttackBonus() {
        return this.tempAttack;
    }

    getTempDefenseBonus() {
        return this.tempDefense;
    }
    // -----------------------------------------

    takeDamage(amount) {
        const defenseRoll = game.rollDamage(this.getDefense());
        const actualBlocked = Math.min(amount, defenseRoll);
        const actualDamage = Math.max(0, amount - actualBlocked);
        this.health = Math.max(0, this.health - actualDamage);
        return { actualDamage, actualBlocked, isDead: this.health <= 0 };
    }

    takeRawDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    heal(amount) {
        if (this.health == 0) return 0;
        const maxHealth = this.getMaxHealth();
        const healedAmount = Math.min(amount, maxHealth - this.health);
        this.health = Math.min(maxHealth, this.health + amount);
        return healedAmount;
    }

    addGold(amount) {
        this.gold += amount;
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    findFreeInventorySlot() {
        return this.inventory.findIndex(slot => slot === null);
    }

    addItem(item) {
        const freeSlotIndex = this.findFreeInventorySlot();
        if (freeSlotIndex !== -1) {
            this.inventory[freeSlotIndex] = item;
            return true;
        }
        return false;
    }

    removeItem(index) {
        if (index >= 0 && index < this.inventory.length && this.inventory[index]) {
            const item = this.inventory[index];
            this.unequipItem(index);
            this.inventory[index] = null;
            return item;
        }
        return null;
    }

    equipItem(index) {
        if (index < 0 || index >= this.inventory.length || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory slot." };
        }

        const itemToEquip = this.inventory[index];
        if (itemToEquip.type !== 'weapon' && itemToEquip.type !== 'armor' && itemToEquip.type !== 'ring') {
            return { success: false, message: "Cannot equip this item type." };
        }

        const slot = itemToEquip.slot;
        if (!slot || !this.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "Item cannot be equipped in any slot." };
        }

        // Handle unequipping shield if equipping 2H weapon
        if (itemToEquip.type === 'weapon' && itemToEquip.hands === 2 && this.equipment.shield !== null) {
            const shieldIndex = this.equipment.shield;
            const unequipResult = this.unequipItem(shieldIndex);
            if (!unequipResult.success) {
                return { success: false, message: "Could not unequip shield to equip 2H weapon (should not happen unless logic error)." };
            }
            game?.addLog(`Unequipped ${this.inventory[shieldIndex]?.name} to equip 2H weapon.`);
        }
        // Handle unequipping 2H weapon if equipping shield
        if (itemToEquip.slot === 'shield' && this.equipment.weapon !== null && this.inventory[this.equipment.weapon]?.hands === 2) {
            const weaponIndex = this.equipment.weapon;
            const unequipResult = this.unequipItem(weaponIndex);
            if (!unequipResult.success) {
                return { success: false, message: "Could not unequip 2H weapon to equip shield (should not happen unless logic error)." };
            }
            game?.addLog(`Unequipped ${this.inventory[weaponIndex]?.name} to equip shield.`);
        }

        const currentlyEquippedIndex = this.equipment[slot];

        if (currentlyEquippedIndex !== null && currentlyEquippedIndex !== index) {
            const unequipResult = this.unequipItem(currentlyEquippedIndex);
            if (!unequipResult.success) {
                return { success: false, message: "Could not unequip the previous item (should not happen unless logic error)." };
            }
        }

        this.equipment[slot] = index;
        return { success: true, item: itemToEquip, previouslyEquippedIndex: currentlyEquippedIndex };
    }

    unequipItem(index) {
        if (index < 0 || index >= this.inventory.length || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory index." };
        }

        let foundSlot = null;
        for (const slotName in this.equipment) {
            if (this.equipment[slotName] === index) {
                foundSlot = slotName;
                break;
            }
        }

        if (!foundSlot) {
            return { success: false, message: "Item is not equipped." };
        }

        const item = this.inventory[index];
        this.equipment[foundSlot] = null;
        return { success: true, item: item, slot: foundSlot };
    }

    useItem(index) {
        if (index < 0 || index >= this.inventory.length || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory slot." };
        }
        const item = this.inventory[index];

        if (this.isStunned && item.useAction === 'Eat' && game && game.state === 'combat') {
            return { success: false, message: "You are stunned and cannot eat!" };
        }

        if (item.type === 'consumable' && item.healAmount) {
            const healed = this.heal(item.healAmount);
            if (healed > 0 || item.healAmount === 0) {
                this.inventory[index] = null;
                let delay = item.isPotion ? 0 : 2.0;
                return { success: true, message: `You ${item.useAction || 'use'} ${item.name}. Healed ${healed} HP.`, item: item, actionDelay: delay, healedAmount: healed };
            } else {
                this.inventory[index] = null;
                let delay = item.isPotion ? 0 : 2.0;
                return { success: true, message: `You ${item.useAction || 'use'} ${item.name}, but were already full health.`, item: item, actionDelay: delay, healedAmount: 0 };
            }
        }

        if (item.type === 'consumable') {
            // Handle Heal Over Time Potions FIRST
            if (item.healOverTime) {
                const hotData = item.healOverTime;
                this.healOverTimeEffects.push({
                    timeLeft: hotData.duration,
                    duration: hotData.duration,
                    heal: hotData.heal,
                    interval: hotData.interval,
                    tickCooldown: hotData.interval
                });
                this.inventory[index] = null;
                return {
                    success: true,
                    message: `Used ${item.name}. Started healing.`, item: item,
                    actionDelay: item.isPotion ? 0 : 2.0,
                    item: item
                };
            }

            // Handle Stat-Boosting Potions
            if (item.stats) {
                let buffType = null;
                let buffAmount = 0;

                if (item.stats.tempAttack) {
                    buffType = 'attack';
                    buffAmount = item.stats.tempAttack;
                }
                if (item.stats.tempDefense) {
                    buffType = 'defense';
                    buffAmount = item.stats.tempDefense;
                }
                if (item.stats.tempSpeed) {
                    buffType = 'speed';
                    buffAmount = item.stats.tempSpeed;
                }

                if (item.stats.tempAttack) this.tempAttack += item.stats.tempAttack;
                if (item.stats.tempDefense) this.tempDefense += item.stats.tempDefense;
                if (item.stats.tempSpeed) this.tempSpeedReduction += item.stats.tempSpeed;

                this.inventory[index] = null;
                return {
                    success: true,
                    message: `Used ${item.name}. Buff applied!`, item: item,
                    actionDelay: item.isPotion ? 0 : 2.0,
                    buffType: buffType,
                    buffAmount: buffAmount
                };
            }
        }

        return { success: false, message: "This item cannot be used like that." };
    }

    resetCombatBuffs() {
        this.tempAttack = 0;
        this.tempDefense = 0;
        this.tempSpeedReduction = 0;
        this.activeEffects = {};
        this.isStunned = false;
    }
}