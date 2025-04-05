const ROUND_1_10_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_11_20_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_21_30_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_10_MINI_BOSSES = ['silverfang', 'venox'];
const ROUND_20_MINI_BOSSES = ['krug', 'grog'];
const FINAL_BOSS = 'ancient_dragon';

const MONSTERS = {

    // === Rounds 1-10 Common ===
    'giant_rat': { 
        name: 'Giant Rat', health: 10, attack: 1, defense: 1, speed: 1.5, goldDrop: [1, 3],
        lootTable: [
            { itemTier: 'commonFood', chance: 0.5 },
            { itemTier: 'uncommonFood', chance: 0.3 },
            { itemTier: 'commonItem', chance: 0.2 },
            { itemTier: 'uncommonItem', chance: 0.05 },
        ]
    },
    'cave_bat': { // defense monster
        name: 'Cave bat', health: 15, attack: 1, defense: 2, speed: 2, goldDrop: [2, 4],
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.06 },
        ]
    },
    'large_spider': { // speed monster
        name: 'Large Spider', health: 15, attack: 2, defense: 1, speed: 1.4, goldDrop: [2, 4],
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.6 },
            { itemTier: 'rareFood', chance: 0.1 },
            { itemTier: 'commonItem', chance: 0.35 },
            { itemTier: 'uncommonItem', chance: 0.07 },
        ]
    },

    // === Round 10 Mini-Boss ===
    'silverfang': {
        name: 'Silverfang', health: 30, attack: 5, defense: 1, speed: 1.2,
        goldDrop: [1, 15],
        description: "A swift and agile wolf.",
        mechanics: "Attacks 50% faster when below 50% health.",
        lootTable: [
            { itemId: 'speed_potion', chance: 0.4 },
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemId: 'ring_of_speed', chance: 0.05 }
        ]
    },
    'venox': {
        name: 'Venox', health: 20, attack: 2, defense: 4, speed: 1.8, 
        goldDrop: [10, 20],
        appliesPoison: true,
        poisonDamage: [1, 2],
        poisonDuration: 10,
        description: "A venomous spider.",
        mechanics: "Inflicts poison on successful attacks, dealing damage over time. Lasts 10s.",
        lootTable: [
            { itemId: 'health_potion', chance: 0.5 }, 
            { itemTier: 'commonItem', chance: 0.2 },
            { itemId: 'antidote_potion', chance: 0.1 } // Potential new item?
        ]
    },

    // === Rounds 11-20 Common ===


    // === Round 20 Mini-Boss ===
    'krug': {
        name: 'Krug [Ogre]', health: 50, attack: 5, defense: 6, speed: 2.5, goldDrop: [15, 30],
        enrageThreshold: 0.4,
        enrageAttackMultiplier: 3,
        description: "An angry ogre.",
        mechanics: "Becomes enraged below 40% health!",
        lootTable: [
            { itemTier: 'uncommonItem', chance: 0.3 },
            { itemTier: 'rareItem', chance: 0.1 },
            { itemId: 'ring_of_resilience', chance: 0.05 } 
        ]
    },

    'grog': {
        name: 'Grog [Ogre]', health: 60, attack: 5, defense: 8, speed: 3.0,
        goldDrop: [20, 35],
        hasStunningSlam: true,
        stunChance: 0.25, // 25% chance on hit
        stunDuration: 4, // Player attack delayed 2.5s
        description: "An armored ogre with a large club.",
        mechanics: "25% chance to stun on attack!",
        lootTable: [
            { itemId: 'greater_defense_potion', chance: 0.4 }, 
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemId: 'ring_of_the_guardian', chance: 0.05 } 
        ]
    },

    // === Rounds 21-30 Common ===


    // === Round 30 Final Boss ===
    'ancient_dragon': {
        name: 'Ancient Dragon', health: 100, attack: 10, defense: 10, speed: 4, goldDrop: [50, 75],
        hasBreathAttack: true,
        breathAttackInterval: 12, // seconds
        breathAttackDamage: [4, 8], // Raw damage range
        hardenThreshold: 0.25, // Hardens below 25% health
        hardenDefenseBonus: 5, // Adds +5 Defense when hardened
        description: "A colossal beast of legend.",
        mechanics: "Unleashes devastating firebreath every 12 seconds,  dealing 4-8 damage that cannot be blocked and burns the player for 4 seconds.\n When critically wounded (below 25% health), its scales harden, boosting defense by 5.",
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

    // === Misc Monsters
    'river_troll': {
        name: 'River Troll', health: 15, attack: 5, defense: 2, speed: 3.0, goldDrop: [4, 8],
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.15 },
            { itemTier: 'uncommonItem', chance: 0.05 }
        ]
    }
};