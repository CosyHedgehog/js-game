document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI(null);
    const game = new Game(ui);
    window.game = game;
    game.player = new Player();
    
    ui.addStatTooltipListeners();
    ui.addCombatUITooltipListeners();
    
    new Starting(game, ui).display();
});