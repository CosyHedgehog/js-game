const ITEMS = {
    // Weapons - Divided by ~3
    'wooden_sword': {
        id: 'wooden_sword', name: 'Wooden Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 1 }, speed: 2.0, value: 3,
        description: 'A simple sword made of wood.\nAttack: +1\nSpeed: 2.0s\n1-Handed'
    },
    'rusty_sword': {
        id: 'rusty_sword', name: 'Rusty Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 2 }, speed: 2.0, value: 5,
        description: 'An old, somewhat effective sword.\nAttack: +2\nSpeed: 2.0s\n1-Handed'
    },
    'iron_sword': {
        id: 'iron_sword', name: 'Iron Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 3 }, speed: 1.8, value: 10,
        description: 'A reliable iron sword.\nAttack: +3\nSpeed: 1.8s\n1-Handed'
    },
    'steel_sword': {
        id: 'steel_sword', name: 'Steel Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 4 }, speed: 1.8, value: 15,
        description: 'A well-crafted steel sword.\nAttack: +4\nSpeed: 1.8s\n1-Handed'
    },
    'iron_greatsword': {
        id: 'iron_greatsword', name: 'Iron Greatsword', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 6 }, speed: 2.5, value: 13,
        description: 'A heavy two-handed sword.\nAttack: +6\nSpeed: 2.5s\n2-Handed'
    },
    'steel_greatsword': {
        id: 'steel_greatsword', name: 'Steel Greatsword', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 8 }, speed: 2.5, value: 22,
        description: 'A mighty two-handed sword.\nAttack: +8\nSpeed: 2.5s\n2-Handed'
    },
    'quick_dagger': {
        id: 'quick_dagger', name: 'Quick Dagger', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 2 }, speed: 1.0, value: 8,
        description: 'A swift striking dagger.\nAttack: +2\nSpeed: 1.0s\n1-Handed'
    },

    // Armor - Divided by ~3
    'leather_helm': {
        id: 'leather_helm', name: 'Leather Helm', type: 'armor', slot: 'helm',
        stats: { defense: 1 }, value: 4,
        description: 'Basic head protection.\nDefense: +1'
    },
    'iron_helm': {
        id: 'iron_helm', name: 'Iron Helm', type: 'armor', slot: 'helm',
        stats: { defense: 2 }, value: 8,
        description: 'Sturdy metal helmet.\nDefense: +2'
    },
    'steel_helm': {
        id: 'steel_helm', name: 'Steel Helm', type: 'armor', slot: 'helm',
        stats: { defense: 3 }, value: 15,
        description: 'Superior head protection.\nDefense: +3'
    },
    'leather_armor': {
        id: 'leather_armor', name: 'Leather Armor', type: 'armor', slot: 'body',
        stats: { defense: 2 }, value: 5,
        description: 'Simple body armor.\nDefense: +2'
    },
    'iron_armor': {
        id: 'iron_armor', name: 'Iron Armor', type: 'armor', slot: 'body',
        stats: { defense: 3 }, value: 12,
        description: 'Solid iron protection.\nDefense: +3'
    },
    'steel_armor': {
        id: 'steel_armor', name: 'Steel Armor', type: 'armor', slot: 'body',
        stats: { defense: 4 }, value: 20,
        description: 'Superior body protection.\nDefense: +4'
    },
    'leather_legs': {
        id: 'leather_legs', name: 'Leather Legs', type: 'armor', slot: 'legs',
        stats: { defense: 1 }, value: 4,
        description: 'Basic leg protection.\nDefense: +1'
    },
    'iron_legs': {
        id: 'iron_legs', name: 'Iron Legs', type: 'armor', slot: 'legs',
        stats: { defense: 2 }, value: 9,
        description: 'Sturdy leg protection.\nDefense: +2'
    },
    'steel_legs': {
        id: 'steel_legs', name: 'Steel Legs', type: 'armor', slot: 'legs',
        stats: { defense: 3 }, value: 16,
        description: 'Superior leg protection.\nDefense: +3'
    },
    'wooden_shield': {
        id: 'wooden_shield', name: 'Wooden Shield', type: 'armor', slot: 'shield',
        stats: { defense: 1 }, value: 4,
        description: 'A basic shield.\nDefense: +1'
    },
    'iron_shield': {
        id: 'iron_shield', name: 'Iron Shield', type: 'armor', slot: 'shield',
        stats: { defense: 2 }, value: 10,
        description: 'A solid metal shield.\nDefense: +2'
    },
    'steel_shield': {
        id: 'steel_shield', name: 'Steel Shield', type: 'armor', slot: 'shield',
        stats: { defense: 3 }, value: 17,
        description: 'A superior shield.\nDefense: +3'
    },

    // Consumables - Divided by ~2-3 (keeping food very cheap)
    'bread': {
        id: 'bread', name: 'Bread', type: 'consumable', useAction: 'Eat',
        healAmount: 5, value: 2,
        description: 'A crusty loaf of bread.\nHeals 5 HP.'
    },
    'cooked_meat': {
        id: 'cooked_meat', name: 'Cooked Meat', type: 'consumable', useAction: 'Eat',
        healAmount: 8, value: 3,
        description: 'A piece of cooked meat.\nHeals 8 HP.'
    },
    'health_potion': {
        id: 'health_potion', name: 'Health Potion', type: 'consumable', useAction: 'Drink',
        healAmount: 15, value: 8, isPotion: true,
        description: 'A bubbling red potion.\nHeals 15 HP.\nNo combat delay.'
    },
    'greater_health_potion': {
        id: 'greater_health_potion', name: 'Greater Health Potion', type: 'consumable', useAction: 'Drink',
        healAmount: 25, value: 12, isPotion: true,
        description: 'A large healing potion.\nHeals 25 HP.\nNo combat delay.'
    },
};

