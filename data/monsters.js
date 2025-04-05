const SPIDER_CAVE_MONSTERS = ['giant_spider', 'web_weaver', 'poison_crawler'];
const WOLF_DEN_MONSTERS = ['dire_wolf', 'wolf_pup', 'feral_hunter'];
const ROUND_11_20_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_21_30_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_10_MINI_BOSSES = { 'spider_cave': 'venox', 'wolf_den': 'silverfang' };
const ROUND_20_MINI_BOSSES = ['krug', 'grog'];
const FINAL_BOSS = 'ancient_dragon';

const MONSTERS = {
    // === Spider Cave Monsters ===
    'giant_spider': {
        name: 'Giant Spider', health: 15, attack: 2, defense: 1, speed: 1.4, goldDrop: [2, 4],
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
    'web_weaver': {
        name: 'Web Weaver', health: 12, attack: 1, defense: 3, speed: 1.8, goldDrop: [2, 5],
        description: "A cunning spider that specializes in defense.",
        difficulty: 'medium',
        lootTable: [
            { itemTier: 'commonFood', chance: 0.5 },
            { itemTier: 'uncommonFood', chance: 0.4 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.06 },
        ]
    },
    'poison_crawler': {
        name: 'Poison Crawler', health: 10, attack: 3, defense: 1, speed: 1.6, goldDrop: [3, 6],
        difficulty: 'hard',
        appliesPoison: true,
        poisonChance: 0.5,
        poisonDamage: [1, 1],
        poisonDuration: 5,
        description: "A small but deadly spider with toxic venom.",
        mechanics: "Has a chance to poison on hit.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.4 },
            { itemTier: 'uncommonFood', chance: 0.3 },
            { itemId: 'antidote_potion', chance: 0.15 },
            { itemTier: 'commonItem', chance: 0.2 },
        ]
    },

    // === Wolf Den Monsters ===
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

    // === Mini-Bosses ===
    'silverfang': {
        name: 'Silverfang', health: 30, attack: 5, defense: 1, speed: 1.2,
        goldDrop: [10, 20],
        description: "A swift and agile wolf.",
        mechanics: "Attacks 50% faster when below 50% health.",
        lootTable: [
            { itemId: 'speed_potion', chance: 0.4 },
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemId: 'ring_of_speed', chance: 0.05 }
        ]
    },
    'venox': {
        name: 'Venox', health: 25, attack: 2, defense: 4, speed: 1.8, 
        goldDrop: [10, 20],
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

    // === Rounds 11-20 Common ===


    // === Round 20 Mini-Boss ===
    'krug': {
        name: 'Krug', health: 50, attack: 5, defense: 6, speed: 2.5, goldDrop: [15, 30],
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
        name: 'Grog', health: 60, attack: 5, defense: 8, speed: 3.0,
        goldDrop: [20, 35],
        hasTimedStun: true,
        timedStunInterval: 15,
        timedStunDuration: 4,
        description: "An armored ogre with a large club.",
        mechanics: "Slams the ground every 15 seconds, stunning you for 4 seconds!",
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