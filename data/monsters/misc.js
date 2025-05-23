const MISC_MONSTER_DATA = {
    'cave_bat': {        name: 'Cave bat', health: 15, attack: 1, defense: 2, speed: 2, goldDrop: [2, 4],
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.06 },
        ]
    },
    'large_spider': {        name: 'Large Spider', health: 15, attack: 2, defense: 1, speed: 1.4, goldDrop: [2, 4],
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.6 },
            { itemTier: 'rareFood', chance: 0.1 },
            { itemTier: 'commonItem', chance: 0.35 },
            { itemTier: 'uncommonItem', chance: 0.07 },
        ]
    },
    'river_troll': {
        name: 'River Troll', health: 15, attack: 5, defense: 2, speed: 3.0, goldDrop: [4, 8],
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.15 },
            { itemTier: 'uncommonItem', chance: 0.05 }
        ]
    },
}; 