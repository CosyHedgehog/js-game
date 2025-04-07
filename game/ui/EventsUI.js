class EventsUI {
    constructor(ui) { this.ui = ui; }

    render(choices) {
        this.ui.clearMainArea();
        this.ui.choicesArea.classList.remove('hidden');
        this.ui.choicesArea.innerHTML = '';

        const choicesContainer = document.createElement('div');
        choicesContainer.classList.add('choices-container');

        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.classList.add('choice-card');
            if (index === 0) {
                card.classList.add('selected');
                setTimeout(() => this.ui.game.selectChoice(0), 0);
            }

            const encounter = choice.encounter;
            let difficultyText = '';
            let difficultyClass = '';

            const cardContent = document.createElement('div');
            cardContent.classList.add('choice-card-content');

            if (encounter.type === 'monster') {
                card.classList.add('choice-monster');
                const monster = MONSTERS[encounter.monsterId];
                if (monster && monster.difficulty) {
                    difficultyClass = 'difficulty-' + monster.difficulty; difficultyText = monster.difficulty.toUpperCase();
                } else {
                    difficultyClass = 'difficulty-unknown';
                    difficultyText = '???';
                    console.warn(`Monster ${encounter.monsterId} is missing the difficulty property.`);
                }

                const difficultyBadge = document.createElement('div');
                difficultyBadge.className = `difficulty-badge ${difficultyClass}`;
                difficultyBadge.textContent = difficultyText;
                cardContent.appendChild(difficultyBadge);
            }

            const eventIcon = document.createElement('span');
            eventIcon.className = 'event-icon';
            if (choice.encounter.type === 'monster') {
                const monster = MONSTERS[choice.encounter.monsterId];
                eventIcon.textContent = monster.icon || '⚔️';
            } else {
                switch (choice.encounter.type) {
                    case 'rest': eventIcon.textContent = '🏕️'; break;
                    case 'shop': eventIcon.textContent = '🏪'; break;
                    case 'forge': eventIcon.textContent = '⚒️'; break;
                    case 'fishing': eventIcon.textContent = '🎣'; break;
                    case 'blacksmith': eventIcon.textContent = '🔨'; break;
                    case 'sharpen': eventIcon.textContent = '⚔️'; break;
                    case 'armorsmith': eventIcon.textContent = '🛡️'; break;
                    case 'alchemist': eventIcon.textContent = '⚗️'; break;
                    case 'trap': eventIcon.textContent = '⚡'; break;
                    case 'treasure_chest': eventIcon.textContent = '💎'; break;
                    case 'weapon_merchant': eventIcon.textContent = '🗡️'; break;
                    default: eventIcon.textContent = '❓';
                }
            }
            cardContent.appendChild(eventIcon);

            const title = document.createElement('h3');
            title.classList.add('choice-title');
            title.textContent = choice.text;
            cardContent.appendChild(title);

            const description = document.createElement('div');
            description.classList.add('choice-description');

            if (encounter.type === 'monster') {
                const monster = MONSTERS[encounter.monsterId];
                if (monster) {
                    let descriptionHTML = '';
                    if (monster.description) {
                        descriptionHTML += `<div class="monster-description-summary">${monster.description}</div>`;
                    }

                    descriptionHTML += `<div class="monster-stats-summary">
                        <div>❤️ HP: ${monster.health}</div>
                        <div>⚔️ Atk: ${monster.attack}</div>
                        <div>🛡️ Def: ${monster.defense}</div>
                        <div>⚡ Spd: ${monster.speed}s</div>
                        <div>💰 Gold: ${monster.goldDrop[0]}-${monster.goldDrop[1]}</div>
                    </div>`;
                    if (monster.mechanics) {
                        descriptionHTML += `<div class="monster-mechanics-summary">✨ ${monster.mechanics}</div>`;
                    }
                    description.innerHTML = descriptionHTML;
                } else {
                    description.innerHTML = "Error: Monster data not found.";
                }
            } else {
                description.innerHTML = this.ui.game.getEncounterDetails(encounter);
            }
            cardContent.appendChild(description);

            const startButton = document.createElement('button');
            startButton.className = 'choice-start-button';

            switch (encounter.type) {
                case 'monster':
                    startButton.textContent = 'Fight';
                    if (difficultyClass) {
                        startButton.classList.add(difficultyClass);
                    }
                    break;
                case 'rest': startButton.textContent = 'Rest'; break;
                case 'shop': startButton.textContent = 'Enter Shop'; break;
                case 'forge': startButton.textContent = 'Enter Workshop'; break;
                case 'fishing': startButton.textContent = 'Go Fishing'; break;
                case 'blacksmith': startButton.textContent = 'Visit Blacksmith'; break;
                case 'sharpen': startButton.textContent = 'Use Stone'; break;
                case 'armorsmith': startButton.textContent = 'Use Tools'; break;
                case 'alchemist': startButton.textContent = 'Enter Shop'; break;
                case 'trap': startButton.textContent = 'Investigate'; break;
                case 'treasure_chest': startButton.textContent = 'Open Chest'; break;
                case 'weapon_merchant': startButton.textContent = 'Visit Merchant'; break;
                default: startButton.textContent = 'Start';
            }
            startButton.onclick = (e) => {
                e.stopPropagation();
                this.confirmChoice(index);
            };

            cardContent.appendChild(startButton);

            card.appendChild(cardContent);

            card.addEventListener('click', () => {
                this.ui.choicesArea.querySelectorAll('.choice-card').forEach(c => {
                    c.classList.remove('selected');
                });
                card.classList.add('selected');
                this.ui.game.selectChoice(index);
            });

            choicesContainer.appendChild(card);
        });

        this.ui.choicesArea.appendChild(choicesContainer);
    }

    
    confirmChoice(index) {
        const selectedChoice = this.ui.game.currentChoices[index];
        const choicesArea = document.getElementById('choices-area');
        if (this.ui.roundAreaElement) {
            this.ui.roundAreaElement.classList.remove('round-miniboss', 'round-finalboss');
        }
        if (this.ui.game.currentRound === 10 || this.ui.game.currentRound === 20 || this.ui.game.currentRound === 30) {
            choicesArea.classList.add('encounter-starting');
        }
        const delay = (this.ui.game.currentRound === 10 || this.ui.game.currentRound === 20 || this.ui.game.currentRound === 30) ? 500 : 50;
        setTimeout(() => {
            choicesArea.classList.remove('encounter-starting'); this.ui.game.startEncounter(selectedChoice.encounter);
        }, delay);
    }
}

