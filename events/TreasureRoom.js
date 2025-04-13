class TreasureRoom {
    // --- Configuration ---
    TOOL_BONUS_CHANCE = 0.30; // 20% bonus from Thief's Tools
    // --- End Configuration ---

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    // Define the different chests available in the room
    CHESTS = {
        treasure: {
            key: 'treasure',
            name: 'Treasure Chest',
            description: 'An unlocked chest, likely holding gold.',
            isTrap: false,
            rewardType: 'gold',
            goldRange: [3, 6] // Example gold range
        },
        rusty: {
            key: 'rusty',
            name: 'Rusty Chest',
            description: 'Looks old, might be trapped. Likely contains leather and wood.',
            isTrap: true,
            disarmChance: 0.8, // Base chance
            damage: 3, // Fixed damage
            requiresTools: false,
            rewardType: 'items',
            itemPool: COMMON_ITEMS, // Use pool constant
            goldRange: [2, 4] // Added gold reward
        },
        wooden: { // Renamed from X chest for clarity
            key: 'wooden',
            name: 'Reinforced Chest',
            description: 'Sturdier than the rusty one. Contains leather, wood and iron.',
            isTrap: true,
            disarmChance: 0.6,
            damage: 5, // Fixed damage
            requiresTools: false,
            rewardType: 'items',
            itemPool: [...COMMON_ITEMS, ...UNCOMMON_ITEMS], // Use combined pool
            goldRange: [3, 5] // Added gold reward
        },
        iron: {
            key: 'iron',
            name: 'Iron Chest',
            description: 'Heavy iron, complex lock. Requires tools. Contains Iron.',
            isTrap: true,
            disarmChance: 0.5,
            damage: 8, // Fixed damage
            requiresTools: true,
            rewardType: 'items',
            itemPool: UNCOMMON_ITEMS, // Use pool constant
            goldRange: [4, 6] // Added gold reward
        },
        steel: {
            key: 'steel',
            name: 'Steel Chest',
            description: 'Masterwork steel, deadly trap. Requires tools. Contains Steel.',
            isTrap: true,
            disarmChance: 0.3,
            damage: 11, // Fixed damage
            requiresTools: true,
            rewardType: 'items',
            itemPool: RARE_ITEMS, // Use pool constant
            goldRange: [5, 7] // Added gold reward
        }
    };

    handle() {
        this.game.state = 'treasure_room';
        this.game.addLog("You enter a room filled with chests of varying make.");
        this.showChestSelectionUI();
    }

    showChestSelectionUI() {
        this.ui.clearMainArea();

        const roomArea = this.ui.treasureRoomArea; // Use a unique ID
        roomArea.innerHTML = ''; // Clear previous content
        roomArea.classList.remove('hidden');

        const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');

        const mainContainerHTML = `
            <div class="treasure-main-container">
                <div class="treasure-icon">🗝️</div> 
                <h3>Treasure Room</h3>
                <p class="treasure-rating-explanation">*Disarm: Success Chance / Failure Damage. Tools required for Iron/Steel.*</p>
                <div class="treasure-choices">
                ${Object.values(this.CHESTS).map(chest => {
                    let isDisabled = false;
                    let disabledCardClass = '';
                    let buttonText = "Open";
                    let successText = "100%";
                    let failureText = "None";
                    // let requiresToolsText = ''; // REMOVED
                    let successChanceClass = 'success-chance'; // For styling
                    let failureDamageClass = 'fail-damage'; // For styling

                    if (chest.isTrap) {
                        buttonText = "Disarm";
                        const baseChance = chest.disarmChance;
                        const adjustedChance = hasTools ? Math.min(1, baseChance + this.TOOL_BONUS_CHANCE) : baseChance;
                        const displayChance = Math.round(adjustedChance * 100);
                        const toolBonusText = (hasTools && baseChance < 1.0) ? ` <span class="tool-bonus">(+${this.TOOL_BONUS_CHANCE * 100}%)</span>` : '';
                        
                        successText = `${displayChance}%${toolBonusText}`;
                        failureText = `${chest.damage} HP`;

                        if (chest.requiresTools && !hasTools) {
                            isDisabled = true;
                            disabledCardClass = 'disabled';
                            // requiresToolsText = `<p class="requirement-missing">Requires: Thief's Tools</p>`; // REMOVED
                        }
                    }

                    return `
                        <div class="treasure-choice-card ${disabledCardClass}" data-key="${chest.key}">
                            <h4>${chest.name}</h4>
                            <p class="treasure-card-desc">${chest.description}</p>
                            <div class="treasure-info-grid">
                                <span class="info-header">Success</span>
                                <span class="info-header">Failure</span>
                                <span class="info-value ${successChanceClass}">${successText}</span>
                                <span class="info-value ${failureDamageClass}">${failureText}</span>
                            </div>
                            <button class="choice-start-button" ${isDisabled ? 'disabled' : ''}>${buttonText}</button> 
                        </div>
                    `;
                }).join('')}
                </div>
            </div>
        `;

        // <button id="treasure-room-leave-button" class="leave-button">Leave Room</button>

        roomArea.innerHTML = mainContainerHTML;

        // Add listeners
        roomArea.querySelectorAll('.treasure-choice-card .choice-start-button').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', () => {
                    const key = button.closest('.treasure-choice-card').dataset.key;
                    this.handleChestInteraction(key);
                });
            }
        });

        // roomArea.querySelector('#treasure-room-leave-button').onclick = () => {
        //     this.game.addLog("You decide to leave the remaining chests.");
        //     this.ui.clearMainArea();
        //     this.game.proceedToNextRound();
        // };
    }

    handleChestInteraction(key) {
        const chest = this.CHESTS[key];
        if (!chest) {
            console.error("Invalid chest key:", key);
            return;
        }

        // Re-check tool requirement just in case
        if (chest.requiresTools && !this.game.player.inventory.some(item => item && item.id === 'thief_tools')) {
             this.game.addLog(`You need Thief's Tools to attempt opening the ${chest.name}.`);
             return; // Prevent interaction if somehow clicked while disabled
        }

        if (chest.isTrap) {
            this.attemptDisarm(chest);
        } else {
            this.openBasicChest(chest);
        }
    }

    openBasicChest(chest) {
        this.game.state = 'looting'; // Or keep as treasure_room? looting seems fine
        const goldFound = this.game.getRandomInt(chest.goldRange[0], chest.goldRange[1]);
        this.game.addLog(`You open the ${chest.name} and find ${goldFound} gold!`);
        this.ui.clearMainArea(); // Clear choices before loot screen
        this.game.enterLootState(goldFound, []);
    }

    attemptDisarm(chest) {
         this.game.addLog(`You attempt to disarm the ${chest.name}...`);
         
         // --- Add slight delay/animation ---
         const roomArea = document.getElementById('treasure-room-area');
         if (roomArea) {
             roomArea.innerHTML = `<div class="disarm-attempt-container"><p>Disarming...</p><div class="spinner"></div></div>`; // Simple feedback
         }
         
         setTimeout(() => {
             const hasTools = this.game.player.inventory.some(item => item && item.id === 'thief_tools');
             let successChance = chest.disarmChance;
             if (hasTools) {
                 successChance += this.TOOL_BONUS_CHANCE;
             }
             successChance = Math.max(0, Math.min(1, successChance)); // Clamp chance between 0 and 1

             const roll = Math.random();

             this.ui.clearMainArea(); // Clear "Disarming..." message

             if (roll <= successChance) {
                 // SUCCESS
                 let rewardItem = null;
                 let goldFound = 0;

                 // Get item from pool
                 if (chest.itemPool && chest.itemPool.length > 0) {
                    const pool = chest.itemPool;
                    const rewardItemId = pool[Math.floor(Math.random() * pool.length)];
                    rewardItem = this.game.createItem(rewardItemId);
                 } else {
                    console.warn(`Chest ${chest.key} disarmed successfully, but itemPool is empty or missing.`);
                 }

                 // Get gold if range exists
                 if (chest.goldRange && chest.goldRange.length === 2) {
                     goldFound = this.game.getRandomInt(chest.goldRange[0], chest.goldRange[1]);
                 }
                 
                 if (rewardItem || goldFound > 0) {
                      let message = `Success! You disarmed the ${chest.name}.`;
                      if (rewardItem && goldFound > 0) {
                        message += ` Found: ${rewardItem.name} and ${goldFound} gold.`;
                      } else if (rewardItem) {
                        message += ` Found: ${rewardItem.name}.`;
                      } else { // Only gold
                        message += ` Found: ${goldFound} gold.`;
                      }
                      this.game.addLog(message);
                      this.game.enterLootState(goldFound, rewardItem ? [rewardItem] : []); // Pass gold and item array
                 } else {
                     this.game.addLog(`Success! You disarmed the ${chest.name}, but it was empty.`);
                     this.game.proceedToNextRound(); 
                 }
                 
             } else {
                 // FAILURE
                 const damageTaken = chest.damage; // Use fixed damage
                 this.game.player.takeRawDamage(damageTaken);
                 
                 // We need a way to show splat *after* failure message is logged and UI updated
                 // Let's log first, then update UI, then maybe show splat in a short timeout?
                 const failMsg = `Failure! The trap triggers on the ${chest.name}, dealing ${damageTaken} damage.`;
                 this.game.addLog(failMsg);
                 
                 this.ui.updatePlayerStats(); // Update stats display immediately

                 // Create a temporary container to show splat before proceeding
                 const failArea = this.ui.treasureRoomArea // Use the same area
                 failArea.innerHTML = `<div class="failure-display"><h3>Trap Triggered!</h3><p>-${damageTaken} HP</p><br/></div>`;
                 failArea.classList.remove('hidden');
                 this.ui.createDamageSplat('.failure-display', damageTaken, 'damage'); // Show splat on the temp message

                 if (this.game.player.health <= 0) {
                     // Delay game over slightly to show message/splat
                      setTimeout(() => {
                         this.game.endGame(false);
                      }, 1500); 
                     return; // Don't proceed further
                 } else {
                      // Add Try Again and Leave buttons after failure
                      const buttonContainer = document.createElement('div');
                      buttonContainer.className = 'failure-button-container';

                      const tryAgainButton = document.createElement('button');
                      tryAgainButton.textContent = "Try Again";
                      tryAgainButton.className = 'try-again-button button'; // Add base .button class if exists
                      tryAgainButton.onclick = () => {
                            // --- CORRECTED: Call handleChestInteraction with the specific chest key ---
                            this.handleChestInteraction(chest.key); 
                            // --- End Correction ---
                      };

                      const leaveButton = document.createElement('button');
                      leaveButton.textContent = "Leave";
                      leaveButton.className = 'leave-button'; // Use global style if available
                      leaveButton.onclick = () => {
                            this.game.addLog("You leave the triggered chest alone.");
                            this.ui.clearMainArea();
                            this.game.proceedToNextRound();
                      };
                      
                      buttonContainer.appendChild(tryAgainButton);
                      buttonContainer.appendChild(leaveButton);
                      failArea.querySelector('.failure-display').appendChild(buttonContainer);
                 }
             }
         }, 800); // Delay for the "Disarming..." message/spinner
    }
} 