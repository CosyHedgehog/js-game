class Starting {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    display() {
        this.ui.clearMainArea();
        const mainContent = document.getElementById('main-content');

        const container = document.createElement('div');
        container.id = 'starting-pack-area';
        container.className = 'starting-pack-selection';

        container.innerHTML = `
            <h3>Choose Your Starting Equipment</h3>
            
            <div class="pack-options-container">
                <div class="pack-option" id="warrior-pack">
                    <h4>Warrior Pack</h4>
                    <p>A defensive focused loadout:</p>
                    <ul>
                        <li data-item-id="wooden_sword">Wooden Sword</li>
                        <li data-item-id="leather_armor">Leather Armor</li>
                        <li data-item-id="leather_legs">Leather Legs</li>
                        <li data-item-id="bread">Bread (3)</li>
                    </ul>
                    <button onclick="game.selectStartingPack('warrior')">Choose Warrior</button>
                </div>
                
                <div class="pack-option" id="fisher-pack">
                    <h4>Fisher Pack</h4>
                    <p>A survival focused loadout:</p>
                    <ul>
                        <li data-item-id="rusty_sword">Rusty Sword</li>
                        <li data-item-id="leather_helm">Leather Helm</li>
                        <li data-item-id="fishing_rod">Fishing Rod</li>
                        <li data-item-id="large_fish">Large Fish (3)</li>
                        <li data-item-id="medium_fish">Medium Fish (2)</li>
                        <li data-item-id="small_fish">Small Fish (2)</li>
                    </ul>
                    <button onclick="game.selectStartingPack('fisher')">Choose Fisher</button>
                </div>
    
                <div class="pack-option" id="blacksmith-pack">
                    <h4>Blacksmith Pack</h4>
                    <p>A crafting focused loadout:</p>
                    <ul>
                        <li data-item-id="rusty_sword">Rusty Sword</li>
                        <li data-item-id="leather_armor">Leather Armor</li>
                        <li data-item-id="blacksmith_hammer">Blacksmith Hammer</li>
                        <li data-item-id="bread">Bread (2)</li>
                        <li data-item-id="small_fish">Small Fish (2)</li>
                    </ul>
                    <button onclick="game.selectStartingPack('blacksmith')">Choose Blacksmith</button>
                </div>
            </div>
            <div class="pack-item-description">
                Click on an item to see its description
            </div>
        `;

        mainContent.appendChild(container);
        this.ui.switchScreen('game-screen');

        // Add click handlers for items
        const items = container.querySelectorAll('li[data-item-id]');
        const descriptionBox = container.querySelector('.pack-item-description');

        items.forEach(item => {
            item.addEventListener('click', () => {
                // Remove selected class from all items
                items.forEach(i => i.classList.remove('selected'));
                // Add selected class to clicked item
                item.classList.add('selected');

                const itemId = item.getAttribute('data-item-id');
                const itemData = ITEMS[itemId];
                if (itemData) {
                    descriptionBox.textContent = itemData.description;
                }
            });
        });
    }
}
