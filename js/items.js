function createItem(itemId) {
    const template = ITEMS[itemId];
    if (!template) {
        console.error(`Item template not found for ID: ${itemId}`);
        return null;
    }
    // Simple deep copy for plain objects; use structuredClone for more complex objects if needed
    return JSON.parse(JSON.stringify(template));
}