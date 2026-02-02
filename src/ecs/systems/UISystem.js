import { PositionComponent } from '../components.js';

export class UISystem {
    constructor() {
        // textContent elements
        this.scoreEl = document.getElementById('score-display');
        this.levelEl = document.getElementById('level-display');

        // Bar elements
        this.strikeBar = document.getElementById('strike-bar');
        this.integrityBar = document.getElementById('integrity-bar');

        // Input Display
        this.typerInput = document.getElementById('typer');

        this.lastScore = -1;
        this.lastLives = -1;
        this.maxLives = 3;
    }

    update(playingState) {
        // SCORE
        if (playingState.score !== this.lastScore) {
            if (this.scoreEl) this.scoreEl.textContent = playingState.score.toString().padStart(5, '0');
            this.lastScore = playingState.score;
        }

        // LIVES -> STRIKE METER
        // "Strike Meter" implies filling up as you fail. 
        // 3 Lives left = 0% Strike. 0 Lives left = 100% Strike.
        // LIVES -> HEARTS + STRIKE METER
        if (playingState.lives !== this.lastLives) {
            this.updateHearts(playingState.lives);

            if (this.strikeBar) {
                const strikes = this.maxLives - Math.max(0, playingState.lives);
                const pct = (strikes / this.maxLives) * 100;
                this.strikeBar.style.width = `${pct}%`;
            }
            this.lastLives = playingState.lives;
        }

        // DANGER CHECK (Red Vignette)
        const danger = playingState.entityManager.getEntitiesWith(PositionComponent).some(e => {
            const p = e.getComponent(PositionComponent);
            return p.y > window.innerHeight - 300; // Danger Zone
        });

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            if (danger) gameContainer.style.boxShadow = "inset 0 -100px 100px rgba(255, 0, 0, 0.3)";
            else gameContainer.style.boxShadow = "none";
        }

        // LEVEL
        if (this.levelEl) {
            this.levelEl.textContent = playingState.level.toString().padStart(2, '0');
        }

        // INPUT FEEDBACK (Visual only, real input is hidden or handled by InputHandler)
        // If we want the #typer input to show what is typed:
        if (this.typerInput && playingState.systems.typer) {
            const buffer = playingState.systems.typer.buffer;
            // Only update if focused and matching (optional, allows user to type freely conceptually)
            // But since InputHandler captures keys, we should reflect the buffer.
            if (document.activeElement !== this.typerInput) {
                this.typerInput.value = buffer;
            }

            // Add Glow if buffer has content
            if (buffer.length > 0) {
                this.typerInput.style.textShadow = "0 0 10px #00f3ff";
            } else {
                this.typerInput.style.textShadow = "none";
            }
        }
    }

    triggerVisualDisturbance() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.filter = 'hue-rotate(90deg) contrast(1.5)';
            setTimeout(() => {
                gameContainer.style.filter = 'none';
            }, 200);
        }
    }

    updateHearts(lives) {
        // Create container if missing
        if (!this.heartContainer) {
            this.heartContainer = document.getElementById('heart-container');
            if (!this.heartContainer) {
                this.heartContainer = document.createElement('div');
                this.heartContainer.id = 'heart-container';
                this.heartContainer.style.position = 'absolute';
                this.heartContainer.style.top = '20px';
                this.heartContainer.style.right = '40px'; // Top Right
                this.heartContainer.style.zIndex = '100';
                this.heartContainer.style.fontSize = '2rem';
                this.heartContainer.style.color = '#ff0055';
                this.heartContainer.style.textShadow = '0 0 10px #ff0055';
                document.getElementById('game-container').appendChild(this.heartContainer);
            }
        }

        // Render
        const count = Math.max(0, lives);
        let html = '';
        for (let i = 0; i < 3; i++) {
            if (i < count) html += '❤️ ';
            else html += '<span style="opacity:0.2">💔</span> ';
        }
        this.heartContainer.innerHTML = html;
    }

    checkDanger(entityManager) {
        const entities = entityManager.queryComponents([PositionComponent]); // Pseudo
        // Actually we need PositionComponent logic.
        // Assuming we pass PlayingState logic or check entities directly.
    }
}
