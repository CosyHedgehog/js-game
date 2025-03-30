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
    // ... other config settings
}; 