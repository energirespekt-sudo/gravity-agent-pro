
export class LoreState {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.nextLevel = 12;
        this.loreText = [
            "ARCHITECT SILENCED.",
            "BLUEPRINTS FOR A PERFECT REALITY EXCLUDED HUMANITY.",
            "SOURCE CODE RECLAIMED.",
            "SYSTEM STABILIZING..."
        ];
    }

    enter(params) {
        console.log("📘 ENTERING LORE STATE");
        this.active = true;
        this.nextLevel = params.nextLevel || 12;

        // Music - Calm
        if (window.soundManager) {
            // window.soundManager.playLoreMusic(); 
        }

        this.createUI();

        // Input
        this.boundHandleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.boundHandleInput);
    }

    createUI() {
        this.el = document.createElement('div');
        this.el.className = 'lore-screen';
        this.el.innerHTML = `
            <div class="lore-container">
                <div class="lore-header">MISSION LOG UPDATED</div>
                <div class="lore-content">
                    ${this.loreText.map(line => `<div class="lore-line">${line}</div>`).join('')}
                </div>
                <div class="lore-footer">PRESS [ENTER] TO CONTINUE</div>
            </div>
        `;
        document.body.appendChild(this.el);
        document.body.classList.add('lore-mode');
    }

    handleInput(e) {
        if (!this.active) return;
        if (e.key === 'Enter') {
            this.exit();
            // Transition to Briefing (Protocol 4)
            if (this.game && this.game.fsm) {
                this.game.fsm.change('briefing', { nextLevel: this.nextLevel });
            }
        }
    }

    exit() {
        this.active = false;
        if (this.el) this.el.remove();
        document.body.classList.remove('lore-mode');
        window.removeEventListener('keydown', this.boundHandleInput);
    }
}
