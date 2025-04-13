const TWISTED_FOREST_MONSTER_DATA = {
    'Ent': {
        name: 'Ent',
        icon: '🌳',
        health: 50, 
        attack: 0, 
        defense: 0, 
        speed: 55,
        goldDrop: [5, 15],
        isMiniBoss: true,
        description: "A massive tree-like creature, its form shifting between thorny defense and resilient regeneration.",
        mechanics: "Ents have two forms: Regenerate and Thorny. In Regenerate form, they heal for 1 health per second. In Thorny form, they deal 2 damage per attack.",
        hasFormSwitching: true,
        formSwitchInterval: 15,
        initialForm: 'thorns',
        hasThorns: true,
        thornsDamage: 2,
        hasRegeneration: true,
        regenerationAmount: 1,
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.10 },
            { itemTier: 'uncommonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.60 },

        ]
    },
}; 