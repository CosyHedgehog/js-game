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
                    <button data-pack-id="warrior">Choose Warrior</button>
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
                    <button data-pack-id="fisher">Choose Fisher</button>
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
                    <button data-pack-id="blacksmith">Choose Blacksmith</button>
                </div>
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

        // --- NEW: Add click handlers for pack selection buttons ---
        const packButtons = container.querySelectorAll('button[data-pack-id]');
        packButtons.forEach(button => {
            button.addEventListener('click', () => {
                const packId = button.getAttribute('data-pack-id');
                this.selectStartingPack(packId); // Call the method on the instance
            });
        });
        // --- End NEW ---
    }

    // Add new method to handle pack selection
    selectStartingPack(packId) {
        this.game.state = 'starting_pack'; // Use game instance
        switch (packId) {
            case 'warrior':
                // Warrior pack: More armor focused
                this.game.player.addItem(this.game.createItem('wooden_sword')); // Use game.player
                this.game.player.addItem(this.game.createItem('leather_armor'));
                this.game.player.addItem(this.game.createItem('leather_legs'));
                this.game.player.addItem(this.game.createItem('bread'));
                this.game.player.addItem(this.game.createItem('bread'));
                this.game.player.addItem(this.game.createItem('bread'));
                break; // Removed clearMainArea, handled by proceeding

            case 'fisher':
                // Fisher pack: Includes fishing rod
                this.game.player.addItem(this.game.createItem('rusty_sword')); // Use game.player
                this.game.player.addItem(this.game.createItem('leather_helm'));
                this.game.player.addItem(this.game.createItem('fishing_rod'));
                this.game.player.addItem(this.game.createItem('large_fish'));
                this.game.player.addItem(this.game.createItem('large_fish'));
                this.game.player.addItem(this.game.createItem('medium_fish'));
                this.game.player.addItem(this.game.createItem('medium_fish'));
                this.game.player.addItem(this.game.createItem('small_fish'));
                break; // Removed clearMainArea

            case 'blacksmith':
                // Blacksmith pack: Includes hammer and some basic resources
                this.game.player.addItem(this.game.createItem('rusty_sword'));
                this.game.player.addItem(this.game.createItem('leather_armor'));
                this.game.player.addItem(this.game.createItem('blacksmith_hammer'));
                this.game.player.addItem(this.game.createItem('bread'));
                this.game.player.addItem(this.game.createItem('bread'));
                this.game.player.addItem(this.game.createItem('small_fish'));
                this.game.player.addItem(this.game.createItem('small_fish'));
                break; // Removed clearMainArea
        }
        
        this.game.currentRound = 0;
        this.game.logMessages = ["Welcome to the Simple Rogue-like!"];
        this.game.state = 'choosing';

        this.ui.renderAll(); // Render everything after items are added
        this.game.addLog("Game started with your chosen equipment.");
        this.ui.clearMainArea(); // Clear the pack selection UI
        this.game.proceedToNextRound(); // Start the first round
    }
}
