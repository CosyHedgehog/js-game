const CONFIG = {
    shop: {
        NUM_ITEMS: 3,
        REROLL_COST: 3,
        MARKUP: 1.3,
        MARKUP_VARIANCE: 0.2
    },
    alchemist: {
        MARKUP: 2.5,
        POTION_TIERS: {
            common: { chance: 0.8 },
            rare: { chance: 0.4 },
            special: { chance: 0.3 }
        }
    },
    combat: {
        TICK_RATE: 100,
        MIN_ATTACK_SPEED: 0.5,
        FOOD_DELAY: 2.0
    },
    player: {
        initial: {
            gold: 150,
            health: 20,
            baseAttack: 1,
            baseDefense: 1,
            inventorySize: 15,
            defaultAttackSpeed: 2.0
        },
        equipment: {
            slots: ['helm', 'body', 'legs', 'weapon', 'shield', 'ring'],
            defaultSpeed: 2.0,
            minAttackSpeed: 0.5,
            foodDelay: 2.0
        },
        inventory: {
            size: 15,
            maxLogSize: 50
        }
    },
    // ... other config settings
}; 