function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDamage(maxAttack) {
    if (maxAttack <= 0) return 0;
    return getRandomInt(1, maxAttack);
}