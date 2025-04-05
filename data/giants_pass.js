const GIANTS_PASS_MONSTER_DATA = {
    'hill_giant_grunt': {
        name: 'Hill Giant Grunt', health: 28, attack: 3, defense: 2, speed: 2.5, goldDrop: [3, 6],
        difficulty: 'easy',
        description: "A dim-witted but large giant wandering the pass.",
        lootTable: [
            { itemTier: 'commonFood', chance: 0.7 },
            { itemTier: 'uncommonFood', chance: 0.2 },
            { itemTier: 'commonItem', chance: 0.2 },
        ]
    },
    'crag_troll': {
        name: 'Crag Troll', health: 35, attack: 5, defense: 3, speed: 2.8, goldDrop: [5, 9],
        difficulty: 'medium',
        description: "A large, regenerating troll hardened by the mountain rock.", // Add regen hint?
        // Optional: Add slow regeneration mechanic later if desired
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.6 },
            { itemTier: 'commonItem', chance: 0.3 },
            { itemTier: 'uncommonItem', chance: 0.1 },
        ]
    },
    'giant_gatekeeper': {
        name: 'Giant Gatekeeper', health: 40, attack: 4, defense: 5, speed: 3.0, goldDrop: [6, 12],
        difficulty: 'hard',
        hasBrace: true, // Flag for the mechanic
        braceDefBonus: 6,
        braceDuration: 5, // Duration in seconds
        braceInterval: 14, // Cooldown in seconds
        description: "A vigilant giant tasked with guarding the pass.",
        mechanics: "Brace: Periodically increases defense by 6 for 5 seconds.",
        lootTable: [
            { itemTier: 'uncommonFood', chance: 0.5 },
            { itemTier: 'commonItem', chance: 0.25 },
            { itemTier: 'uncommonItem', chance: 0.15 },
            { itemId: 'minor_defense_potion', chance: 0.05 },
        ]
    },
    // Round 20 Mini-Boss (associated with Giant's Pass)
    'cyclops_stone_thrower': {
        name: 'Cyclops Stone-Thrower', health: 60, attack: 5, defense: 8, speed: 3.0,
        goldDrop: [20, 35],
        isMiniBoss: true,
        hasTimedStun: true,
        timedStunInterval: 15,
        timedStunDuration: 4,
        description: "A lumbering giant with a single, hateful eye.",
        mechanics: "Hurls a massive boulder every 15 seconds, causing a shockwave that stuns you for 4 seconds!",
        lootTable: [
            { itemId: 'greater_defense_potion', chance: 0.4 }, 
            { itemTier: 'uncommonItem', chance: 0.2 },
            { itemId: 'ring_of_the_guardian', chance: 0.05 } 
        ]
    },
}; 