const ROUND_1_10_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_11_20_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_21_30_COMMON_MONSTERS = ['giant_rat', 'large_spider', 'cave_bat'];
const ROUND_10_MINI_BOSSES = ['venzid'];
const ROUND_20_MINI_BOSSES = ['griznokt'];
const FINAL_BOSS = 'dragon'

const MONSTERS = {

    // === Rounds 1-10 Common ===
    'giant_rat': { 
        name: 'Giant Rat', health: 10, attack: 2, defense: 0, speed: 1.5, goldDrop: [1, 3],
        lootTable: [
            { itemId: 'bread', chance: 0.15 },
            { itemId: 'small_fish', chance: 0.15 },
            { itemId: 'medium_fish', chance: 0.10 },

            { itemId: 'ring_of_the_dragon', chance: 0.01 }
        ]
    },
    'large_spider': { // speed monster
        name: 'Large Spider', health: 18, attack: 3, defense: 0, speed: 1.0, goldDrop: [2, 4],
        lootTable: [
            { itemId: 'ring_of_speed', chance: 0.01 }
        ]
    },
    'cave_bat': { // defense monster
        name: 'Cave bat', health: 15, attack: 3, defense: 2, speed: 2.5, goldDrop: [2, 8],
        lootTable: [
            { itemId: 'bread', chance: 0.15 },
            { itemId: 'small_fish', chance: 0.15 },

            { itemId: 'wooden_dagger', chance: 0.05 },
            { itemId: 'wooden_sword', chance: 0.05 },
            { itemId: 'wooden_hammer', chance: 0.05 },
            { itemId: 'wooden_shield', chance: 0.05 },

            { itemId: 'leather_armor', chance: 0.05 },
            { itemId: 'leather_legs', chance: 0.05 },
            { itemId: 'leather_helm', chance: 0.05 },

            { itemId: 'ring_of_the_guardian', chance: 0.01 }
        ]
    },

    // === Round 10 Mini-Boss ===
    'venfing': {
        name: 'Venfing [Spider]', health: 25, attack: 5, defense: 1, speed: 1.2,
        goldDrop: [1, 15],
        description: "A swift and venomous spider.\nAttacks much faster when below 50% health!",
        lootTable: [
            { itemId: 'speed_potion', chance: 0.4 },
            { itemId: 'iron_dagger', chance: 0.2 },
            { itemId: 'ring_of_speed', chance: 0.05 }
        ]
    },
    'venzid': {
        name: 'Venzid [Spider]', 
        health: 20, 
        attack: 1,
        defense: 4,
        speed: 1.2, 
        goldDrop: [10, 20],
        appliesPoison: true,
        poisonDamage: [1, 2],
        poisonDuration: 10,
        description: "A patient spider that coats its fangs in venom. Its attacks inflict poison, dealing variable damage over time.",
        lootTable: [
            { itemId: 'health_potion', chance: 0.5 }, 
            { itemId: 'leather_armor', chance: 0.2 },
            { itemId: 'antidote_potion', chance: 0.1 } // Potential new item?
        ]
    },

    // === Rounds 11-20 Common ===


    // === Round 20 Mini-Boss ===
    'griznokt': {
        name: 'Griznokt [Ogre]', health: 50, attack: 4, defense: 8, speed: 2.5, goldDrop: [15, 30],
        enrageThreshold: 0.3, // Enrages below 30% health
        enrageAttackMultiplier: 2.5, // Attack becomes 4 * 2.5 = 10 when enraged
        description: "A heavily armored ogre.\nBecomes enraged and hits harder below 30% health!",
        lootTable: [
            // Add appropriate loot? e.g.:
            { itemId: 'iron_greatsword', chance: 0.3 },
            { itemId: 'steel_armor', chance: 0.2 }, 
            { itemId: 'ring_of_resilience', chance: 0.05 } 
        ]
    },

    'ogmor': {
        name: 'Ogmor [Ogre]', health: 50, attack: 4, defense: 8, speed: 2.5, goldDrop: [15, 30],
        enrageThreshold: 0.3, // Enrages below 30% health
        enrageAttackMultiplier: 2.5, // Attack becomes 4 * 2.5 = 10 when enraged
        description: "A heavily armored ogre.\nBecomes enraged and hits harder below 30% health!",
        lootTable: [
            // Add appropriate loot? e.g.:
            { itemId: 'iron_greatsword', chance: 0.3 },
            { itemId: 'steel_armor', chance: 0.2 }, 
            { itemId: 'ring_of_resilience', chance: 0.05 } 
        ]
    },

    // === Rounds 21-30 Common ===


    // === Round 30 Final Boss ===
    'dragon': {
        name: 'Ancient Dragon', health: 100, attack: 10, defense: 10, speed: 4, goldDrop: [50, 75],
        hasBreathAttack: true,
        breathAttackInterval: 12, // seconds
        breathAttackDamage: [5, 8], // Raw damage range
        hardenThreshold: 0.25, // Hardens below 25% health
        hardenDefenseBonus: 5, // Adds +5 Defense when hardened
        description: "A colossal beast of legend. Periodically unleashes devastating fiery breath. Its scales harden significantly when wounded.",
        lootTable: [
            { itemId: 'dragon_ring', chance: 1.0 },
        ]
    },

    // === Misc Monsters
    'river_troll': {
        name: 'River Troll', health: 15, attack: 5, defense: 2, speed: 3.0, goldDrop: [4, 8],
        lootTable: [
            { itemId: 'medium_fish', chance: 0.4 },
            { itemId: 'leather_legs', chance: 0.15 },
            { itemId: 'iron_helm', chance: 0.05 },
        ]
    }
};






