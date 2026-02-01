import { InputHandler } from '../../core/InputHandler.js';
import { WordComponent, RenderComponent } from '../components.js';
import { soundManager } from '../../core/SoundManager.js';

export class TyperSystem {
    // ... constructor ...

    update(entityManager, playingState) {
        // ...
        // Test potential new buffer
        const testBuffer = this.buffer + char.toUpperCase();

        const entities = entityManager.getEntitiesWith(WordComponent);
        let matchFound = false;

        for (const entity of entities) {
            // ... check ...
            if (wordComp.word.toUpperCase().startsWith(testBuffer)) {
                matchFound = true;
                this.buffer = testBuffer; // Accept input

                soundManager.playType(); // SOUND HERE

                // Full Match
                if (this.buffer.length === wordComp.word.length) {
                    this.destroyWord(entity, playingState);
                    soundManager.playSuccess(); // SOUND HERE
                    this.buffer = "";
                    this.resetAllHighlights(entityManager);
                    return;
                }
                break;
            }
        }
        // ...
    }
    constructor(inputHandler) {
        this.inputHandler = inputHandler;
        this.buffer = "";
    }

    update(entityManager, playingState) {
        const char = this.inputHandler.getChar();
        if (!char) return;

        // Handle Backspace
        if (char === 'BACKSPACE') {
            this.buffer = this.buffer.slice(0, -1);
            this.updateHighlights(entityManager);
            return;
        }

        // Test potential new buffer
        const testBuffer = this.buffer + char.toUpperCase();

        const entities = entityManager.getEntitiesWith(WordComponent);
        let matchFound = false;

        for (const entity of entities) {
            if (!entity.isActive) continue;
            const wordComp = entity.getComponent(WordComponent);

            if (wordComp.word.toUpperCase().startsWith(testBuffer)) {
                matchFound = true;
                this.buffer = testBuffer; // Accept input

                // Full Match
                if (this.buffer.length === wordComp.word.length) {
                    soundManager.playSuccess(); // PLAY FIRST (Priority)
                    this.destroyWord(entity, playingState);
                    this.buffer = "";
                    this.resetAllHighlights(entityManager);
                    return;
                }
                break;
            }
        }

        if (matchFound) {
            this.updateHighlights(entityManager);
        } else {
            // Error Feedback (Visual Shake / Sound)
            soundManager.playError();

            // Visual Shake on HUD input (if possible)
            const inputEl = document.getElementById('typer-display') || document.querySelector('.input-box .placeholder');
            if (inputEl) {
                inputEl.classList.add('shake');
                setTimeout(() => inputEl.classList.remove('shake'), 200);
            }
        }
    }

    updateHighlights(entityManager) {
        const entities = entityManager.getEntitiesWith(WordComponent);
        for (const entity of entities) {
            const wordComp = entity.getComponent(WordComponent);
            const render = entity.getComponent(RenderComponent);

            if (render && render.el) {
                if (wordComp.word.toUpperCase().startsWith(this.buffer)) {
                    this.highlightWord(render.el, this.buffer.length);
                } else {
                    this.resetHighlight(render.el);
                }
            }
        }
    }

    resetAllHighlights(entityManager) {
        const entities = entityManager.getEntitiesWith(WordComponent);
        entities.forEach(e => {
            const r = e.getComponent(RenderComponent);
            if (r && r.el) this.resetHighlight(r.el);
        });
    }

    highlightWord(el, count) {
        const letters = el.querySelectorAll('.letter');
        letters.forEach((l, i) => {
            if (i < count) l.classList.add('highlight');
            else l.classList.remove('highlight');
        });
    }

    resetHighlight(el) {
        el.querySelectorAll('.letter').forEach(l => l.classList.remove('highlight'));
    }

    destroyWord(entity, playingState) {
        entity.isActive = false;

        // Scoring
        const wordComp = entity.getComponent(WordComponent);
        playingState.score += (wordComp.word.length * 10);

        // Level Up Logic could go here
        if (playingState.score > playingState.level * 1000) {
            playingState.level++;
        }
    }
}
