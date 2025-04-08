// Helper function to filter items by rarity and type
const filterItems = (items, rarity, types) => {
    return Object.keys(items).filter(key => 
        items[key].rarity === rarity && 
        types.includes(items[key].type)
    );
};

const ITEMS = {
    ...WEAPONS,
    ...ARMOR,
    ...POTIONS,
    ...FOOD,
    ...TOOLS
};

// Dynamically generate rarity lists for weapons and armor
const COMMON_ITEMS = filterItems(ITEMS, 'common', ['weapon', 'armor']);
const UNCOMMON_ITEMS = filterItems(ITEMS, 'uncommon', ['weapon', 'armor']);
const RARE_ITEMS = filterItems(ITEMS, 'rare', ['weapon', 'armor']);

// Dynamically generate rarity lists for potions
const COMMON_POTIONS = filterItems(ITEMS, 'common', ['consumable']).filter(key => ITEMS[key].isPotion);
const UNCOMMON_POTIONS = filterItems(ITEMS, 'uncommon', ['consumable']).filter(key => ITEMS[key].isPotion);
const RARE_POTIONS = filterItems(ITEMS, 'rare', ['consumable']).filter(key => ITEMS[key].isPotion);

// Dynamically generate other specific rarity lists
const COMMON_WEAPONS = filterItems(ITEMS, 'common', ['weapon']);
const UNCOMMON_WEAPONS = filterItems(ITEMS, 'uncommon', ['weapon']);
const RARE_WEAPONS = filterItems(ITEMS, 'rare', ['weapon']);

const COMMON_ARMOR = filterItems(ITEMS, 'common', ['armor']);
const UNCOMMON_ARMOR = filterItems(ITEMS, 'uncommon', ['armor']);
const RARE_ARMOR = filterItems(ITEMS, 'rare', ['armor']);

const COMMON_FOOD = filterItems(ITEMS, 'common', ['consumable']).filter(key => !ITEMS[key].isPotion);
const UNCOMMON_FOOD = filterItems(ITEMS, 'uncommon', ['consumable']).filter(key => !ITEMS[key].isPotion);
const RARE_FOOD = filterItems(ITEMS, 'rare', ['consumable']).filter(key => !ITEMS[key].isPotion);

const COMMON_TOOLS = filterItems(ITEMS, 'common', ['tool']);
const UNCOMMON_TOOLS = filterItems(ITEMS, 'uncommon', ['tool']); // Will be empty for now
const RARE_TOOLS = filterItems(ITEMS, 'rare', ['tool']); // Will be empty for now