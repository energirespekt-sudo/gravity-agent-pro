
export class BriefingState {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.nextLevel = 12;
    }

    enter(params) {
        console.log("📋 ENTERING BRIEFING STATE");
        this.active = true;
        this.nextLevel = params.nextLevel || 12;

        // Visuals
        this.createUI();

        // Input
        this.boundHandleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.boundHandleInput);
    }

    createUI() {
        this.el = document.createElement('div');
        this.el.className = 'briefing-screen';

        let threatTitle = "UNKNOWN VECTOR";
        let threatIcon = "❓";
        let subtext = "ADAPTATION REQUIRED";

        if (this.nextLevel === 12) {
            threatTitle = "HORIZONTAL THREAT";
            threatIcon = "✈️";
            subtext = "LATERAL MOVEMENT DETECTED";
        }

        this.el.innerHTML = `
            <div class="briefing-container">
                <div class="briefing-header">MISSION PROTOCOL UPDATE</div>
                <div class="briefing-icon">${threatIcon}</div>
                <div class="briefing-title">${threatTitle}</div>
                <div class="briefing-subtext">${subtext}</div>
                <div class="briefing-footer">
                    <div class="briefing-btn" id="briefing-btn">INITIATE MISSION [ENTER]</div>
                </div>
            </div>
        `;
        document.body.appendChild(this.el);
        document.body.classList.add('briefing-mode');

        // Click Handler
        const btn = this.el.querySelector('#briefing-btn');
        if (btn) {
            btn.addEventListener('click', () => this.proceed());
        }
    }

    handleInput(e) {
        if (!this.active) return;
        if (e.key === 'Enter') {
            this.proceed();
        }
    }

    proceed() {
        this.exit();
        if (this.game && this.game.fsm) {
            this.game.fsm.change('playing', { level: this.nextLevel });
        }
    }

    exit() {
        this.active = false;
        if (this.el) this.el.remove();
        document.body.classList.remove('briefing-mode');
        window.removeEventListener('keydown', this.boundHandleInput);
    }
}
