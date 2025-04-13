const AREA_CONFIG = [
    {
        startRound: 1,
        endRound: 10,
        areas: {
            'spider_cave': {
                name: "Spider Cave",
                tooltip: "A dark cave filled with various species of giant spiders. Watch out for their poison!",
                monsters: ['giant_spider', 'web_weaver'],
                miniBoss: 'venox'
            },
            'wolf_den': {
                name: "Wolf Den",
                tooltip: "A dangerous den inhabited by fierce wolves. Be wary of their swift attacks!",
                monsters: ['wolf_pup', 'wolf'],
                miniBoss: 'silverfang'
            },
            'blighted_swamp': {
                name: "Blighted Swamp",
                tooltip: "A swamp filled with various creatures that have been corrupted by the blight.",
                monsters: ['giant_frog', 'mutated_mushroom'],
                miniBoss: 'globulus'
            },
        }
    },
    {
        startRound: 11,
        endRound: 20,
        areas: {
            'grizzly_hills': {
                name: "Grizzly Hills",
                tooltip: "Steep hills inhabited by tenacious wildlife.",
                monsters: ['mountain_goat', 'mountain_lion'],
                miniBoss: 'raging_grizzly'
            },
            'giants_pass': {
                name: "Giant's Pass",
                tooltip: "A high mountain pass where colossal beings tread.",
                monsters: ['hill_giant_grunt', 'moss_giant'],
                miniBoss: 'gronk'
            },
            'twisted_forest': {
                name: "Twisted Forest",
                tooltip: "A dense forest where the trees have become sentient and twisted.",
                monsters: ['mountain_goat', 'mountain_lion'],
                miniBoss: 'thornroot'
            }
        }
    },
    {
        startRound: 21,
        endRound: 30,
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