const MONSTERS = {
    // Early Game (Rounds 1-10)
    'rat': {
        name: 'Giant Rat', health: 12, attack: 2, defense: 0, speed: 1.5, goldDrop: [1, 2],
        lootTable: [
            { itemId: 'bread', chance: 0.5 },
            { itemId: 'wooden_sword', chance: 0.1 },
            { itemId: 'leather_helm', chance: 0.1 },
        ]
    },
    'bandit': {
        name: 'Bandit', health: 15, attack: 3, defense: 1, speed: 1.8, goldDrop: [1, 3],
        lootTable: [
            { itemId: 'rusty_sword', chance: 0.15 },
            { itemId: 'wooden_shield', chance: 0.15 },
            { itemId: 'bread', chance: 0.3 },
        ]
    },
    'wolf': {
        name: 'Dire Wolf', health: 14, attack: 4, defense: 0, speed: 1.2, goldDrop: [1, 2],
        lootTable: [
            { itemId: 'cooked_meat', chance: 0.4 },
            { itemId: 'leather_legs', chance: 0.15 },
        ]
    },

    // Mid Game (Rounds 11-20)
    'goblin_warrior': {
        name: 'Goblin Warrior', health: 20, attack: 5, defense: 2, speed: 1.8, goldDrop: [2, 4],
        lootTable: [
            { itemId: 'iron_sword', chance: 0.12 },
            { itemId: 'iron_shield', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.2 },
        ]
    },
    'skeleton': {
        name: 'Skeleton Warrior', health: 18, attack: 6, defense: 1, speed: 2.0, goldDrop: [2, 3],
        lootTable: [
            { itemId: 'iron_helm', chance: 0.12 },
            { itemId: 'iron_legs', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.15 },
        ]
    },
    'armored_zombie': {
        name: 'Armored Zombie', health: 25, attack: 4, defense: 3, speed: 2.5, goldDrop: [2, 4],
        lootTable: [
            { itemId: 'iron_armor', chance: 0.12 },
            { itemId: 'iron_shield', chance: 0.12 },
            { itemId: 'health_potion', chance: 0.2 },
        ]
    },

    // Late Game (Rounds 21-29)
    'orc_warrior': {
        name: 'Orc Warrior', health: 35, attack: 7, defense: 3, speed: 2.2, goldDrop: [3, 5],
        lootTable: [
            { itemId: 'steel_sword', chance: 0.1 },
            { itemId: 'steel_shield', chance: 0.1 },
            { itemId: 'greater_health_potion', chance: 0.25 },
        ]
    },
    'troll': {
        name: 'Cave Troll', health: 45, attack: 8, defense: 2, speed: 2.8, goldDrop: [4, 6],
        lootTable: [
            { itemId: 'steel_greatsword', chance: 0.08 },
            { itemId: 'steel_armor', chance: 0.08 },
            { itemId: 'greater_health_potion', chance: 0.3 },
        ]
    },
    'dark_knight': {
        name: 'Dark Knight', health: 40, attack: 7, defense: 4, speed: 2.0, goldDrop: [4, 7],
        lootTable: [
            { itemId: 'steel_helm', chance: 0.1 },
            { itemId: 'steel_legs', chance: 0.1 },
            { itemId: 'greater_health_potion', chance: 0.25 },
        ]
    },

    // Final Boss (Round 30)
    'dragon': {
        name: 'Ancient Dragon', health: 120, attack: 12, defense: 6, speed: 2.5, goldDrop: [20, 30],
        lootTable: [] // Boss doesn't drop items, just victory
    }
};

// Probabilities for encounters
const ENCOUNTER_PROBABILITY = [
    { type: 'monster', weight: 35 },
    { type: 'rest', weight: 35 },
    { type: 'shop', weight: 15 },
    { type: 'mini-boss', weight: 15 },
];

// Define which monsters appear in which stages
const COMMON_MONSTERS = ['rat', 'bandit', 'wolf', 'goblin_warrior', 'skeleton', 'armored_zombie'];
const MINI_BOSSES = ['orc_warrior', 'troll', 'dark_knight'];
const FINAL_BOSS = 'dragon';

// Shop settings
const SHOP_NUM_ITEMS = 3;
const SHOP_REROLL_COST = 5;

// Item pool for shops (with progressive tiers)
const SHOP_ITEM_POOL = [
    // Early game items (always available)
    'wooden_sword', 'rusty_sword', 'leather_helm', 'leather_armor', 'leather_legs', 'wooden_shield',
    'bread', 'cooked_meat', 'health_potion',
    
    // Mid game items (less common)
    'iron_sword', 'quick_dagger', 'iron_helm', 'iron_armor', 'iron_legs', 'iron_shield',
    'health_potion',
    
    // Late game items (rare)
    'steel_sword', 'steel_greatsword', 'steel_helm', 'steel_armor', 'steel_legs', 'steel_shield',
    'greater_health_potion'
];