export class InputHandler {
    constructor() {
        this.queue = [];
        this.typer = document.getElementById('typer');

        // Global Listener
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Mobile / Virtual Keyboard Fallback
        if (this.typer) {
            // Ensure focus is kept mostly for mobile keyboard to appear
            document.addEventListener('click', () => this.typer.focus());
        }
    }

    onKeyDown(e) {
        // IGNORE inputs meant for UI overlays (like High Score Name)
        if (e.target && e.target.tagName === 'INPUT' && e.target.id !== 'typer') {
            return;
        }

        const key = e.key;

        // --- GAMEOPS / DEBUG KEYS ---
        if (window.GameOps) {
            switch (key) {
                case 'F1':
                    e.preventDefault();
                    window.GameOps.godMode(true);
                    return;
                case 'F2':
                    e.preventDefault();
                    window.GameOps.loadState('boss2');
                    return;
                case 'F3':
                    e.preventDefault();
                    window.GameOps.loadState('menu');
                    return;
                case 'F4':
                    e.preventDefault();
                    // Simple toggle for now: if < 1, go normal, else slow
                    window.GameOps.setTimeScale(0.2);
                    console.log("🔧 Time Scale: 0.2");
                    return;
                case 'F5': // Extra: Reset Time
                    e.preventDefault();
                    window.GameOps.setTimeScale(1.0);
                    console.log("🔧 Time Scale: 1.0");
                    return;
            }
        }

        // Prevent default browser actions for game keys
        if (key.length === 1 || key === 'Backspace') {
            e.preventDefault();
        }

        // Bypass filters - Accept EVERYTHING except strict control keys
        if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Dead', 'Enter', 'Escape'].includes(key)) {
            this.queue.push(key);
        }
    }

    getChar() {
        return this.queue.shift() || null;
    }

    clear() {
        this.queue = [];
        if (this.typer) this.typer.value = '';
    }
}
