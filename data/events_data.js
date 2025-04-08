const EVENTS_DATA = {
    'monster': {
        weight: 40,
        handler: 'MonsterHandler',
        buttonText: 'Fight'
    },
    'rest': {
        weight: 10,
        choiceText: "Rest Site",
        detailsTemplate: "Rest at this campsite to restore and increase your health.\n\nDo you want to rest here?",
        handler: 'RestHandler',
        icon: '🏕️',
        buttonText: 'Rest'
    },
    'shop': {
        weight: 10,
        choiceText: "Shop",
        detailsTemplate: "Visit a merchant to buy and sell items.\n\nCurrent gold: {{playerGold}}.\n\nEnter shop?",
        handler: 'ShopHandler',
        icon: '🏪',
        buttonText: 'Enter Shop'
    },
    'alchemist': {
        weight: 5,
        choiceText: "Visit Alchemist",
        detailsTemplate: "Visit the Alchemist to buy powerful temporary combat potions. You will be offered one free potion upon entering!\n\nCurrent gold: {{playerGold}}\n\nEnter the Alchemist's shop?",
        handler: 'AlchemistHandler',
        icon: '⚗️',
        buttonText: 'Enter Shop'
    },
    'treasure_chest': {
        weight: 10,
        choiceText: "Treasure Chest",
        detailsTemplate: "You find a sturdy-looking treasure chest. It might be locked.\n\nApproach the chest?",
        handler: 'TreasureHandler',
        icon: '💎',
        buttonText: 'Open Chest'
    },
    'forge': {
        weight: 10,
        choiceText: "Blacksmith Workshop",
        detailsTemplate: "Visit the Blacksmith Workshop to enhance or combine your gear using various stations.\n\nSome stations may require a Blacksmith Hammer.\n\nEnter the workshop?",
        handler: 'ForgeHandler',
        icon: '⚒️',
        buttonText: 'Enter Workshop'
    },
    'fishing': {
        weight: 100,
        choiceText: "Go Fishing!",
        detailsTemplate: "Approach the water's edge. Choose a fishing spot with varying rewards and risks (Requires Fishing Rod for deeper waters). Chance of finding treasures.\n\nGo fishing?",
        handler: 'FishingHandler',
        icon: '🎣',
        buttonText: 'Go Fishing'
    },
    'trap': {
        weight: 10,
        choiceText: "Disarm Trap",
        detailsTemplate: "You notice a set of suspicious traps. You can attempt to disarm them.\n\nInvestigate traps?",
        handler: 'TrapHandler',
        icon: '⚡',
        buttonText: 'Investigate'
    },
    'weapon_merchant': {
        weight: 5,
        choiceText: "Traveling Merchant",
        detailsTemplate: "You see a Traveling Arms Dealer offering a selection of weapons.\n\n{{discountText}}Current gold: {{playerGold}}\n\nApproach the merchant?",
        handler: 'WeaponMerchantHandler',
        needsDiscount: true,
        icon: '🗡️',
        buttonText: 'Visit Merchant'
    }
};