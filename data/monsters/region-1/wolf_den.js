const WOLF_DEN_MONSTER_DATA = {
    'wolf_pup': {
        name: 'Wolf Pup', 
        health: 8, 
        attack: 1, 
        defense: 0, 
        speed: 1.0, 
        goldDrop: [2, 4],
        difficulty: 'easy',
        description: "A young wolf, quick but not very strong.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.70 },
            { itemTier: 'commonItem', chance: 0.40 },
        ]
    },
    'wolf': {
        name: 'Wolf',
        health: 11, 
        attack: 2, 
        defense: 0, 
        speed: 1.2, 
        goldDrop: [4, 8],
        description: "A large, powerful wolf with sharp fangs.",
        difficulty: 'medium',
        lootTable: [
            { itemTier: 'commonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.70 },
        ]
    },
    'silverfang': {
        name: 'Silverfang',
        icon: '🐺',
        health: 25, 
        attack: 5, 
        defense: 0, 
        speed: 1.2,
        goldDrop: [5, 15],
        isMiniBoss: true,
        description: "A swift and agile wolf that attacks much faster when cornered.",
        mechanics: "Attacks 50% faster when below 50% health.",
        speedIncreaseThreshold: 0.5,  
        speedIncreasePercent: 0.5,
        mechanicTooltips: {
            normal: "Attacks quicker below half health.",
            quickened: "QUICKENED! Attacking faster."
        },
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 0.50 },
            { itemTier: 'uncommonItem', chance: 0.60 },
            { itemTier: 'commonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.10 },
            { itemId: 'speed_potion', chance: 0.25 },
            { itemId: 'ring_of_swiftness', chance: 0.05 },
        ]
    },
}; 