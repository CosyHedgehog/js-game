const SPIDER_CAVE_MONSTER_DATA = {
    'giant_spider': {
        name: 'Giant Spider', health: 10, attack: 2, defense: 1, speed: 1.5, goldDrop: [2, 4],
        description: "A large arachnid with powerful fangs.",
        difficulty: 'easy',
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.6 },
            { itemTier: 'rareFood', chance: 0.1 },
            { itemTier: 'commonItem', chance: 0.35 },
            { itemTier: 'uncommonItem', chance: 0.07 },
        ]
    },
    // 'web_weaver': {
    //     name: 'Web Weaver', health: 14, attack: 2, defense: 2, speed: 1.8, goldDrop: [2, 5],
    //     description: "A cunning spider that specializes in defense.",
    //     difficulty: 'medium',
    //     lootTable: [
    //         { itemTier: 'commonFood', chance: 0.5 },
    //         { itemTier: 'uncommonFood', chance: 0.4 },
    //         { itemTier: 'commonItem', chance: 0.3 },
    //         { itemTier: 'uncommonItem', chance: 0.06 },
    //     ]
    // },
    // 'poison_crawler': {
    //     name: 'Poison Crawler', health: 18, attack: 3, defense: 1, speed: 1.6, goldDrop: [3, 6],
    //     difficulty: 'hard',
    //     appliesPoison: true,
    //     poisonChance: 0.5,
    //     poisonDamage: [1, 1],
    //     poisonDuration: 5,
    //     description: "A small but deadly spider with toxic venom.",
    //     mechanics: "Has a chance to poison on hit.",
    //     lootTable: [
    //         { itemTier: 'commonFood', chance: 0.4 },
    //         { itemTier: 'uncommonFood', chance: 0.3 },
    //         { itemId: 'antidote_potion', chance: 0.15 },
    //         { itemTier: 'commonItem', chance: 0.2 },
    //     ]
    // },
    'venox': {
        name: 'Venox', health: 25, attack: 2, defense: 4, speed: 1.8, 
        goldDrop: [10, 20],
        isMiniBoss: true,
        appliesPoison: true,
        poisonDamage: [1, 2],
        poisonDuration: 10,
        description: "Venomous spider.",
        mechanics: "Inflicts poison on successful attacks, dealing damage over time. Lasts 10s.",
        lootTable: [
            { itemId: 'health_potion', chance: 0.5 }, 
            { itemTier: 'commonItem', chance: 0.2 },
            { itemId: 'antidote_potion', chance: 0.1 }
        ]
    },
}; 