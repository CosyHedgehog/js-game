class Forge {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    }

    handle() {
        this.game.state = 'forge';
        this.game.addLog("You approach a versatile forge, capable of various metalwork.");
        this.showForgeChoicesUI();
    }

    showForgeChoicesUI() {
        this.ui.clearMainArea();
        const forgeArea = this.ui.forgeArea;
        forgeArea.id = 'forge-area';        forgeArea.classList.remove('hidden');
        const hasHammer = this.game.player.inventory.some(item => item && item.id === 'blacksmith_hammer');
        const hammerRequirementArmorer = !hasHammer ? '<span class="requirement-missing">(Requires Blacksmith Hammer)</span>' : '';
        const hammerRequirementBlacksmith = !hasHammer ? '<span class="requirement-missing">(Requires Blacksmith Hammer)</span>' : '';

        forgeArea.innerHTML = `
            <div class="forge-container"> 
                     <div class="choice-card"> 
                        <div class="choice-card-content"> 
                            <div class="forge-icon">🗡️</div> 
                            <h4 class="choice-title">Weapon Station</h4>
                        </div>
                        <p class="choice-description">Sharpen a weapon Attack (+1) or hone to increase its Speed (-0.5s).</p>
                        <button id="forge-sharpen-button" class="choice-start-button">Use Stone</button> 
                     </div>
                     <div class="choice-card">
                        <div class="choice-card-content"> 
                            <div class="forge-icon">🔨</div> 
                            <h4 class="choice-title">Armour Station</h4>
                        </div>
                        ${hammerRequirementArmorer}
                        <p class="choice-description">Reinforce armor's Defense (+1) or Fortify its Max Health (+3).</p>
                        <button id="forge-armorer-button" class="choice-start-button" ${!hasHammer ? 'disabled' : ''}>Use Station</button>
                     </div>
                     <div class="choice-card">
                        <div class="choice-card-content"> 
                            <div class="forge-icon">🔥</div> 
                            <h4 class="choice-title">Forge</h4>
                        </div>
                        ${hammerRequirementBlacksmith}
                        <p class="choice-description">Combine two identical items (weapon or armor) into a stronger version.</p>
                        <button id="forge-blacksmith-button" class="choice-start-button" ${!hasHammer ? 'disabled' : ''}>Use Anvil</button>
                     </div>
                 
            </div>
        `;

        document.getElementById('main-content').appendChild(forgeArea);

        const sharpenButton = document.getElementById('forge-sharpen-button');
        sharpenButton.onclick = () => this.goToSharpen();

        const armorerButton = document.getElementById('forge-armorer-button');
        armorerButton.onclick = () => this.goToArmory();

        const blacksmithButton = document.getElementById('forge-blacksmith-button');
        blacksmithButton.onclick = () => this.goToBlacksmith();
    }

    goToSharpen() {
        this.game.addLog("You move to the Sharpening Stone.");
               new Sharpen(this.game, this.ui).handle();
    }

    goToArmory() {
        this.game.addLog("You approach the Armourer Station.");
               new Armoury(this.game, this.ui).handle();
    }

    goToBlacksmith() {
        this.game.addLog("You head towards the Blacksmith's Anvil.");
               new Blacksmith(this.game, this.ui).handle();
    }
}
