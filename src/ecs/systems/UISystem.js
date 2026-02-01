export class UISystem {
    constructor() {
        this.scoreEl = document.getElementById('score');
        this.livesEl = document.getElementById('lives');
        this.levelEl = document.getElementById('level');
        this.lastScore = -1;
        this.lastLives = -1;
    }

    update(playingState) {
        if (playingState.score !== this.lastScore) {
            if (this.scoreEl) this.scoreEl.textContent = playingState.score.toString().padStart(5, '0');
            this.lastScore = playingState.score;
        }

        if (playingState.lives !== this.lastLives) {
            if (this.livesEl) {
                // Prevent negative repeat error
                const safeLives = Math.max(0, playingState.lives);
                this.livesEl.textContent = "❤️".repeat(safeLives);
            }
            this.lastLives = playingState.lives;
        }

        if (this.levelEl) {
            this.levelEl.textContent = playingState.level.toString().padStart(2, '0');
        }

        // VISUAL INPUT BUFFER
        const typerDisplay = document.getElementById('typer-display'); // We need to add this ID to HTML or find existing
        // Fallback to finding the input box wrapper if specific ID missing
        const inputWrapper = document.querySelector('.input-box .placeholder');

        if (typerDisplay || inputWrapper) {
            const el = typerDisplay || inputWrapper;
            const buffer = playingState.systems.typer.buffer;

            if (buffer && buffer.length > 0) {
                el.textContent = buffer;
                el.style.opacity = '1';
                el.style.color = '#00f7ff'; // Cyan
                el.style.textShadow = '0 0 10px #00f7ff';
            } else {
                el.textContent = 'TYPE CODE...';
                el.style.opacity = '0.5';
                el.style.color = 'inherit';
                el.style.textShadow = 'none';
            }
        }
    }

    triggerVisualDisturbance() {
        document.body.classList.add('visual-disturbance');
        document.body.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-30deg)';
        setTimeout(() => {
            document.body.classList.remove('visual-disturbance');
            document.body.style.filter = 'none';
        }, 400);
    }
}
