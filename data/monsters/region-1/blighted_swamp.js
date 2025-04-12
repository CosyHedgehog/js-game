const BLIGHTED_SWAMP_MONSTER_DATA = {
    'giant_frog': { 
        name: 'Giant Frog', 
        health: 7, 
        attack: 2, 
        defense: 0, 
        speed: 1.5, 
        goldDrop: [3, 6],
        description: "A large, green frog with a large mouth.",
        difficulty: 'easy',
        lootTable: [
            { itemTier: 'commonFood', chance: 0.70 },
            { itemTier: 'commonItem', chance: 0.30 },
        ]
    },
    'mutated_mushroom': { 
        name: 'Mutated Mushroom', 
        health: 15, 
        attack: 3,
        defense: 1,
        speed: 2.2, 
        goldDrop: [4, 7],
        description: "A fungus-covered creature.",
        difficulty: 'medium',
        lootTable: [
            { itemTier: 'commonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.40 },
        ]
    },
    'globulus': {
        name: 'Globulus',
        icon: '🦠',
        health: 25,
        attack: 4,
        defense: 4,
        speed: 2.2,
        goldDrop: [5, 15],
        isMiniBoss: true,
        hasSlimeAttack: true,
        slimeInterval: 8.0,
        slimeDuration: 5.0,
        slimeMin: 3,
        slimeMax: 6,
        description: "A large, quivering mass of corrosive ooze.",
        mechanics: "Periodically slimes items in your inventory, preventing its use for a short time.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 0.50 },
            { itemTier: 'uncommonItem', chance: 0.60 },
            { itemTier: 'commonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.10 },
            { itemId: 'defense_potion', chance: 0.25 },
            { itemId: 'ring_of_resilience', chance: 0.05 }
        ]
    }
}; 