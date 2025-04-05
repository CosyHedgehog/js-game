const BOSS_MONSTER_DATA = {
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