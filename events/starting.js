class Starting {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    STARTING_PACKS = {
        warrior: {
            name: 'Warrior Pack',
            description: 'A defensive focused loadout:',
            stats: {
                maxHealth: 25,
                health: 15,
                baseAttack: 2,
                baseDefense: 1,
            },
            items: [
                { id: 'wooden_sword', count: 1 },
                { id: 'leather_armor', count: 1 },
                { id: 'leather_legs', count: 1 },
                { id: 'bread', count: 3 }
            ]
        },
        fisher: {
            name: 'Fisher Pack',
            description: 'A survival focused loadout:',
            stats: {
                maxHealth: 20,
                health: 20,
                baseAttack: 1,
                baseDefense: 1,
                startingGold: 5
            },
            items: [
                { id: 'rusty_sword', count: 1 },
                { id: 'leather_helm', count: 1 },
                { id: 'fishing_rod', count: 1 },
                { id: 'large_fish', count: 3 },
                { id: 'medium_fish', count: 2 },
                { id: 'small_fish', count: 2 }
            ]
        },
        blacksmith: {
            name: 'Blacksmith Pack',
            description: 'A crafting focused loadout:',
            stats: {
                maxHealth: 25,
                health: 15,
                baseAttack: 0,
                baseDefense: 2,
            },
            items: [
                { id: 'wooden_hammer', count: 1 },
                { id: 'leather_armor', count: 1 },
                { id: 'blacksmith_hammer', count: 1 },
                { id: 'bread', count: 2 },
                { id: 'small_fish', count: 2 }
            ]
        },
        thief: {
            name: 'Thief Pack',
            description: 'A stealth and trap focused loadout:',
            stats: {
                maxHealth: 15,
                health: 10,
                baseAttack: 2,
                baseDefense: 0,
                startingGold: 10
            },
            items: [
                { id: 'wooden_dagger', count: 1 },
                { id: 'leather_helm', count: 1 },
                { id: 'thief_tools', count: 1 },
                { id: 'speed_potion', count: 1 },
                { id: 'bread', count: 2 }
            ]
        }
    };

    display() {
        this.ui.clearMainArea();
        const mainContent = document.getElementById('main-content');

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
                        <span>${pack.stats.maxHealth}</span>
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
                        <span>Starting Gold</span>
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
            <h3>Choose Your Starting Equipment</h3>
            <div class="pack-options-container">
                ${packOptions}
            </div>
            <div class="pack-item-description">
                Click on an item to see its description
            </div>
        `;

        mainContent.appendChild(container);
        this.ui.switchScreen('game-screen');

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
        });

        const packButtons = container.querySelectorAll('button[data-pack-id]');
        packButtons.forEach(button => {
            button.addEventListener('click', () => {
                const packId = button.getAttribute('data-pack-id');
                this.selectStartingPack(packId);
            });
        });
    }

    selectStartingPack(packId) {
        this.game.state = 'starting_pack';
        const pack = this.STARTING_PACKS[packId];

        this.game.player.maxHealth = pack.stats.maxHealth;
        this.game.player.health = pack.stats.health;
        this.game.player.baseAttack = pack.stats.baseAttack;
        this.game.player.baseDefense = pack.stats.baseDefense;

        if (pack.stats.startingGold) {
            this.game.player.addGold(pack.stats.startingGold);
        }

        pack.items.forEach(item => {
            for (let i = 0; i < item.count; i++) {
                this.game.player.addItem(this.game.createItem(item.id));
            }
        });
        
        this.game.currentRound = 0;
        this.game.logMessages = ["Welcome to the Simple Rogue-like!"];
        this.game.state = 'choosing';

        this.ui.renderAll();
        this.game.addLog("Game started with your chosen equipment.");
        this.ui.clearMainArea();
        this.game.proceedToNextRound();
    }
}
