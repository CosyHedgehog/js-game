class Treasure {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.isLocked = false; // Track if the current chest is locked
    }

    handle() {
        this.isLocked = Math.random() < 0.25; // 25% chance to be locked

        if (this.isLocked) {
            this.game.addLog("You find a sturdy treasure chest. It seems to be locked.");
            this.showLockedChestUI();
        } else {
            this.game.addLog("You find a treasure chest!");
            this.openUnlockedChest();
        }
    }

    showLockedChestUI() {
        this.game.state = 'treasure_locked'; // New state for locked chest interaction
        this.ui.clearMainArea();

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
            // Proceed without animation if UI element is missing
            this.game.addLog("Attempting to pick the lock...");
            this.openUnlockedChest();
            return;
        }

        // Disable buttons during animation
        const picklockButton = document.getElementById('treasure-picklock-button');
        const leaveButton = document.getElementById('treasure-leave-button');
        if (picklockButton) picklockButton.disabled = true;
        if (leaveButton) leaveButton.disabled = true;

        treasureContainer.classList.add('picklocking');
        this.game.addLog("Attempting to pick the lock..."); // Log the attempt start

        setTimeout(() => {
            treasureContainer.classList.remove('picklocking');
            // Assuming picklock always succeeds for now
            this.game.addLog("Click! The lock springs open."); // Log success after animation
            this.openUnlockedChest(); // Proceed to open the now unlocked chest
        }, 600); // Must match CSS animation duration (0.6s)
    }

    handleLeaveChest() {
        this.game.addLog("You decide to leave the locked chest alone.");
        this.ui.clearMainArea();
        this.game.proceedToNextRound();
    }

    openUnlockedChest() {
        this.game.state = 'looting'; // Set state for loot screen
        const goldFound = this.game.getRandomInt(5, 25); // Slightly increased gold range
        this.game.addLog(`You open it and find ${goldFound} gold!`);
        this.game.enterLootState(goldFound, []);
    }
}