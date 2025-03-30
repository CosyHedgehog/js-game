class Player {
    constructor() {
        // Base stats
        this.gold = CONFIG.player.initial.gold;
        this.maxHealth = CONFIG.player.initial.health;
        this.health = CONFIG.player.initial.health;
        this.baseAttack = CONFIG.player.initial.baseAttack;
        this.baseDefense = CONFIG.player.initial.baseDefense;

        // Initialize inventory
        this.inventory = new Array(CONFIG.player.inventory.size).fill(null);
        
        // Initialize equipment slots
        this.equipment = {};
        CONFIG.player.equipment.slots.forEach(slot => {
            this.equipment[slot] = null;
        });

        // Combat timers and buffs
        this.attackTimer = 0;
        this.pendingActionDelay = 0;
        this.defaultAttackSpeed = CONFIG.player.equipment.defaultSpeed;

        // Temporary combat buffs
        this.tempStats = {
            attack: 0,
            defense: 0,
            speedReduction: 0
        };
    }

    // --- Stat Calculations ---
    getAttack() {
        let totalAttack = this.baseAttack + this.tempStats.attack;
        
        // Add equipment bonuses
        if (this.equipment.weapon?.stats?.attack) {
            totalAttack += this.equipment.weapon.stats.attack;
        }
        if (this.equipment.ring?.stats?.attack) {
            totalAttack += this.equipment.ring.stats.attack;
        }
        
        return totalAttack;
    }

    getAttackSpeed() {
        const baseSpeed = this.equipment.weapon?.speed ?? this.defaultAttackSpeed;
        return Math.max(
            CONFIG.player.equipment.minAttackSpeed, 
            baseSpeed - this.tempStats.speedReduction
        );
    }

    getDefense() {
        let totalDefense = this.baseDefense + this.tempStats.defense;
        
        // Add all equipment defense bonuses
        Object.values(this.equipment).forEach(item => {
            if (item?.stats?.defense) {
                totalDefense += item.stats.defense;
            }
        });
        
        return totalDefense;
    }

    // --- Health Management ---
    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.getDefense());
        this.health = Math.max(0, this.health - actualDamage);
        return { actualDamage, isDead: this.health <= 0 };
    }

    heal(amount) {
        const healedAmount = Math.min(amount, this.maxHealth - this.health);
        this.health = Math.min(this.maxHealth, this.health + amount);
        return healedAmount;
    }

    // --- Gold Management ---
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

    // --- Inventory Management ---
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
        if (this._isValidInventoryIndex(index) && this.inventory[index]) {
            const item = this.inventory[index];
            this.inventory[index] = null;
            return item;
        }
        return null;
    }

    // --- Equipment Management ---
    equipItem(index) {
        if (!this._isValidInventoryIndex(index) || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory slot." };
        }

        const itemToEquip = this.inventory[index];
        if (!this._isEquippableItem(itemToEquip)) {
            return { success: false, message: "Cannot equip this item type." };
        }

        return this._handleEquipItem(index, itemToEquip);
    }

    unequipItem(slot) {
        if (!this.equipment[slot]) {
            return { success: false, message: "No item equipped in that slot." };
        }

        const freeSlotIndex = this.findFreeInventorySlot();
        if (freeSlotIndex === -1) {
            return { success: false, message: "Inventory full, cannot unequip item." };
        }

        const itemToUnequip = this.equipment[slot];
        this.inventory[freeSlotIndex] = itemToUnequip;
        this.equipment[slot] = null;

        return { success: true, item: itemToUnequip };
    }

    // --- Item Usage ---
    useItem(index) {
        if (!this._isValidInventoryIndex(index) || !this.inventory[index]) {
            return { success: false, message: "Invalid inventory slot." };
        }

        const item = this.inventory[index];
        
        if (item.type === 'consumable') {
            return this._handleConsumableUse(index, item);
        }

        return { success: false, message: "This item cannot be used like that." };
    }

    // --- Combat State Management ---
    resetCombatBuffs() {
        this.tempStats = {
            attack: 0,
            defense: 0,
            speedReduction: 0
        };
    }

    // --- Private Helper Methods ---
    _isValidInventoryIndex(index) {
        return index >= 0 && index < this.inventory.length;
    }

    _isEquippableItem(item) {
        return item.type === 'weapon' || item.type === 'armor';
    }

    _handleEquipItem(index, itemToEquip) {
        const slot = itemToEquip.slot;
        
        // Handle 2-handed weapon constraints
        if (this._shouldUnequipShieldFor2H(itemToEquip)) {
            if (!this.unequipItem('shield').success) {
                return { success: false, message: "Inventory full, cannot unequip shield for 2H weapon." };
            }
        }

        // Handle shield with 2H weapon
        if (this._isShieldWith2HWeapon(itemToEquip)) {
            return { success: false, message: "Cannot equip shield with a 2-handed weapon." };
        }

        // Handle the actual equipping
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

    _handleConsumableUse(index, item) {
        if (item.healAmount) {
            return this._handleHealingItem(index, item);
        }
        if (item.stats) {
            return this._handleBuffItem(index, item);
        }
        return { success: false, message: "This item has no effect." };
    }

    _handleHealingItem(index, item) {
        const healed = this.heal(item.healAmount);
        if (healed > 0 || item.healAmount === 0) {
            this.inventory[index] = null;
            const delay = item.isPotion ? 0 : CONFIG.player.equipment.foodDelay;
            return {
                success: true,
                message: `You ${item.useAction || 'use'} ${item.name}. Healed ${healed} HP.`,
                item: item,
                actionDelay: delay
            };
        }
        return { success: false, message: "Health is already full." };
    }

    _handleBuffItem(index, item) {
        Object.entries(item.stats).forEach(([stat, value]) => {
            if (stat === 'tempAttack') this.tempStats.attack += value;
            if (stat === 'tempDefense') this.tempStats.defense += value;
            if (stat === 'tempSpeed') this.tempStats.speedReduction += value;
        });

        this.inventory[index] = null;
        return {
            success: true,
            message: this._getBuffMessage(item),
            item: item,
            actionDelay: item.isPotion ? 0 : CONFIG.player.equipment.foodDelay
        };
    }

    _getBuffMessage(item) {
        const buffs = [];
        if (item.stats.tempAttack) buffs.push(`Attack +${item.stats.tempAttack}`);
        if (item.stats.tempDefense) buffs.push(`Defense +${item.stats.tempDefense}`);
        if (item.stats.tempSpeed) buffs.push(`Speed +${item.stats.tempSpeed}s`);
        return `Used ${item.name}. ${buffs.join(', ')}`;
    }

    _shouldUnequipShieldFor2H(item) {
        return item.type === 'weapon' && item.hands === 2 && this.equipment.shield;
    }

    _isShieldWith2HWeapon(item) {
        return item.slot === 'shield' && this.equipment.weapon?.hands === 2;
    }
}