class Player {
    constructor() {
        this.gold = 0;
        this.maxHealth = 20;
        this.health = 10;
        this.baseAttack = 1; // Base stats, can be increased by effects later
        this.baseDefense = 1; // Changed from 0 to 1
        this.inventory = new Array(15).fill(null); // Changed from 12 to 15 slots
        this.equipment = {
            helm: null,
            body: null,
            legs: null,
            weapon: null,
            shield: null,
            ring: null  // Added ring slot
        };

        this.attackTimer = 0;
        this.pendingActionDelay = 0; // Delay added by actions like eating
        this.defaultAttackSpeed = 2.0; // Changed from 0.5 to 2.0 seconds for better balance

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
        return Math.max(0.5, baseSpeed - this.tempSpeedReduction); // Minimum 0.5s attack speed
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
        return false; // Inventory full
    }

    removeItem(index) {
        if (index >= 0 && index < this.inventory.length && this.inventory[index]) {
            const item = this.inventory[index];
            this.inventory[index] = null;
            return item; // Return the removed item
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

        // Handle 2-handed weapon constraint
        if (itemToEquip.type === 'weapon' && itemToEquip.hands === 2 && this.equipment.shield) {
            if (!this.unequipItem('shield')) { // Try to unequip shield first
                return { success: false, message: "Inventory full, cannot unequip shield for 2H weapon." };
            }
        }
        // Handle equipping shield when 2-handed weapon is equipped
        if (itemToEquip.slot === 'shield' && this.equipment.weapon?.hands === 2) {
            return { success: false, message: "Cannot equip shield with a 2-handed weapon." };
        }

        // Get current equipped item in that slot
        const currentItem = this.equipment[slot];

        // If we're replacing an item of the same type, we don't need an extra inventory slot
        if (currentItem) {
            // Just swap the items
            this.inventory[index] = currentItem;
            this.equipment[slot] = itemToEquip;
            return { success: true, item: itemToEquip, unequipped: currentItem };
        } else {
            // We're equipping to an empty slot, just move the item from inventory to equipment
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
            if (healed > 0 || item.healAmount === 0) { // Allow using 0-heal items if needed later
                this.inventory[index] = null; // Consume the item
                let delay = 0;
                if (!item.isPotion) { // Potions don't delay attack
                    delay = 2.0; // Food delays attack by 2 seconds
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