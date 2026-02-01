export class InputHandler {
    constructor() {
        this.queue = [];
        this.typer = document.getElementById('typer');

        // Global Listener (Nuclear Proof)
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Mobile / Virtual Keyboard Fallback
        if (this.typer) {
            this.typer.addEventListener('input', (e) => this.onInput(e));
            // Ensure focus is kept mostly for mobile keyboard to appear
            document.addEventListener('click', () => this.typer.focus());
        }
    }

    onKeyDown(e) {
        // Prepare character
        const key = e.key;

        // Backspace
        if (key === 'Backspace') {
            this.queue.push('BACKSPACE');
            return;
        }

        // Letters & Numbers (Filter out F1-F12, Control, etc)
        if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Regex for valid characters (A-Z, 0-9, space, symbols used in text)
            // For now, accept meaningful printable chars
            if (/^[a-zA-Z0-9\s\.\-]$/.test(key)) {
                this.queue.push(key);

                // If we have the typer specifically focused, we might get double input from 'input' event?
                // We should rely on KeyDown primarily for desktop.
                // To prevent double chars if 'input' also fires (rare if we prevent default? No, input event is compo)
                // Actually, if we use Global KeyDown, we don't need 'onInput' for Desktop.
                // Mobile is tricky. Let's debounce or choose one source.
                // For Linux Desktop User: KeyDown is King.
            }
        }

        if (key === 'Escape') {
            // Pause logic
        }
    }

    onInput(e) {
        // Only use input event if it produced value that KeyDown missed (e.g. mobile composition)
        // For this specific User on Linux, KeyDown is sufficient.
        // We will clear typer value to keep it clean
        if (e.target && e.target.value) {
            e.target.value = '';
        }
    }

    // Returns next char or null
    getChar() {
        return this.queue.shift() || null;
    }

    // Clears the buffer
    clear() {
        this.queue = [];
        if (this.typer) this.typer.value = '';
    }
}
