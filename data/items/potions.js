const POTIONS = {
    'health_potion': {
        id: 'health_potion', name: 'Health Potion', type: 'consumable', useAction: 'Drink', rarity: 'common',
        healAmount: 10, value: 6, isPotion: true,
        description: 'A bubbling green potion.\nHeals 10 HP.\nNo combat delay.'
    },
    'greater_health_potion': {
        id: 'greater_health_potion', name: 'Greater Health Potion', type: 'consumable', useAction: 'Drink', rarity: 'uncommon',
        healAmount: 20, value: 8, isPotion: true,
        description: 'A large healing green potion.\nHeals 20 HP.\nNo combat delay.'
    },
    'attack_potion': {
        id: 'attack_potion', name: 'Attack Potion', type: 'consumable', useAction: 'Drink', rarity: 'common',
        stats: { tempAttack: 1 }, value: 4, isPotion: true,
        description: 'A bubbling red potion.\nGrants +1 Attack. Removed after combat.\nNo combat delay.'
    },
    'greater_attack_potion': {
        id: 'greater_attack_potion', name: 'Greater Attack Potion', type: 'consumable', useAction: 'Drink', rarity: 'rare',
        stats: { tempAttack: 2 }, value: 7, isPotion: true,
        description: 'A swirling crimson potion.\nGrants +2 Attack. Removed after combat.\nNo combat delay.'
    },
    'defense_potion': {
        id: 'defense_potion', name: 'Defense Potion', type: 'consumable', useAction: 'Drink', rarity: 'common',
        stats: { tempDefense: 1 }, value: 4, isPotion: true,
        description: 'A blue protective potion.\nGrants +1 Defense. Removed after combat.\nNo combat delay.'
    },
    'greater_defense_potion': {
        id: 'greater_defense_potion', name: 'Greater Defense Potion', type: 'consumable', useAction: 'Drink', rarity: 'rare',
        stats: { tempDefense: 2 }, value: 7, isPotion: true,
        description: 'A deep azure potion.\nGrants +2 Defense. Removed after combat.\nNo combat delay.'
    },
    'speed_potion': {
        id: 'speed_potion', name: 'Speed Potion', type: 'consumable', useAction: 'Drink', rarity: 'uncommon',
        stats: { tempSpeed: 0.2 }, value: 4, isPotion: true,
        description: 'A fizzing yellow potion.\nReduces attack time by 0.2s. Removed after combat.\nNo combat delay.'
    },
    'greater_speed_potion': {
        id: 'greater_speed_potion', name: 'Greater Speed Potion', type: 'consumable', useAction: 'Drink', rarity: 'rare',
        stats: { tempSpeed: 0.4 }, value: 11, isPotion: true,
        description: 'A fizzing yellow potion.\nReduces attack time by 0.4s. Removed after combat.\nNo combat delay.'
    },
    'restoration_potion': {
        id: 'restoration_potion', name: 'Restoration Potion', type: 'consumable', useAction: 'Drink', rarity: 'uncommon',
        healOverTime: { duration: 30, heal: 1, interval: 2 }, value: 8, isPotion: true,
        description: 'A swirling green potion.\nHeals +1 HP every 2s. Lasts 30s.\nNo combat delay.'
    },
    'greater_restoration_potion': {
        id: 'greater_restoration_potion', name: 'Greater Restoration Potion', type: 'consumable', useAction: 'Drink', rarity: 'rare',
        healOverTime: { duration: 30, heal: 2, interval: 2 }, value: 16, isPotion: true,
        description: 'A potent swirling green potion.\nHeals +2 HP every 2s. Lasts 30s.\nNo combat delay.'
    }
}; 