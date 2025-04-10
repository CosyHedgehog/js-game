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
            const eventType = encounter.type;
            const eventData = EVENTS_DATA[eventType] || {}; // Get data or empty object
            let difficultyText = '';
            let difficultyClass = '';

            const cardContent = document.createElement('div');
            cardContent.classList.add('choice-card-content');

            if (eventType === 'monster') {
                card.classList.add('choice-monster');
                const monster = MONSTERS[encounter.monsterId];
                if (monster && monster.difficulty) {
                    difficultyClass = 'difficulty-' + monster.difficulty;
                    difficultyText = monster.difficulty.toUpperCase();
                } else {
                    difficultyClass = 'difficulty-unknown';
                    difficultyText = '???';
                    console.warn(`Monster ${encounter.monsterId} is missing difficulty property.`);
                }

                const difficultyBadge = document.createElement('div');
                difficultyBadge.className = `difficulty-badge ${difficultyClass}`;
                difficultyBadge.textContent = difficultyText;
                cardContent.appendChild(difficultyBadge);
            }

            if (eventType === 'weapon_merchant' && encounter.discountPercent) {
                const discountBadge = document.createElement('div');
                discountBadge.className = `difficulty-badge difficulty-easy`;
                discountBadge.textContent = `${encounter.discountPercent}% OFF`;
                discountBadge.style.backgroundColor = '#4CAF50';
                discountBadge.style.position = 'absolute';
                discountBadge.style.top = '8px';
                discountBadge.style.right = '8px';
                discountBadge.style.fontSize = '0.8em';
                discountBadge.style.padding = '3px 6px';
                cardContent.appendChild(discountBadge);
            }

            const eventIcon = document.createElement('span');
            eventIcon.className = 'event-icon';
            if (eventType === 'monster') {
                const monster = MONSTERS[encounter.monsterId];
                eventIcon.textContent = monster?.icon || '⚔️';
            } else {
                eventIcon.textContent = eventData.icon || '❓';
            }
            cardContent.appendChild(eventIcon);

            const title = document.createElement('h3');
            title.classList.add('choice-title');
            title.textContent = choice.text;
            cardContent.appendChild(title);

            const description = document.createElement('div');
            description.classList.add('choice-description');

            if (eventType === 'monster') {
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
            startButton.textContent = eventData.buttonText || 'Start';

            if (eventType === 'monster' && difficultyClass) {
                startButton.classList.add(difficultyClass);
            }

            // Add shrine glow class if applicable
            if (eventType === 'ancient_shrine') {
                startButton.classList.add('shrine-choice');
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

