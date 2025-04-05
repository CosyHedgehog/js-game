const DRAGON_PEAK_MONSTER_DATA = {
    'flame_whelp': {
        name: 'Flame Whelp', health: 40, attack: 6, defense: 4, speed: 2.0, goldDrop: [8, 15],
        difficulty: 'easy',
        description: "A young, fiery dragonkin guarding its territory.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.7 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.1 },
        ]
    },
    'stone_drake': {
        name: 'Stone Drake', health: 55, attack: 7, defense: 8, speed: 2.8, goldDrop: [12, 20],
        difficulty: 'medium',
        description: "A drake whose scales resemble hardened rock.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.5 },
            { itemTier: 'rareFood', chance: 0.2 },
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemTier: 'rareItem', chance: 0.05 },
        ]
    },
    'obsidian_sentinel': {
        name: 'Obsidian Sentinel', health: 50, attack: 6, defense: 12, speed: 3.5, goldDrop: [15, 25],
        difficulty: 'hard',
        reflectsDamage: true, // Flag for mechanic
        reflectPercent: 0.2, // 20% of damage dealt reflected
        description: "A construct of volcanic glass animated by draconic magic.",
        mechanics: "Jagged Form: Reflects 20% of damage taken back at the attacker.",
        lootTable: [
            { itemTier: 'rareFood', chance: 0.4 },
            { itemTier: 'uncommonItem', chance: 0.3 },
            { itemTier: 'rareItem', chance: 0.1 },
            { itemId: 'greater_health_potion', chance: 0.1 },
        ]
    },
    'ancient_dragon': {
        name: 'Ancient Dragon', health: 100, attack: 10, defense: 10, speed: 4, goldDrop: [50, 75],
        isBoss: true,
        hasBreathAttack: true,
        breathAttackInterval: 12, // seconds
        breathAttackDamage: [4, 8], // Raw damage range
        hardenThreshold: 0.25, // Hardens below 25% health
        hardenDefenseBonus: 5, // Adds +5 Defense when hardened
        description: "An ancient dragon.",
        mechanics: "Firebreath every 12 seconds, dealing 4-8 damage that cannot be blocked and burns the player over 4 seconds.\n\n Hardens below 25% health, increasing defense by 5.",
        breathDotDamage: 1, // Damage per tick
        breathDotDuration: 5, // Total duration in seconds add + 1 second
        breathDotTickInterval: 1, // Seconds between ticks
        lootTable: [
            { itemId: 'dragon_scale', chance: 0.8 }, 
            { itemId: 'dragon_heart', chance: 0.3 }, 
            { itemTier: 'rareItem', chance: 0.2 },
            { itemId: 'gold', quantity: [500, 1000], chance: 1.0 }
        ],
    },
}; 