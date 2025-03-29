// js/player.js

class Player {
    constructor() {
        this.gold = 0;
        this.maxHealth = 20;
        this.health = 20;
        this.baseAttack = 100; // Base stats, can be increased by effects later
        this.baseDefense = 0;
        this.inventory = new Array(12).fill(null); // 12 slots
        this.equipment = {
            helm: null,
            body: null,
            legs: null,
            weapon: null,
            shield: null
        };

        // For combat timing
        this.attackTimer = 0;
        this.pendingActionDelay = 0; // Delay added by actions like eating
        this.defaultAttackSpeed = 0.5;
    }

    getAttack() {
        let totalAttack = this.baseAttack;
        if (this.equipment.weapon && this.equipment.weapon.stats?.attack) {
            totalAttack += this.equipment.weapon.stats.attack;
        }
        return totalAttack;
    }

    getAttackSpeed() {
        // Base speed could be a stat later, default to weapon speed or a fallback
        return this.equipment.weapon?.speed ?? this.defaultAttackSpeed; // Default 2s if no weapon
    }


    getDefense() {
        let totalDefense = this.baseDefense;
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


        // Unequip current item in that slot (if any)
        const currentItem = this.equipment[slot];
        let unequippedItem = null;
        if (currentItem) {
            const freeSlotIndex = this.findFreeInventorySlot();
            if (freeSlotIndex === -1 && index !== freeSlotIndex) { // Make sure we don't need the slot we are equipping *from* if it's the only free one
                // Check if the item we are equipping *from* is the only free slot needed
                let needsCurrentSlot = true;
                for (let i = 0; i < this.inventory.length; ++i) {
                    if (i !== index && this.inventory[i] === null) {
                        needsCurrentSlot = false;
                        break;
                    }
                }
                if (needsCurrentSlot) {
                    return { success: false, message: "Inventory full, cannot unequip current item." };
                }
            }
            // If we got here, either there's another free slot, or the slot we're equipping from is free
            this.inventory[index] = currentItem; // Put old item back first
            unequippedItem = currentItem;
        } else {
            this.inventory[index] = null; // Clear the inventory slot
        }

        // Equip the new item
        this.equipment[slot] = itemToEquip;

        return { success: true, item: itemToEquip, unequipped: unequippedItem };
    }

    // Unequips item from a specific equipment slot
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

        return { success: false, message: "This item cannot be used like that." };
    }
}