const ITEMS = {
    // Weapons
    'wooden_sword': {
        id: 'wooden_sword', name: 'Wooden Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 1 }, speed: 2.0, value: 5,
        description: 'A simple sword made of wood.\nAttack: +1\nSpeed: 2.0s\n1-Handed'
    },
    'rusty_sword': {
        id: 'rusty_sword', name: 'Rusty Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 3 }, speed: 2.5, value: 15,
        description: 'An old, somewhat effective sword.\nAttack: +3\nSpeed: 2.5s\n1-Handed'
    },
    'iron_greatsword': {
        id: 'iron_greatsword', name: 'Iron Greatsword', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 6 }, speed: 3.5, value: 40,
        description: 'A heavy two-handed sword.\nAttack: +6\nSpeed: 3.5s\n2-Handed'
    },
    'sharp_dagger': {
        id: 'sharp_dagger', name: 'Sharp Dagger', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 2 }, speed: 1.0, value: 20,
        description: 'A quick dagger.\nAttack: +2\nSpeed: 1.0s\n1-Handed'
    },

    // Armor
    'leather_helm': {
        id: 'leather_helm', name: 'Leather Helm', type: 'armor', slot: 'helm',
        stats: { defense: 1 }, value: 8,
        description: 'Basic head protection.\nDefense: +1'
    },
    'iron_helm': {
        id: 'iron_helm', name: 'Iron Helm', type: 'armor', slot: 'helm',
        stats: { defense: 2 }, value: 25,
        description: 'Sturdy metal helmet.\nDefense: +2'
    },
    'leather_armor': {
        id: 'leather_armor', name: 'Leather Armor', type: 'armor', slot: 'body',
        stats: { defense: 2 }, value: 15,
        description: 'Simple body armor.\nDefense: +2'
    },
    'chainmail': {
        id: 'chainmail', name: 'Chainmail', type: 'armor', slot: 'body',
        stats: { defense: 4 }, value: 50,
        description: 'Good protection made of linked rings.\nDefense: +4'
    },
    'cloth_pants': {
        id: 'cloth_pants', name: 'Cloth Pants', type: 'armor', slot: 'legs',
        stats: { defense: 0 }, value: 2,
        description: 'Simple trousers.\nDefense: +0'
    },
    'leather_pants': {
        id: 'leather_pants', name: 'Leather Pants', type: 'armor', slot: 'legs',
        stats: { defense: 1 }, value: 10,
        description: 'Tough leg protection.\nDefense: +1'
    },
    'wooden_shield': {
        id: 'wooden_shield', name: 'Wooden Shield', type: 'armor', slot: 'shield',
        stats: { defense: 1 }, value: 10,
        description: 'A basic shield.\nDefense: +1'
    },
    'iron_shield': {
        id: 'iron_shield', name: 'Iron Shield', type: 'armor', slot: 'shield',
        stats: { defense: 3 }, value: 35,
        description: 'A solid metal shield.\nDefense: +3'
    },


    // Consumables
    'bread': {
        id: 'bread', name: 'Bread', type: 'consumable', useAction: 'Eat',
        healAmount: 3, value: 3,
        description: 'A crusty loaf of bread.\nHeals 3 HP.'
    },
    'fish': {
        id: 'fish', name: 'Fish', type: 'consumable', useAction: 'Eat',
        healAmount: 5, value: 5,
        description: 'A cooked fish.\nHeals 5 HP.'
    },
    'health_potion': {
        id: 'health_potion', name: 'Health Potion', type: 'consumable', useAction: 'Drink',
        healAmount: 15, value: 20, isPotion: true, // isPotion flag prevents combat delay
        description: 'A bubbling red potion.\nHeals 15 HP.\nNo combat delay.'
    },
};

const MONSTERS = {
    'rat': {
        name: 'Giant Rat', health: 8, attack: 2, defense: 0, speed: 1.5, goldDrop: [2, 5],
        lootTable: [
            { itemId: 'bread', chance: 0.50 },
            { itemId: 'fish', chance: 0.50 },
        ]
    },
    'goblin': {
        name: 'Goblin', health: 15, attack: 4, defense: 1, speed: 2.0, goldDrop: [5, 10],
        lootTable: [
            { itemId: 'rusty_sword', chance: 0.05 },
            { itemId: 'leather_helm', chance: 0.05 },
            { itemId: 'bread', chance: 0.15 },
        ]
    },
    'skeleton': {
        name: 'Skeleton', health: 20, attack: 5, defense: 2, speed: 2.5, goldDrop: [8, 15],
        lootTable: [
            { itemId: 'iron_shield', chance: 0.03 },
            { itemId: 'rusty_sword', chance: 0.07 },
        ]
    },
    // Mini-Bosses
    'orc_warrior': {
        name: 'Orc Warrior', health: 40, attack: 7, defense: 3, speed: 3.0, goldDrop: [20, 35],
        lootTable: [
            { itemId: 'iron_greatsword', chance: 0.1 },
            { itemId: 'chainmail', chance: 0.08 },
            { itemId: 'iron_helm', chance: 0.1 },
            { itemId: 'health_potion', chance: 0.2 },
        ]
    },
    'troll': {
        name: 'Cave Troll', health: 60, attack: 9, defense: 2, speed: 3.5, goldDrop: [30, 50],
        lootTable: [
            { itemId: 'iron_greatsword', chance: 0.05 }, // Lower chance for greatsword
            { itemId: 'iron_shield', chance: 0.1 },
            { itemId: 'chainmail', chance: 0.1 },
            { itemId: 'health_potion', chance: 0.3 },
        ]
    },
    // Boss
    'dragon': {
        name: 'Red Dragon', health: 150, attack: 12, defense: 5, speed: 2.5, goldDrop: [100, 150],
        lootTable: [] // Boss doesn't drop items, just win condition
    }
};

// Probabilities for encounters
const ENCOUNTER_PROBABILITY = [
    { type: 'monster', weight: 35 },
    { type: 'rest', weight: 35 },
    { type: 'shop', weight: 15 },
    { type: 'mini-boss', weight: 15 },
];

// Define which monsters are common and which are mini-bosses
const COMMON_MONSTERS = ['rat', 'goblin', 'skeleton'];
const MINI_BOSSES = ['orc_warrior', 'troll'];
const FINAL_BOSS = 'dragon';

// Shop settings
const SHOP_NUM_ITEMS = 3;
const SHOP_REROLL_COST = 10;
// Item pool for shops (can adjust rarity later)
const SHOP_ITEM_POOL = [
    'rusty_sword', 'sharp_dagger', 'iron_greatsword', // Weapons
    'leather_helm', 'iron_helm', 'leather_armor', 'chainmail', // Body/Helm
    'leather_pants', 'wooden_shield', 'iron_shield', // Legs/Shield
    'bread', 'fish', 'health_potion' // Consumables
];