const COMMON_ITEMS = ['wooden_dagger', 'wooden_sword', 'wooden_hammer', 'wooden_shield', 'leather_helm', 'leather_armor', 'leather_legs']
const UNCOMMON_ITEMS = ['iron_dagger', 'iron_sword', 'iron_hammer', 'iron_helm', 'iron_armor', 'iron_legs']
const RARE_ITEMS = ['steel_dagger', 'steel_sword', 'steel_hammer', 'steel_helm', 'steel_armor', 'steel_legs', 'steel_shield']

const COMMON_FOOD = ['bread', 'small_fish']
const UNCOMMON_FOOD = ['medium_fish', 'cooked_meat']
const RARE_FOOD = ['large_fish']

const COMMON_TOOLS = ['fishing_rod', 'blacksmith_hammer', 'thief_tools']

const COMMON_POTIONS = ['health_potion', 'attack_potion', 'defense_potion', 'speed_potion']
const UNCOMMON_POTIONS = ['greater_health_potion', 'greater_attack_potion', 'greater_defense_potion', 'greater_speed_potion']


const ITEMS = {
       'rusty_sword': {
        id: 'rusty_sword', name: 'Rusty Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 1 }, speed: 2.0, value: 4,
        description: 'A somewhat rusted sword.\nAttack: +1\nSpeed: 2.0s\n1-Handed'
    },
    'wooden_dagger': {
        id: 'wooden_dagger', name: 'Wooden Dagger', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 1 }, speed: 1.4, value: 4,
        description: 'A lightweight wooden dagger.\nAttack: +1\nSpeed: 1.4s\n1-Handed'
    },
    'wooden_sword': {
        id: 'wooden_sword', name: 'Wooden Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 2 }, speed: 1.5, value: 5,
        description: 'A simple sword made of wood.\nAttack: +2\nSpeed: 1.5s\n1-Handed'
    },
    'wooden_hammer': {
        id: 'wooden_hammer', name: 'Wooden Hammer', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 3 }, speed: 2.5, value: 6,
        description: 'A heavy wooden hammer.\nAttack: +4\nSpeed: 3.0s\n2-Handed'
    },
    'wooden_shield': {
        id: 'wooden_shield', name: 'Wooden Shield', type: 'armor', slot: 'shield',
        stats: { defense: 1 }, value: 4,
        description: 'A basic shield.\nDefense: +1'
    },
    'leather_helm': {
        id: 'leather_helm', name: 'Leather Helm', type: 'armor', slot: 'helm',
        stats: { defense: 1 }, value: 4,
        description: 'Basic head protection.\nDefense: +1'
    },
    'leather_armor': {
        id: 'leather_armor', name: 'Leather Armor', type: 'armor', slot: 'body',
        stats: { defense: 2 }, value: 5,
        description: 'Simple body armor.\nDefense: +2'
    },
    'leather_legs': {
        id: 'leather_legs', name: 'Leather Legs', type: 'armor', slot: 'legs',
        stats: { defense: 1 }, value: 4,
        description: 'Basic leg protection.\nDefense: +1'
    },
       'iron_dagger': {
        id: 'iron_dagger', name: 'Iron Dagger', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 2 }, speed: 1.4, value: 9,
        description: 'A standard iron dagger.\nAttack: +2\nSpeed: 1.4s\n1-Handed'
    },
    'iron_sword': {
        id: 'iron_sword', name: 'Iron Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 3 }, speed: 2.0, value: 10,
        description: 'A reliable iron sword.\nAttack: +3\nSpeed: 2.0s\n1-Handed'
    },
    'iron_hammer': {
        id: 'iron_hammer', name: 'Iron Hammer', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 5 }, speed: 3.0, value: 14,
        description: 'A weighty iron hammer.\nAttack: +5\nSpeed: 3.0s\n2-Handed'
    },
    'iron_helm': {
        id: 'iron_helm', name: 'Iron Helm', type: 'armor', slot: 'helm',
        stats: { defense: 2 }, value: 8,
        description: 'Sturdy metal helmet.\nDefense: +2'
    },
    'iron_armor': {
        id: 'iron_armor', name: 'Iron Armor', type: 'armor', slot: 'body',
        stats: { defense: 3 }, value: 12,
        description: 'Solid iron protection.\nDefense: +3'
    },
    'iron_legs': {
        id: 'iron_legs', name: 'Iron Legs', type: 'armor', slot: 'legs',
        stats: { defense: 2 }, value: 9,
        description: 'Sturdy leg protection.\nDefense: +2'
    },
    'iron_shield': {
        id: 'iron_shield', name: 'Iron Shield', type: 'armor', slot: 'shield',
        stats: { defense: 2 }, value: 10,
        description: 'A solid metal shield.\nDefense: +2'
    },
       'steel_dagger': {
        id: 'steel_dagger', name: 'Steel Dagger', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 3 }, speed: 1.4, value: 14,
        description: 'A fine steel dagger.\nAttack: +3\nSpeed: 1.4s\n1-Handed'
    },
    'steel_sword': {
        id: 'steel_sword', name: 'Steel Sword', type: 'weapon', slot: 'weapon', hands: 1,
        stats: { attack: 4 }, speed: 2.0, value: 15,
        description: 'A well-crafted steel sword.\nAttack: +4\nSpeed: 2.0s\n1-Handed'
    },
    'steel_hammer': {
        id: 'steel_hammer', name: 'Steel Hammer', type: 'weapon', slot: 'weapon', hands: 2,
        stats: { attack: 6 }, speed: 3.0, value: 20,
        description: 'A powerful steel hammer.\nAttack: +6\nSpeed: 3.0s\n2-Handed'
    },
    'steel_helm': {
        id: 'steel_helm', name: 'Steel Helm', type: 'armor', slot: 'helm',
        stats: { defense: 3 }, value: 15,
        description: 'Superior head protection.\nDefense: +3'
    },
    'steel_armor': {
        id: 'steel_armor', name: 'Steel Armor', type: 'armor', slot: 'body',
        stats: { defense: 4 }, value: 20,
        description: 'Superior body protection.\nDefense: +4'
    },
    'steel_legs': {
        id: 'steel_legs', name: 'Steel Legs', type: 'armor', slot: 'legs',
        stats: { defense: 3 }, value: 16,
        description: 'Superior leg protection.\nDefense: +3'
    },
    'steel_shield': {
        id: 'steel_shield', name: 'Steel Shield', type: 'armor', slot: 'shield',
        stats: { defense: 3 }, value: 17,
        description: 'A superior shield.\nDefense: +3'
    },
       'bread': {
        id: 'bread', name: 'Bread', type: 'consumable', useAction: 'Eat',
        healAmount: 3, value: 2,
        description: 'A crusty loaf of bread.\nHeals 3 HP.'
    },
    'cooked_meat': {
        id: 'cooked_meat', name: 'Cooked Meat', type: 'consumable', useAction: 'Eat',
        healAmount: 8, value: 3,
        description: 'A piece of cooked meat.\nHeals 8 HP.'
    },
    'small_fish': {
        id: 'small_fish', name: 'Small Fish', type: 'consumable', useAction: 'Eat',
        healAmount: 3, value: 1,
        description: 'A tiny fish.\nHeals 2 HP.'
    },
    'medium_fish': {
        id: 'medium_fish', name: 'Medium Fish', type: 'consumable', useAction: 'Eat',
        healAmount: 5, value: 2,
        description: 'A decent-sized fish.\nHeals 5 HP.'
    },
    'large_fish': {
        id: 'large_fish', name: 'Large Fish', type: 'consumable', useAction: 'Eat',
        healAmount: 8, value: 4,
        description: 'An impressive fish.\nHeals 8 HP.'
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
    'attack_potion': {
        id: 'attack_potion', name: 'Attack Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempAttack: 1 }, value: 5, isPotion: true,
        description: 'A bubbling red potion.\nGrants +1 Attack. Removed after combat.\nNo combat delay.'
    },
    'greater_attack_potion': {
        id: 'greater_attack_potion', name: 'Greater Attack Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempAttack: 2 }, value: 10, isPotion: true,
        description: 'A swirling crimson potion.\nGrants +2 Attack. Removed after combat.\nNo combat delay.'
    },
    'defense_potion': {
        id: 'defense_potion', name: 'Defense Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempDefense: 1 }, value: 5, isPotion: true,
        description: 'A blue protective potion.\nGrants +1 Defense. Removed after combat.\nNo combat delay.'
    },
    'greater_defense_potion': {
        id: 'greater_defense_potion', name: 'Greater Defense Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempDefense: 2 }, value: 10, isPotion: true,
        description: 'A deep azure potion.\nGrants +2 Defense. Removed after combat.\nNo combat delay.'
    },
    'speed_potion': {
        id: 'speed_potion', name: 'Speed Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempSpeed: 0.2 }, value: 5, isPotion: true,
        description: 'A fizzing yellow potion.\nReduces attack time by 0.2s. Removed after combat.\nNo combat delay.'
    },
    'greater_speed_potion': {
        id: 'speed_potion', name: 'Greater Speed Potion', type: 'consumable', useAction: 'Drink',
        stats: { tempSpeed: 0.4 }, value: 15, isPotion: true,
        description: 'A fizzing yellow potion.\nReduces attack time by 0.4s. Removed after combat.\nNo combat delay.'
    },

       'fishing_rod': {
        id: 'fishing_rod', name: 'Fishing Rod', type: 'tool', value: 2,
        description: 'A simple fishing rod.\nRequired for fishing.'
    },
    'blacksmith_hammer': {
        id: 'blacksmith_hammer', name: 'Blacksmith Hammer',type: 'tool', value: 2,
        description: 'A sturdy hammer.\nRequired for blacksmithing and armoury.'
    },
    'thief_tools': {
        id: 'thief_tools', name: "Thief's Tools", type: 'tool', value: 3,
        description: 'A set of tools for delicate work.\nIncreases trap disarm chance by 20%.'
    },

       'ring_of_the_dragon': {        id: 'ring_of_the_dragon', name: 'Dragon Ring', type: 'armor', slot: 'ring',
        stats: { attack: 2, defense: 2 }, value: 50,
        description: 'A powerful ring imbued with dragon magic.\nAttack: +2\nDefense: +2'
    }
};