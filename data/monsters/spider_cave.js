const SPIDER_CAVE_MONSTER_DATA = {
    'giant_spider': {
        name: 'Giant Spider', 
        health: 7, 
        attack: 2, 
        defense: 0, 
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
        health: 10, 
        attack: 2, 
        defense: 1, 
        speed: 2.0, 
        goldDrop: [3, 7],
        description: "A cunning spider.",
        difficulty: 'medium',
        lootTable: [
            { itemTier: 'commonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.40 },
        ]
    },
    'venox': {
        name: 'Venox', 
        icon: '🕷️',
        health: 25, 
        attack: 2, 
        defense: 3, 
        speed: 1.8, 
        goldDrop: [5, 15],
        isMiniBoss: true,
        appliesPoison: true,
        poisonDamage: [1, 2],
        poisonDuration: 10,
        poisonChance: 0.35,
        description: "Venomous spider.",
        mechanics: "Chance to inflict poison, dealing damage over time.",
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