const MONSTERS = {
    ...(typeof SPIDER_CAVE_MONSTER_DATA !== 'undefined' ? SPIDER_CAVE_MONSTER_DATA : {}),
    ...(typeof WOLF_DEN_MONSTER_DATA !== 'undefined' ? WOLF_DEN_MONSTER_DATA : {}),
    ...(typeof GRIZZLY_HILLS_MONSTER_DATA !== 'undefined' ? GRIZZLY_HILLS_MONSTER_DATA : {}),
    ...(typeof GIANTS_PASS_MONSTER_DATA !== 'undefined' ? GIANTS_PASS_MONSTER_DATA : {}),
    ...(typeof DRAGON_PEAK_MONSTER_DATA !== 'undefined' ? DRAGON_PEAK_MONSTER_DATA : {}),
    ...(typeof MISC_MONSTER_DATA !== 'undefined' ? MISC_MONSTER_DATA : {}),
    ...(typeof BLIGHTED_SWAMP_MONSTER_DATA !== 'undefined' ? BLIGHTED_SWAMP_MONSTER_DATA : {}),
};