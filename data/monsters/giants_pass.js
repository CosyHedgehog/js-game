const GIANTS_PASS_MONSTER_DATA = {
    'hill_giant_grunt': {
        name: 'Hill Giant Grunt', 
        health: 16, 
        attack: 4, 
        defense: 1, 
        speed: 3.0, 
        goldDrop: [5, 9],
        difficulty: 'easy',
        description: "A dim-witted but large giant wandering the pass.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.70 },
            { itemTier: 'uncommonItem', chance: 0.30 },
        ]
    },
    'moss_giant': {
        name: 'Moss Giant', 
        health: 18, 
        attack: 5, 
        defense: 5, 
        speed: 3.0, 
        goldDrop: [6, 12],
        difficulty: 'medium',
        description: "A vigilant giant tasked with guarding the pass.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'uncommonItem', chance: 0.40 },
        ]
    },
    'cyclops_stone_thrower': {
        name: 'Cyclops Stone-Thrower',
        icon: '🧌',
        health: 60, 
        attack: 8, 
        defense: 8, 
        speed: 3.5,
        goldDrop: [15, 30],
        isMiniBoss: true,
        hasTimedStun: true,
        timedStunInterval: 12,
        timedStunDuration: 4,
        description: "A lumbering giant with a single, hateful eye.",
        mechanics: "Hurls a massive boulder every 15 seconds, causing a shockwave that stuns you for 4 seconds!",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.10 },
            { itemTier: 'uncommonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.60 },
            { itemId: 'greater_defense_potion', chance: 0.25 },
            { itemId: 'ring_of_fortitude', chance: 0.05 }
        ]
    },
}; 