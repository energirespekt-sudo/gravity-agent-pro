
export class WarningState {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.timer = 0;
        this.duration = 4000; // 4 seconds
        this.nextState = null;
        this.message = "WARNING";
    }

    enter(params) {
        console.log("⚠️ ENTERING WARNING STATE");
        this.active = true;
        this.timer = 0;
        this.nextState = params.nextState || 'playing';
        this.message = params.message || "WARNING: SIGNAL DETECTED";

        // Create UI
        this.createUI();

        // Sound
        if (window.soundManager) {
            // Placeholder for new track, using boss intro or deep tone
            // window.soundManager.playWarningAmbience(); 
        }
    }

    createUI() {
        this.el = document.createElement('div');
        this.el.className = 'warning-screen';
        this.el.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">${this.message}</div>
                <div class="warning-subtext">PREPARE FOR INTERCEPT</div>
                <div class="loading-bar"><div class="loading-fill"></div></div>
            </div>
        `;
        document.body.appendChild(this.el);

        // Add class to body for global effects (e.g. red tint)
        document.body.classList.add('warning-mode');
    }

    update(dt) {
        if (!this.active) return;

        this.timer += dt;

        // Update Loading Bar
        const fill = this.el.querySelector('.loading-fill');
        if (fill) {
            const pct = Math.min(100, (this.timer / this.duration) * 100);
            fill.style.width = `${pct}%`;
        }

        if (this.timer >= this.duration) {
            this.exit();
            if (this.game && this.game.fsm) {
                this.game.fsm.change(this.nextState);
            }
        }
    }

    exit() {
        this.active = false;
        if (this.el) this.el.remove();
        document.body.classList.remove('warning-mode');
    }
}
