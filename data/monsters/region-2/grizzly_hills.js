const GRIZZLY_HILLS_MONSTER_DATA = {
    'mountain_goat': {
        name: 'Mountain Goat', 
        health: 18, 
        attack: 2, 
        defense: 2, 
        speed: 1.6, 
        goldDrop: [2, 5],
        difficulty: 'easy',
        description: "A sturdy goat navigating the steep hills.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.70 },
            { itemTier: 'uncommonItem', chance: 0.40 },
        ]
    },
    'mountain_lion': {
        name: 'Mountain Lion', 
        health: 20, 
        attack: 3, 
        defense: 1, 
        speed: 1.4, 
        goldDrop: [4, 11],
        difficulty: 'medium',
        description: "A sleek predator stalking the rocky terrain.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'uncommonItem', chance: 0.70 },
        ]
    },
    'raging_grizzly': {
        name: 'Raging Grizzly', 
        icon: '🐻',
        health: 50, 
        attack: 5, 
        defense: 6, 
        speed: 2.2, 
        goldDrop: [15, 30],
        isMiniBoss: true,
        enrageThreshold: 0.3,
        enrageAttackMultiplier: 3,
        description: "A massive grizzly bear, ferocious when cornered.",
        mechanics: "Becomes enraged below 30% health, attacking with significantly more power!",
        mechanicTooltips: {
            normal: "Enrages at low health.",
            enraged: "ENRAGED! Attacks deal triple damage!"
        },
        lootTable: [
            { itemTier: 'commonFood', chance: 0.50 },
            { itemTier: 'uncommonFood', chance: 1.00 },
            { itemTier: 'commonItem', chance: 0.10 },
            { itemTier: 'uncommonItem', chance: 0.30 },
            { itemTier: 'rareItem', chance: 0.60 },
            { itemId: 'greater_attack_potion', chance: 0.25 },
            { itemId: 'ring_of_might', chance: 0.05 }
        ]
    }
}; 