class SplatUI {
    constructor(ui) {
        this.ui = ui;
    }
    
    render(selector, amount, type = 'damage', blocked = 0, fullBlock = false) {
        const container = document.querySelector(selector);
        if (!container) {
            console.error(`Damage splat container not found with selector: ${selector}`);
            return;
        }

        const splat = document.createElement('div');
        splat.className = `damage-splat ${type}`;
        splat.style.position = 'absolute';

        splat.style.left = '50%';

        if (!selector.startsWith('.inventory-slot')) {
            const x = Math.random() * 60 - 20;
            splat.style.setProperty('--splat-offset-x', `${x}px`);
        }

        if (selector.startsWith('.inventory-slot')) {
            splat.style.top = '25%'; splat.classList.add('inventory-splat');
        } else if (selector.includes('.trap-area-option')) {
            splat.style.top = '30%';
        } else if (selector === '#rest-area .rest-campfire-container') {
            splat.style.top = '30%';
        } else if (selector === '.escape-message-container') { splat.style.top = '1%'; } else if (selector === '#trap-area') {
            const y = Math.random() * 60 - 20;
            splat.style.top = `calc(30% + ${y}px)`;
        }
        splat.classList.add(type);
        if (type === 'damage') {
            if (fullBlock) {
                splat.innerHTML = `<span style="color: #aaaaaa">BLOCKED ${blocked}</span>`;
            } else if (amount === 0) {
                splat.textContent = "0";
                splat.classList.add('zero-damage');
            } else {
                splat.textContent = amount;
            }
        } else if (type === 'heal' || type === 'potion-heal') {
            console.log("heal", amount);
            splat.textContent = '+' + amount;
        } else if (type === 'poison' || type === 'burn') { splat.textContent = amount; } else if (type === 'buff-attack') {
            splat.textContent = `+${amount} Atk`;
        } else if (type === 'buff-defense') {
            splat.textContent = `+${amount} Def`;
        } else if (type === 'buff-speed') {
            splat.textContent = `-${amount.toFixed(1)}s Spd`;
        } else {
            splat.textContent = '+' + amount;
        }

        container.appendChild(splat);
        setTimeout(() => splat.remove(), 2000);
    }
}
