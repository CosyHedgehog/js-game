class Starting {
    constructor(ui) {
        this.ui = ui;
    }

    STARTING_PACKS = {
        warrior: {
            name: 'Warrior',
            description: 'A balanced fighter.',
            stats: {
                maxHealth: 15,
                health: 150,
                baseAttack: 10,
                baseDefense: 10,
            },
            items: [
                { id: 'wooden_sword', count: 1 },
                { id: 'wooden_shield', count: 1 },
                { id: 'bread', count: 3 },
                { id: 'blacksmith_hammer', count: 1 },
            ]
        },
        // fisher: {
        //     name: 'Fisher',
        //     description: 'A resourceful adventurer.',
        //     stats: {
        //         maxHealth: 20,
        //         health: 20,
        //         baseAttack: 1,
        //         baseDefense: 1,
        //         startingGold: 5
        //     },
        //     items: [
        //         { id: 'fishing_rod', count: 1 },
        //         { id: 'large_fish', count: 3 },
        //         { id: 'medium_fish', count: 3 },
        //     ]
        // },
        // blacksmith: {
        //     name: 'Blacksmith',
        //     description: 'A sturdy craftsman.',
        //     stats: {
        //         maxHealth: 25,
        //         health: 25,
        //         baseAttack: 0,
        //         baseDefense: 3,
        //     },
        //     items: [
        //         { id: 'wooden_hammer', count: 1 },
        //         { id: 'blacksmith_hammer', count: 1 },
        //         { id: 'cooked_meat', count: 2 },
        //     ]
        // },
        // thief: {
        //     name: 'Thief',
        //     description: 'A swift tactician.',
        //     stats: {
        //         maxHealth: 15,
        //         health: 10,
        //         baseAttack: 3,
        //         baseDefense: 0,
        //         startingGold: 10
        //     },
        //     items: [
        //         { id: 'wooden_dagger', count: 1 },
        //         { id: 'thief_tools', count: 1 },
        //         { id: 'speed_potion', count: 1 },
        //         { id: 'attack_potion', count: 1 },
        //     ]
        // }
    };

    render(game) {
        this.ui.clearMainArea();
        const container = document.createElement('div');
        container.id = 'starting-pack-area';
        container.className = 'starting-pack-selection';

        const packOptions = Object.entries(this.STARTING_PACKS).map(([packId, pack]) => `
            <div class="pack-option" id="${packId}-pack" data-pack-id="${packId}">
                <h4>${pack.name}</h4>
                <p>${pack.description}</p>
                <div class="pack-stats">
                    <div>
                        <span>HP</span>
                        <span>${pack.stats.health}/${pack.stats.maxHealth}</span>
                    </div>
                    <div>
                        <span>Attack</span>
                        <span>${pack.stats.baseAttack}</span>
                    </div>
                    <div>
                        <span>Defense</span>
                        <span>${pack.stats.baseDefense}</span>
                    </div>
                    <div>
                        <span>Gold</span>
                        <span>${pack.stats.startingGold ? pack.stats.startingGold : 0}</span>
                    </div>
                </div>
                <ul>
                    ${pack.items.map(item => `
                        <li data-item-id="${item.id}">
                            <span class="item-name">${ITEMS[item.id].name}</span>
                            ${item.count > 1 ? `<span class="item-count">(${item.count})</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
                <button data-pack-id="${packId}">Choose ${pack.name.split(' ')[0]}</button>
            </div>
        `).join('');

        container.innerHTML = `
            <h3>Choose Your Starting Pack</h3>
            <div class="pack-options-container">
                ${packOptions}
            </div>
            <div class="pack-item-description">
                Click on an item to see its description
            </div>
        `;

        document.body.appendChild(container);
        // this.ui.switchScreen('game-screen');

        const items = container.querySelectorAll('li[data-item-id]');
        const descriptionBox = container.querySelector('.pack-item-description');

        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                const itemId = item.getAttribute('data-item-id');
                const itemData = ITEMS[itemId];
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                }
            });

            item.addEventListener('mouseenter', () => {
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');

                const itemId = item.getAttribute('data-item-id');
                const itemData = ITEMS[itemId];
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                }
            });
        });

        const packButtons = container.querySelectorAll('button[data-pack-id]');
        packButtons.forEach(button => {
            button.addEventListener('click', () => {
                const packId = button.getAttribute('data-pack-id');
                this.selectStartingPack(game, packId);
            });
        });
    }

    selectStartingPack(game, packId) {
        game.state = 'starting_pack';
        const pack = this.STARTING_PACKS[packId];
        const selectedPack = document.getElementById(`${packId}-pack`);
        
        selectedPack.classList.add('selected');
        
        setTimeout(() => {
            game.player.maxHealth = pack.stats.maxHealth;
            game.player.health = pack.stats.health;
            game.player.baseAttack = pack.stats.baseAttack;
            game.player.baseDefense = pack.stats.baseDefense;

            if (pack.stats.startingGold) {
                game.player.addGold(pack.stats.startingGold);
            }

            pack.items.forEach(item => {
                for (let i = 0; i < item.count; i++) {
                    game.player.addItem(game.createItem(item.id));
                }
            });
            
            game.currentRound = 18;
            game.logMessages = ["Welcome to the Simple Rogue-like!"];        
            game.state = 'area_transition';
            
            const firstTier = AREA_CONFIG[0];
            let initialAreaId = 'unknown_area';
            let initialAreaName = 'Unknown Area';
            if (firstTier && firstTier.areas) {
                const firstTierAreaIds = Object.keys(firstTier.areas);
                if (firstTierAreaIds.length > 0) {
                   const initialAreaIndex = Math.floor(Math.random() * firstTierAreaIds.length);
                   initialAreaId = firstTierAreaIds[initialAreaIndex];
                   initialAreaName = firstTier.areas[initialAreaId]?.name || initialAreaId.replace('_', ' ');
                }
            }
            // this.game.currentArea = initialAreaId;
            // this.game.pendingAreaTransitionName = initialAreaName;
            game.currentArea = "giants_pass";
            game.pendingAreaTransitionName = "Giants pass";
            
            this.ui.startScreen?.classList.add('hidden');
            this.ui.gameScreen?.classList.add('hidden');
            this.ui.endScreen?.classList.add('hidden');
            document.getElementById('game-screen')?.classList.remove('hidden');

            this.ui.renderInventory();
            this.ui.renderEquipment();
            this.ui.updatePlayerStats();

            game.addLog("Game started with your chosen equipment.");
            this.ui.renderArea(game.pendingAreaTransitionName);
        }, 500);
    }
}
