const GRIZZLY_HILLS_MONSTER_DATA = {
    'mountain_goat': {
        name: 'Mountain Goat', health: 18, attack: 2, defense: 2, speed: 1.8, goldDrop: [2, 5],
        difficulty: 'easy',
        description: "A sturdy goat navigating the steep hills.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.6 },
            { itemTier: 'uncommonFood', chance: 0.3 },
            { itemTier: 'commonItem', chance: 0.25 },
        ]
    },
    'mountain_lion': {
        name: 'Mountain Lion', health: 25, attack: 4, defense: 2, speed: 1.2, goldDrop: [4, 8],
        difficulty: 'medium',
        description: "A sleek predator stalking the rocky terrain.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.5 },
            { itemTier: 'uncommonFood', chance: 0.5 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.08 },
        ]
    },
    'wolverine': {
        name: 'Wolverine', health: 22, attack: 4, defense: 3, speed: 1.6, goldDrop: [5, 10],
        difficulty: 'hard',
        hasFerocity: true,
        ferocityDefBonus: 2,
        ferocityDuration: 5,
        description: "A notoriously fierce and tenacious creature.",
        mechanics: "Cornered Ferocity: Gains +2 defense for 5 seconds after taking damage.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.6 },
            { itemTier: 'commonItem', chance: 0.2 },
            { itemTier: 'uncommonItem', chance: 0.1 },
            { itemId: 'minor_attack_potion', chance: 0.05 },
        ]
    },
    // Round 20 Mini-Boss (associated with Grizzly Hills)
    'raging_grizzly': {
        name: 'Raging Grizzly', health: 50, attack: 5, defense: 6, speed: 2.5, goldDrop: [15, 30],
        isMiniBoss: true,
        enrageThreshold: 0.4,
        enrageAttackMultiplier: 3,
        description: "A massive grizzly bear, ferocious when cornered.",
        mechanics: "Becomes enraged below 40% health, attacking with significantly more power!",
        lootTable: [
            { itemTier: 'uncommonItem', chance: 0.3 },
            { itemTier: 'rareItem', chance: 0.1 },
            { itemId: 'ring_of_resilience', chance: 0.05 } 
        ]
    },
}; 