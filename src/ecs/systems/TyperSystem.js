import { InputHandler } from '../../core/InputHandler.js';
import { WordComponent, RenderComponent, PositionComponent } from '../components.js';
import { soundManager } from '../../core/SoundManager.js';
import { ParticleSystem } from '../../fx/ParticleSystem.js';

export class TyperSystem {
    constructor(inputHandler) {
        this.inputHandler = inputHandler;
        this.buffer = "";
        // Lazy load ParticleSystem to ensure DOM is ready? 
        // No, if main.js runs after DOM content loaded, it's fine.
        // But to be safe, we can init it on first use or use a getter.
        // However, standard constructor should work if script is deferred.
        this.particles = new ParticleSystem();
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

                soundManager.playType(); // MECHANICAL SOUND

                // Full Match
                if (this.buffer.length === wordComp.word.length) {
                    soundManager.playSuccess(); // LASER SOUND (Priority)
                    this.destroyWord(entity, playingState);
                    this.buffer = "";
                    this.resetAllHighlights(entityManager);
                    return;
                }
                break; // Found a valid prefix candidate
            }
        }

        if (matchFound) {
            this.updateHighlights(entityManager);
        } else {
            // Error Feedback
            soundManager.playError();

            // Visual Shake on HUD input 
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

        // VISUAL EXPLOSION (Particle System)
        const pos = entity.getComponent(PositionComponent);
        if (pos) {
            // Center approx
            const cx = pos.x + 30;
            const cy = pos.y + 30;
            if (this.particles) this.particles.emit(cx, cy, '#00f3ff');
        }

        // Scoring
        const wordComp = entity.getComponent(WordComponent);
        playingState.score += (wordComp.word.length * 10);

        // Level Up Logic
        if (playingState.score > playingState.level * 1000) {
            playingState.level++;
        }
    }
}
