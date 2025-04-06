class AnimationUI {
    constructor(ui) { this.ui = ui; }

    playPlayerAnimation(animationClass, duration) {
        const playerSide = document.querySelector('.player-side');
        if (!playerSide) return;
        playerSide.classList.remove(animationClass);
        void playerSide.offsetWidth;
        playerSide.classList.add(animationClass);
        setTimeout(() => {
            if (!playerSide) return;
            playerSide.classList.remove(animationClass);
            if (this.ui.game && this.ui.game.player && this.ui.game.player.activeEffects.burning) {
                playerSide.classList.add('player-burning');
            }
        }, duration);
    }
}
