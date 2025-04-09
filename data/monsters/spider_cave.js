const SPIDER_CAVE_MONSTER_DATA = {
    'giant_spider': {
        name: 'Giant Spider', 
        health: 10, 
        attack: 2, 
        defense: 1, 
        speed: 1.8, 
        goldDrop: [3, 5],
        description: "A large arachnid with powerful fangs.",
        difficulty: 'easy',
        lootTable: [
            { itemTier: 'commonFood', chance: 0.70 },
            { itemTier: 'commonItem', chance: 0.30 },
        ]
    },
    'web_weaver': {
        name: 'Web Weaver', 
        health: 14, 
        attack: 2, 
        defense: 2, 
        speed: 2.0, 
        goldDrop: [3, 7],
        description: "A cunning spider that specializes in defense.",
        difficulty: 'medium',
        lootTable: [
            { itemTier: 'commonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.40 },
        ]
    },
    'venox': {
        name: 'Venox', 
        health: 25, 
        attack: 2, 
        defense: 4, 
        speed: 1.8, 
        goldDrop: [5, 15],
        isMiniBoss: true,
        appliesPoison: true,
        poisonDamage: [1, 3],
        poisonDuration: 10,
        description: "Venomous spider.",
        mechanics: "Inflicts poison on successful attacks, dealing damage over time. Lasts 10s.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 0.50 },
            { itemTier: 'uncommonItem', chance: 0.60 },
            { itemTier: 'commonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.10 },
            { itemId: 'restoration_potion', chance: 0.25 },
            { itemId: 'ring_of_warding', chance: 0.05 }
        ]
    },
}; 