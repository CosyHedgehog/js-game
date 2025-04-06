class Treasure {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.isLocked = false;    }

    handle() {
        this.isLocked = Math.random() < 0.25;
        if (this.isLocked) {
            this.game.addLog("You find a sturdy treasure chest. It seems to be locked.");
            this.showLockedChestUI();
        } else {
            this.game.addLog("You find a treasure chest!");
            this.openUnlockedChest();
        }
    }

    showLockedChestUI() {
        this.game.state = 'treasure_locked';        this.ui.clearMainArea();

        const treasureArea = this.ui.treasureArea;
        treasureArea.classList.remove('hidden');

        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');

        let buttonsHTML = '';
        if (hasTools) {
            buttonsHTML = `
                <button id="treasure-picklock-button">Picklock</button>
                <button id="treasure-leave-button">Leave Chest</button>
            `;
        } else {
            buttonsHTML = `
                <p>You need Thief's Tools to attempt opening this.</p>
                <button id="treasure-leave-button">Leave Chest</button>
            `;
        }
        treasureArea.innerHTML = `
            <div class="treasure-container locked">
                <h3>Locked Treasure Chest</h3>
                <p>The chest is securely locked. What will you do?</p>
                <div class="treasure-buttons">
                    ${buttonsHTML}
                </div>
            </div>
        `;

        const picklockButton = document.getElementById('treasure-picklock-button');
        if (picklockButton) {
            picklockButton.onclick = () => this.handlePicklock();
        }

        const leaveButton = document.getElementById('treasure-leave-button');
        if (leaveButton) {
            leaveButton.onclick = () => this.handleLeaveChest();
        }
    }

    handlePicklock() {
        const treasureContainer = document.querySelector('#treasure-area .treasure-container');
        if (!treasureContainer) {
            console.error("Treasure container not found for animation.");
                       this.game.addLog("Attempting to pick the lock...");
            this.openUnlockedChest();
            return;
        }

               const picklockButton = document.getElementById('treasure-picklock-button');
        const leaveButton = document.getElementById('treasure-leave-button');
        if (picklockButton) picklockButton.disabled = true;
        if (leaveButton) leaveButton.disabled = true;

        treasureContainer.classList.add('picklocking');
        this.game.addLog("Attempting to pick the lock...");
        setTimeout(() => {
            treasureContainer.classList.remove('picklocking');
                       this.game.addLog("Click! The lock springs open.");            this.openUnlockedChest();        }, 600);    }

    handleLeaveChest() {
        this.game.addLog("You decide to leave the locked chest alone.");
        this.ui.clearMainArea();
        this.game.proceedToNextRound();
    }

    openUnlockedChest() {
        this.game.state = 'looting';        const goldFound = this.game.getRandomInt(1, 10);
        this.game.addLog(`You open it and find ${goldFound} gold!`);
        this.game.enterLootState(goldFound, []);
    }
}