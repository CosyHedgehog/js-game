function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDamage(maxAttack) {
    if (maxAttack <= 0) return 0;
    return getRandomInt(1, maxAttack);
}

function createItem(itemId) {
    const template = ITEMS[itemId];
    if (!template) {
        console.error(`Item template not found for ID: ${itemId}`);
        return null;
    }
    // Simple deep copy for plain objects; use structuredClone for more complex objects if needed
    return JSON.parse(JSON.stringify(template));
}