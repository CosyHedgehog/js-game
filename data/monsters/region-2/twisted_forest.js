const TWISTED_FOREST_MONSTER_DATA = {
    'mountain_goat': {
        name: 'Mountain Goat', 
        health: 18, 
        attack: 2, 
        defense: 2, 
        speed: 1.6, 
        goldDrop: [2, 5],
        difficulty: 'easy',
        description: "A sturdy goat navigating the steep hills.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.70 },
            { itemTier: 'uncommonItem', chance: 0.40 },
        ]
    },
    'mountain_lion': {
        name: 'Mountain Lion', 
        health: 20, 
        attack: 3, 
        defense: 1, 
        speed: 1.4, 
        goldDrop: [4, 11],
        difficulty: 'medium',
        description: "A sleek predator stalking the rocky terrain.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'uncommonItem', chance: 0.70 },
        ]
    },
    'thornroot': {
        name: 'Thornroot',
        icon: '🌳',
        health: 50, 
        attack: 4, 
        defense: 5, 
        speed: 3.0,
        goldDrop: [5, 15],
        isMiniBoss: true,
        description: "A massive tree-like creature, its form shifting between thorny defense and resilient regeneration.",
        hasFormSwitching: true,
        formSwitchInterval: 15,
        initialForm: 'thorns',
        hasThorns: true,
        thornsDamage: 2,
        hasRegeneration: true,
        regenerationAmount: 1,
        mechanicTooltips: {
            thorns: "Thorns: Reflects 2 damage per attack.",
            regenerate: "Regenerating: Heals 1 health per second."
        },
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.10 },
            { itemTier: 'uncommonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.60 },

        ]
    },
}; 