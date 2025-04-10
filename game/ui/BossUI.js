class BossUI {
    constructor(ui) { this.ui = ui; }
    
    render(bossData, bossId) {
        this.ui.clearMainArea();
        this.ui.choicesArea.classList.remove('hidden');
        this.ui.choicesArea.innerHTML = '';

        const choicesContainer = document.createElement('div');
        choicesContainer.classList.add('choices-container');
        choicesContainer.classList.add('boss-only');
        const card = document.createElement('div');

        const isFinalBoss = bossData.isBoss === true;
        const isMiniBoss = bossData.isMiniBoss === true;
        card.classList.add('choice-card');
        if (isFinalBoss) {
            card.classList.add('boss-card');
        } else if (isMiniBoss) {
            card.classList.add('miniboss-card');
        }
        card.classList.add('selected');
        const cardContent = document.createElement('div');
        cardContent.classList.add('choice-card-content');

        const difficultyBadge = document.createElement('div');
        difficultyBadge.className = 'difficulty-badge';
        if (isFinalBoss) {
            difficultyBadge.style.backgroundColor = '#f44336'; difficultyBadge.textContent = 'BOSS';
        } else if (isMiniBoss) {
            difficultyBadge.style.backgroundColor = '#FF9800'; difficultyBadge.textContent = 'BOSS';
        } else {
            difficultyBadge.style.display = 'none';
        }
        cardContent.appendChild(difficultyBadge);

        const eventIcon = document.createElement('span');
        eventIcon.className = 'event-icon';
        eventIcon.textContent = bossData.icon;
        cardContent.appendChild(eventIcon);

        const title = document.createElement('h3');
        title.classList.add('choice-title');
        title.textContent = bossData.name;
        cardContent.appendChild(title);

        const description = document.createElement('div');
        description.classList.add('choice-description');
        description.innerHTML = `
            <div class="monster-description">
                <div class="monster-desc-text-wrapper">
                    <p>${bossData.description || 'No description available.'}</p>
                </div>
                <div class="monster-stats-grid">
                    <div class="monster-stat">
                        <span class="stat-icon">❤️ Health</span>
                        <span class="stat-value">${bossData.health}</span>
                        <span class="stat-label">Health</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚔️ Attack</span>
                        <span class="stat-value">${bossData.attack}</span>
                        <span class="stat-label">Attack</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">🛡️ Defense</span>
                        <span class="stat-value">${bossData.defense}</span>
                        <span class="stat-label">Defense</span>
                    </div>
                    <div class="monster-stat">
                        <span class="stat-icon">⚡ Speed</span>
                        <span class="stat-value">${bossData.speed}s</span>
                        <span class="stat-label">Speed</span>
                    </div>
                </div>
                ${bossData.mechanics ? `<div class="monster-special">${bossData.mechanics}</div>` : ''}
            </div>
        `;
        cardContent.appendChild(description);

        const startButton = document.createElement('button');
        startButton.className = 'choice-start-button';
        startButton.textContent = 'Fight';
        startButton.onclick = () => {
            card.classList.add('boss-engage-start');
            setTimeout(() => {
                this.ui.choicesArea.classList.add('hidden');
                this.ui.game.startEncounter({ type: 'monster', monsterId: bossId });
            }, 500);
        };
        cardContent.appendChild(startButton);

        card.appendChild(cardContent);
        choicesContainer.appendChild(card);
        this.ui.choicesArea.appendChild(choicesContainer);
    }
}


// render(bossData) {
//     this.ui.clearMainArea();
//     this.ui.choicesArea.classList.remove('hidden');
//     this.ui.choicesArea.innerHTML = '';

//     const choicesContainer = document.createElement('div');
//     choicesContainer.classList.add('choices-container');
//     choicesContainer.classList.add('boss-only');
//     const card = document.createElement('div');

//     const isFinalBoss = bossData.isBoss === true;
//     const isMiniBoss = bossData.isMiniBoss === true;
//     card.classList.add('choice-card');
//     if (isFinalBoss) {
//         card.classList.add('boss-card');
//     } else if (isMiniBoss) {
//         card.classList.add('miniboss-card');
//     }
//     card.classList.add('selected');
//     const cardContent = document.createElement('div');
//     cardContent.classList.add('choice-card-content');

//     const difficultyBadge = document.createElement('div');
//     difficultyBadge.className = 'difficulty-badge';
//     if (isFinalBoss) {
//         difficultyBadge.style.backgroundColor = '#f44336'; difficultyBadge.textContent = 'BOSS';
//     } else if (isMiniBoss) {
//         difficultyBadge.style.backgroundColor = '#FF9800'; difficultyBadge.textContent = 'MINI-BOSS';
//     } else {
//         difficultyBadge.style.display = 'none';
//     }
//     cardContent.appendChild(difficultyBadge);

//     const eventIcon = document.createElement('span');
//     eventIcon.className = 'event-icon';
//     eventIcon.textContent = bossData.icon;
//     cardContent.appendChild(eventIcon);

//     const title = document.createElement('h3');
//     title.classList.add('choice-title');
//     title.textContent = bossData.name;
//     cardContent.appendChild(title);

//     const description = document.createElement('div');
//     description.classList.add('choice-description');
//     description.innerHTML = `
//         <div class="monster-description">
//             <div class="monster-desc-text-wrapper">
//             <p>${bossData.description || 'No description available.'}</p>
//             </div>
//             <div class="monster-stats-grid">
//                 <div class="monster-stat">
//                     <span class="stat-icon">❤️ Health</span>
//                     <span class="stat-value">${bossData.health}</span>
//                     <span class="stat-label">Health</span>
//             </div>
//                 <div class="monster-stat">
//                     <span class="stat-icon">⚔️ Attack</span>
//                     <span class="stat-value">${bossData.attack}</span>
//                     <span class="stat-label">Attack</span>
//         </div>
//                 <div class="monster-stat">
//                     <span class="stat-icon">🛡️ Defense</span>
//                     <span class="stat-value">${bossData.defense}</span>
//                     <span class="stat-label">Defense</span>
//                 </div>
//                 <div class="monster-stat">
//                     <span class="stat-icon">⚡ Speed</span>
//                     <span class="stat-value">${bossData.speed}s</span>
//                     <span class="stat-label">Speed</span>
//                 </div>
//             </div>
//             ${bossData.mechanics ? `<div class="monster-special">${bossData.mechanics}</div>` : ''}
//         </div>
//     `;
//     cardContent.appendChild(description);

//     const startButton = document.createElement('button');
//     startButton.className = 'choice-start-button';
//     if (isFinalBoss) {
//         startButton.textContent = 'Fight';
//     } else if (isMiniBoss) {
//         startButton.textContent = 'Fight';
//     } else {
//         startButton.textContent = 'Fight';
//     }
//     startButton.onclick = () => {
//         card.classList.add('boss-engage-start');
//         setTimeout(() => {
//             this.ui.choicesArea.classList.add('hidden');
//             this.ui.game.startEncounter({ type: 'monster', monsterId: bossData.id });
//         }, 500);
//     };
//     cardContent.appendChild(startButton);

//     card.appendChild(cardContent);
//     choicesContainer.appendChild(card);
//     this.ui.choicesArea.appendChild(choicesContainer);
// }