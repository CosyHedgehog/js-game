const DRAGON_PEAK_MONSTER_DATA = {
    'flame_whelp': {
        name: 'Flame Whelp', 
        health: 25, 
        attack: 4, 
        defense: 3, 
        speed: 1.8, 
        goldDrop: [8, 15],
        difficulty: 'easy',
        description: "A young, fiery dragonkin guarding its territory.",
        lootTable: [
            { itemTier: 'rareFood', chance: 0.70 },
            { itemTier: 'rareItem', chance: 0.40 },
        ]
    },
    'stone_drake': {
        name: 'Stone Drake', 
        health: 35, 
        attack: 5, 
        defense: 4, 
        speed: 2.0, 
        goldDrop: [12, 20],
        difficulty: 'medium',
        description: "A drake whose scales resemble hardened rock.",
        lootTable: [
            { itemTier: 'rareFood', chance: 1.00 },
            { itemTier: 'rareItem', chance: 0.70 },
        ]
    },
    'ancient_dragon': {
        name: 'Ancient Dragon', 
        icon: '🐲',
        health: 100, 
        attack: 10, 
        defense: 10, 
        speed: 4, 
        goldDrop: [100, 200],
        isBoss: true,
        hasBreathAttack: true,
        breathAttackInterval: 12,        
        breathAttackDamage: [4, 8],        
        hardenThreshold: 0.33,        
        hardenDefenseBonus: 5,        
        description: "An ancient dragon.",
        mechanics: "Firebreath every 12 seconds, dealing 4-8 damage that cannot be blocked and burns the player over 5 seconds. Hardens below 33% health, increasing defense by 5.",
        breathDotDamage: 1,        
        breathDotDuration: 5,        
        breathDotTickInterval: 1,
        mechanicTooltips: {
            normal: "Breathing deadly fire. Hardens defense when low health.",
            hardened: "HARDENED! Defense +5."
        },
        lootTable: [],
    },
}; 