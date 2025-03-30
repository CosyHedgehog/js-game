ENCOUNTERS.monster = createMonsterEncounter('monster');
ENCOUNTERS.miniboss = createMonsterEncounter('mini-boss'),
ENCOUNTERS.boss = createMonsterEncounter('boss')


function createMonsterEncounter(type) {
    return {
        getText: (data) => {
            const suffix = type === 'monster' ? '' : ` (${type === 'boss' ? 'Final Boss' : 'Mini-Boss'})`;
            return `Fight ${MONSTERS[data.monsterId]?.name}${suffix}`;
        },
        getDetails: (data, game) => {
            const monster = MONSTERS[data.monsterId];
            const title = type === 'monster' ? '' : ` (${type.toUpperCase()})`;
            return `${monster.name}${title}\n` +
                   `Health: ${monster.health} // Attack: ${monster.attack} // Defense: ${monster.defense} // Attack Speed: ${monster.speed}s // ` +
                   `Gold Drop: ${monster.goldDrop[0]}-${monster.goldDrop[1]}\n\n` +
                   type === 'boss' ? 'This is the final battle. Are you ready?' :
                   type === 'mini-boss' ? 'A powerful enemy stands before you. Ready to fight?' :
                   'This will start a combat encounter. Are you ready to fight?';
        },
        handle: (game, ui, data) => {
            const monsterData = MONSTERS[data.monsterId];
            if (!monsterData) {
                console.error("Monster data not found:", data.monsterId);
                game.addLog("Error: Encountered an unknown creature.");
                game.proceedToNextRound();
                return;
            }
            const prefix = type === 'boss' ? 'The ' : 
                          type === 'mini-boss' ? 'A powerful ' : '';
            game.addLog(`${prefix}${monsterData.name}${type === 'boss' ? ' towers before you!' : ' appears!'}`);
            game.currentCombat = new Combat(game.player, monsterData, game, ui);
            game.state = 'combat';
            game.currentCombat.start();
        }
    };
}