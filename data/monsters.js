const COMMON_MONSTERS = ['rat', 'bandit', 'wolf', 'goblin_warrior', 'skeleton', 'armored_zombie'];
const MINI_BOSSES = ['orc_warrior', 'troll', 'dark_knight'];
const FINAL_BOSS = 'dragon'

const MONSTERS = {
    'rat': {
        name: 'Giant Rat', health: 12, attack: 2, defense: 0, speed: 1.5, goldDrop: [2, 4],
        lootTable: [
            { itemId: 'bread', chance: 0.5 },
            { itemId: 'wooden_sword', chance: 0.1 },
            { itemId: 'leather_helm', chance: 0.1 },
        ]
    },
    'bandit': {
        name: 'Bandit', health: 15, attack: 3, defense: 1, speed: 1.8, goldDrop: [3, 6],
        lootTable: [
            { itemId: 'rusty_sword', chance: 0.15 },
            { itemId: 'wooden_shield', chance: 0.15 },
            { itemId: 'bread', chance: 0.3 },
        ]
    },
    'wolf': {
        name: 'Dire Wolf', health: 14, attack: 4, defense: 0, speed: 1.2, goldDrop: [2, 5],
        lootTable: [
            { itemId: 'cooked_meat', chance: 0.4 },
            { itemId: 'leather_legs', chance: 0.15 },
        ]
    },
    'goblin_warrior': {
        name: 'Goblin Warrior', health: 20, attack: 5, defense: 2, speed: 1.8, goldDrop: [4, 8],
        lootTable: [
            { itemId: 'iron_sword', chance: 0.12 },
            { itemId: 'iron_shield', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.2 },
        ]
    },
    'skeleton': {
        name: 'Skeleton Warrior', health: 18, attack: 6, defense: 1, speed: 2.0, goldDrop: [4, 7],
        lootTable: [
            { itemId: 'iron_helm', chance: 0.12 },
            { itemId: 'iron_legs', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.15 },
        ]
    },
    'armored_zombie': {
        name: 'Armored Zombie', health: 25, attack: 4, defense: 3, speed: 2.5, goldDrop: [4, 8],
        lootTable: [
            { itemId: 'iron_armor', chance: 0.12 },
            { itemId: 'iron_shield', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.2 },
        ]
    },
    'orc_warrior': {
        name: 'Orc Warrior', health: 35, attack: 7, defense: 3, speed: 2.2, goldDrop: [6, 10],
        lootTable: [
            { itemId: 'steel_sword', chance: 0.1 },
            { itemId: 'steel_shield', chance: 0.1 },
            { itemId: 'greater_health_potion', chance: 0.25 },
        ]
    },
    'troll': {
        name: 'Cave Troll', health: 45, attack: 8, defense: 2, speed: 2.8, goldDrop: [8, 12],
        lootTable: [
            { itemId: 'steel_greatsword', chance: 0.08 },
            { itemId: 'steel_armor', chance: 0.08 },
            { itemId: 'greater_health_potion', chance: 0.3 },
        ]
    },
    'dark_knight': {
        name: 'Dark Knight', health: 40, attack: 7, defense: 4, speed: 2.0, goldDrop: [8, 14],
        lootTable: [
            { itemId: 'steel_helm', chance: 0.1 },
            { itemId: 'steel_legs', chance: 0.1 },
            { itemId: 'greater_health_potion', chance: 0.25 },
            { itemId: 'dragon_ring', chance: 0.05 }
        ]
    },
    'dragon': {
        name: 'Ancient Dragon', health: 120, attack: 12, defense: 6, speed: 2.5, goldDrop: [40, 60],
        lootTable: [] // Boss doesn't drop items, just victory
    }
};