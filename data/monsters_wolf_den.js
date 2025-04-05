const WOLF_DEN_MONSTER_DATA = {
    'dire_wolf': {
        name: 'Dire Wolf', health: 18, attack: 3, defense: 1, speed: 1.3, goldDrop: [3, 5],
        difficulty: 'medium',
        description: "A large, powerful wolf with sharp fangs.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.6 },
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.08 },
        ]
    },
    'wolf_pup': {
        name: 'Wolf Pup', health: 8, attack: 1, defense: 1, speed: 1.0, goldDrop: [1, 3],
        difficulty: 'easy',
        description: "A young wolf, quick but not very strong.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.7 },
            { itemTier: 'uncommonFood', chance: 0.2 },
            { itemTier: 'commonItem', chance: 0.1 },
        ]
    },
    'feral_hunter': {
        name: 'Feral Hunter', health: 14, attack: 2, defense: 2, speed: 1.5, goldDrop: [2, 6],
        difficulty: 'hard',
        description: "A skilled wolf that hunts in precise strikes.",
        packTactics: true,
        packDamageBonus: 2,
        packDefenseBonus: 1,
        mechanics: "Pack Tactics: Gains +2 attack and +1 defense when below 50% health, representing desperate pack survival instincts.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.5 },
            { itemTier: 'uncommonFood', chance: 0.5 },
            { itemTier: 'commonItem', chance: 0.25 },
            { itemTier: 'uncommonItem', chance: 0.1 },
        ]
    },
    // Round 10 Mini-Boss (associated with Wolf Den)
    'silverfang': {
        name: 'Silverfang', health: 30, attack: 5, defense: 1, speed: 1.2,
        goldDrop: [10, 20],
        isMiniBoss: true,
        description: "A swift and agile wolf.",
        mechanics: "Attacks 50% faster when below 50% health.",
        lootTable: [
            { itemId: 'speed_potion', chance: 0.4 },
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemId: 'ring_of_speed', chance: 0.05 }
        ]
    },
}; 