// 'hobgoblin': {
//     name: 'Hobgoblin Captain', health: 45, attack: 7, defense: 5, speed: 2.4, goldDrop: [8, 12],
//     lootTable: [
//         { itemId: 'steel_sword', chance: 0.12 },
//         { itemId: 'steel_shield', chance: 0.1 },
//         { itemId: 'greater_attack_potion', chance: 0.05 },
//     ]
// },
// 'wraith': {
//     name: 'Wraith', health: 35, attack: 8, defense: 3, speed: 1.8, goldDrop: [10, 15], // High attack, lower HP/Def
//     lootTable: [
//         { itemId: 'steel_dagger', chance: 0.1 },
//         { itemId: 'speed_potion', chance: 0.15 },
//     ]
// },
// 'ogre': {
//     name: 'Ogre Brute', health: 60, attack: 8, defense: 4, speed: 3.0, goldDrop: [9, 14],
//     lootTable: [
//         { itemId: 'iron_greatsword', chance: 0.1 }, // Slightly lower tier weapon
//         { itemId: 'steel_legs', chance: 0.15 },
//         { itemId: 'cooked_meat', chance: 0.3 },
//     ]
// },
// 'golem_guard': {
//     name: 'Golem Guard', health: 55, attack: 6, defense: 7, speed: 4.0, goldDrop: [12, 18], // High defense, slow
//     lootTable: [
//         { itemId: 'steel_armor', chance: 0.1 },
//         { itemId: 'greater_defense_potion', chance: 0.1 },
//     ]
// },
// 'cultist': {
//     name: 'Dark Cultist', health: 40, attack: 7, defense: 4, speed: 2.2, goldDrop: [10, 16],
//     lootTable: [
//         { itemId: 'steel_dagger', chance: 0.08 },
//         { itemId: 'defense_potion', chance: 0.1 },
//         { itemId: 'greater_health_potion', chance: 0.05 },
//     ]
// },


// 'skeleton': {
//     name: 'Skeleton Warrior', health: 25, attack: 4, defense: 2, speed: 2.0, goldDrop: [4, 7],
//     lootTable: [
//         { itemId: 'iron_sword', chance: 0.1 },
//         { itemId: 'iron_shield', chance: 0.08 },
//     ]
// },
// 'zombie': {
//     name: 'Zombie', health: 35, attack: 3, defense: 1, speed: 3.5, goldDrop: [3, 6],
//     lootTable: [
//         { itemId: 'leather_armor', chance: 0.1 }, // Degraded armor
//         { itemId: 'cooked_meat', chance: 0.15 }, // Questionable meat
//     ]
// },
// 'orc_grunt': {
//     name: 'Orc Grunt', health: 30, attack: 5, defense: 3, speed: 2.8, goldDrop: [5, 8],
//     lootTable: [
//         { itemId: 'iron_hammer', chance: 0.07 },
//         { itemId: 'iron_legs', chance: 0.1 },
//         { itemId: 'defense_potion', chance: 0.05 },
//     ]
// },
// 'wolf': {
//     name: 'Dire Wolf', health: 28, attack: 6, defense: 1, speed: 1.6, goldDrop: [4, 7],
//     lootTable: [
//         { itemId: 'cooked_meat', chance: 0.2 },
//         { itemId: 'leather_legs', chance: 0.05 }, // Pelt
//     ]
// },
// 'imp': {
//     name: 'Fire Imp', health: 22, attack: 5, defense: 2, speed: 1.9, goldDrop: [6, 9],
//     lootTable: [
//         { itemId: 'iron_dagger', chance: 0.08 },
//         { itemId: 'attack_potion', chance: 0.1 },
//     ]
// },

// 'hobgoblin': {
//     name: 'Hobgoblin Captain', health: 45, attack: 7, defense: 5, speed: 2.4, goldDrop: [8, 12],
//     lootTable: [
//         { itemId: 'steel_sword', chance: 0.12 },
//         { itemId: 'steel_shield', chance: 0.1 },
//         { itemId: 'greater_attack_potion', chance: 0.05 },
//     ]
// },
// 'wraith': {
//     name: 'Wraith', health: 35, attack: 8, defense: 3, speed: 1.8, goldDrop: [10, 15], // High attack, lower HP/Def
//     lootTable: [
//         { itemId: 'steel_dagger', chance: 0.1 },
//         { itemId: 'speed_potion', chance: 0.15 },
//     ]
// },
// 'ogre': {
//     name: 'Ogre Brute', health: 60, attack: 8, defense: 4, speed: 3.0, goldDrop: [9, 14],
//     lootTable: [
//         { itemId: 'iron_greatsword', chance: 0.1 }, // Slightly lower tier weapon
//         { itemId: 'steel_legs', chance: 0.15 },
//         { itemId: 'cooked_meat', chance: 0.3 },
//     ]
// },
// 'golem_guard': {
//     name: 'Golem Guard', health: 55, attack: 6, defense: 7, speed: 4.0, goldDrop: [12, 18], // High defense, slow
//     lootTable: [
//         { itemId: 'steel_armor', chance: 0.1 },
//         { itemId: 'greater_defense_potion', chance: 0.1 },
//     ]
// },
// 'cultist': {
//     name: 'Dark Cultist', health: 40, attack: 7, defense: 4, speed: 2.2, goldDrop: [10, 16],
//     lootTable: [
//         { itemId: 'steel_dagger', chance: 0.08 },
//         { itemId: 'defense_potion', chance: 0.1 },
//         { itemId: 'greater_health_potion', chance: 0.05 },
//     ]
// },