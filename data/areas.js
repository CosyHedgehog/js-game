const AREA_CONFIG = [
    // Tier 1 (Rounds 1-10)
    {
        startRound: 1,
        endRound: 10, // Inclusive end round
        areas: {
            'spider_cave': {
                name: "Spider Cave",
                tooltip: "A dark cave filled with various species of giant spiders. Watch out for their poison!",
                monsters: ['giant_spider', 'web_weaver', 'poison_crawler'],
                miniBoss: 'venox' // Added mini-boss specific to area
            },
            'wolf_den': {
                name: "Wolf Den",
                tooltip: "A dangerous den inhabited by fierce wolves. Be wary of their swift attacks!",
                monsters: ['dire_wolf', 'wolf_pup', 'feral_hunter'],
                miniBoss: 'silverfang' // Added mini-boss specific to area
            },
        }
    },
    // Tier 2 (Rounds 11-20)
    {
        startRound: 11,
        endRound: 20, // Inclusive end round
        areas: {
            // 'grizzly_hills': {
            //     name: "Grizzly Hills",
            //     tooltip: "Steep hills inhabited by tenacious wildlife.",
            //     monsters: ['mountain_goat', 'mountain_lion', 'wolverine'],
            //     miniBoss: 'raging_grizzly' // Added mini-boss specific to area
            // },
            'giants_pass': {
                name: "Giant's Pass",
                tooltip: "A high mountain pass where colossal beings tread.",
                monsters: ['hill_giant_grunt', 'moss_giant', 'giant_gatekeeper'],
                miniBoss: 'cyclops_stone_thrower' // Added mini-boss specific to area
            },
        }
    },
    // Tier 3 (Rounds 21-30) - Combined with Final Boss
    {
        startRound: 21,
        endRound: 30, // Updated to include final boss round
        areas: {
            'dragon_peak': { 
                name: "Dragon Peak", 
                tooltip: "A treacherous peak shrouded in smoke, leading to the dragon's lair.", 
                monsters: ['flame_whelp', 'stone_drake', 'obsidian_sentinel'],
                finalBoss: 'ancient_dragon'
            }
        }
    }
];