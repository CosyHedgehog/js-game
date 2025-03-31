class Player {
    constructor() {
        this.gold = 100;
        this.maxHealth = 20;
        this.health = 10;
        this.baseAttack = 1;
        this.baseDefense = 1;
        this.inventory = new Array(15).fill(null);
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
    }

    getAttack() {
        let totalAttack = this.baseAttack + this.tempAttack;
        if (this.equipment.weapon && this.equipment.weapon.stats?.attack) {
            totalAttack += this.equipment.weapon.stats.attack;
        }
        return totalAttack;
    }

    getAttackSpeed() {
        const baseSpeed = this.equipment.weapon?.speed ?? this.defaultAttackSpeed;
        return Math.max(0.5, baseSpeed - this.tempSpeedReduction);
    }

    getDefense() {
        let totalDefense = this.baseDefense + this.tempDefense;
        for (const slot in this.equipment) {
            if (this.equipment[slot] && this.equipment[slot].stats?.defense) {
                totalDefense += this.equipment[slot].stats.defense;
            }
        }
        return totalDefense;
    }

    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.getDefense());
        this.health = Math.max(0, this.health - actualDamage);
        return { actualDamage, isDead: this.health <= 0 };
    }

    takeRawDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    heal(amount) {
        const healedAmount = Math.min(amount, this.maxHealth - this.health);
        this.health = Math.min(this.maxHealth, this.health + amount);
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
        if (itemToEquip.type !== 'weapon' && itemToEquip.type !== 'armor') {
            return { success: false, message: "Cannot equip this item type." };
        }

        const slot = itemToEquip.slot;
        if (!slot || !this.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "Item cannot be equipped in any slot." };
        }

        if (itemToEquip.type === 'weapon' && itemToEquip.hands === 2 && this.equipment.shield) {
            if (!this.unequipItem('shield')) {
                return { success: false, message: "Inventory full, cannot unequip shield for 2H weapon." };
            }
        }
        if (itemToEquip.slot === 'shield' && this.equipment.weapon?.hands === 2) {
            return { success: false, message: "Cannot equip shield with a 2-handed weapon." };
        }
        const currentItem = this.equipment[slot];
        if (currentItem) {
            this.inventory[index] = currentItem;
            this.equipment[slot] = itemToEquip;
            return { success: true, item: itemToEquip, unequipped: currentItem };
        } else {
            this.inventory[index] = null;
            this.equipment[slot] = itemToEquip;
            return { success: true, item: itemToEquip };
        }
    }

    unequipItem(slot) {
        if (!this.equipment[slot]) {
            return { success: false, message: "No item equipped in that slot." };
        }

        const itemToUnequip = this.equipment[slot];
        const freeSlotIndex = this.findFreeInventorySlot();

        if (freeSlotIndex === -1) {
            return { success: false, message: "Inventory full, cannot unequip item." };
        }

        this.inventory[freeSlotIndex] = itemToUnequip;
        this.equipment[slot] = null;

        return { success: true, item: itemToUnequip };
    }

    useItem(index) {
        if (index < 0 || index >= this.inventory.length || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory slot." };
        }
        const item = this.inventory[index];

        if (item.type === 'consumable' && item.healAmount) {
            const healed = this.heal(item.healAmount);
            if (healed > 0 || item.healAmount === 0) {
                this.inventory[index] = null;
                let delay = 0;
                if (!item.isPotion) {
                    delay = 2.0;
                }
                return { success: true, message: `You ${item.useAction || 'use'} ${item.name}. Healed ${healed} HP.`, item: item, actionDelay: delay };
            } else {
                return { success: false, message: "Health is already full." };
            }
        }

        if (item.type === 'consumable') {
            if (item.stats) {
                if (item.stats.tempAttack) this.tempAttack += item.stats.tempAttack;
                if (item.stats.tempDefense) this.tempDefense += item.stats.tempDefense;
                if (item.stats.tempSpeed) this.tempSpeedReduction += item.stats.tempSpeed;
                
                let buffMessage = `Used ${item.name}.`;
                if (item.stats.tempAttack) buffMessage += ` Attack +${item.stats.tempAttack}`;
                if (item.stats.tempDefense) buffMessage += ` Defense +${item.stats.tempDefense}`;
                if (item.stats.tempSpeed) buffMessage += ` Speed +${item.stats.tempSpeed}s`;
                
                this.inventory[index] = null;
                return { success: true, message: buffMessage, item: item, actionDelay: item.isPotion ? 0 : 2.0 };
            }
        }

        return { success: false, message: "This item cannot be used like that." };
    }

    resetCombatBuffs() {
        this.tempAttack = 0;
        this.tempDefense = 0;
        this.tempSpeedReduction = 0;
    }
}