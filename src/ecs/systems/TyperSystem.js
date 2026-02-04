import { InputHandler } from '../../core/InputHandler.js';
import { WordComponent, RenderComponent, PositionComponent } from '../components.js';
import { soundManager } from '../../core/SoundManager.js';
import { ParticleSystem } from '../../fx/ParticleSystem.js';

export class TyperSystem {
    constructor(inputHandler) {
        this.inputHandler = inputHandler;
        this.buffer = "";
        this.particles = new ParticleSystem();
    }

    update(entityManager, playingState) {
        // MATCHING DEBUG - DISABLED FOR PRODUCTION
        // const matchDbg = document.getElementById('debug-match-info');
        // if (!matchDbg && document.getElementById('hud-bc')) {
        //     const d = document.createElement('div');
        //     d.id = 'debug-match-info';
        //     d.style.color = '#ffff00';
        //     d.style.fontSize = '0.8rem';
        //     document.getElementById('hud-bc').appendChild(d);
        // }

        const entities = entityManager.getEntitiesWith(WordComponent);
        // const words = entities.map(e => e.getComponent(WordComponent).word).join(', ');
        // if (matchDbg) matchDbg.innerText = `BUF: '${this.buffer}' | WORDS: [${words}]`;

        // Ensure Audio Context is active on first interaction
        if (window.soundManager && window.soundManager.ctx.state === 'suspended') {
            window.soundManager.ctx.resume();
        }

        // AUTO-PILOT DISABLED
        if (false) {
            this.handleAutoPilot(entityManager, playingState);
        }

        // PROCESS ALL CHARACTERS IN QUEUE (Fixes lag/dropped keys)
        let char;
        while ((char = this.inputHandler.getChar())) {

            // DEBUG RECEIPT - DISABLED
            // const dbg = document.getElementById('debug-last-key');
            // if (dbg) dbg.innerText += ` -> SYSTEM: ${char}`;

            // Convert to uppercase for consistency
            const upperChar = char.toUpperCase();

            // Backspace handling (Case sensitive check from InputHandler)
            if (char === 'Backspace') {
                if (this.buffer.length > 0) {
                    this.buffer = this.buffer.slice(0, -1);
                    this.updateHighlights(entityManager); // Update visuals immediately
                    this.syncInputFeedback(this.checkPrefix(entityManager)); // Re-eval prefix

                    // SYNC VISUAL INPUT IMMEDIATELY
                    const inputEl = document.getElementById('typer');
                    if (inputEl) inputEl.value = this.buffer;
                }
                continue; // Process next key
            }

            // IGNORE SPECIAL KEYS
            if (char.length !== 1) continue;

            // Add character to buffer
            this.buffer += upperChar;

            // Sync Visual Input
            const inputEl = document.getElementById('typer');
            if (inputEl) inputEl.value = this.buffer;

            // Check if valid prefix (for Sound/Feedback)
            const isValidPrefix = this.checkPrefix(entityManager);

            if (isValidPrefix) {
                if (window.soundManager) window.soundManager.playBlip();
                this.updateHighlights(entityManager);
                this.syncInputFeedback(true);
            } else {
                if (window.soundManager) window.soundManager.playError();
                this.syncInputFeedback(false);
            }

            // Check for Full Completion
            // We verify against the updated buffer immediately
            for (const entity of entities) {
                const wordComp = entity.getComponent(WordComponent);
                if (wordComp.word.toUpperCase() === this.buffer) {
                    // Match! Destroy word
                    if (entity.type === 'POWERUP_EMP') {
                        this.triggerEMP(entityManager);
                    } else {
                        this.destroyWord(entity, playingState);
                    }

                    // Clear Buffer after success
                    this.buffer = "";
                    if (inputEl) inputEl.value = "";

                    this.resetAllHighlights(entityManager);
                    if (window.soundManager) window.soundManager.playHit();
                    break; // Stop checking words, move to next char (though buffer is empty now)
                }
            }
        }
    }

    checkPrefix(entityManager) {
        // Helper to check if current buffer is valid prefix of ANY active word
        if (this.buffer.length === 0) return true; // Empty is valid (neutral)
        const entities = entityManager.getEntitiesWith(WordComponent);
        return entities.some(e => e.getComponent(WordComponent).word.toUpperCase().startsWith(this.buffer));
    }

    syncInputFeedback(isValid) {
        const input = document.getElementById('typer');
        if (!input) return;

        if (isValid) {
            input.style.borderColor = '#00ff00';
            input.style.color = '#ffffff';
            input.classList.remove('shake');
        } else {
            input.style.borderColor = '#ff0000';
            input.style.color = '#ff9999';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 200);
        }
    }

    handleAutoPilot(entityManager, playingState) {
        if (!this.autoTimer) this.autoTimer = 0;
        this.autoTimer++;
        if (this.autoTimer < 5) return;
        this.autoTimer = 0;

        const entities = entityManager.getEntitiesWith(WordComponent);
        let target = null;

        if (this.buffer.length > 0) {
            target = entities.find(e => e.getComponent(WordComponent).word.toUpperCase().startsWith(this.buffer));
        }

        if (!target) {
            target = entities.sort((a, b) => b.getComponent(PositionComponent).y - a.getComponent(PositionComponent).y)[0];
        }

        if (target) {
            const word = target.getComponent(WordComponent).word;
            const nextChar = word[this.buffer.length];
            if (nextChar) {
                this.buffer += nextChar.toUpperCase();
                this.updateHighlights(entityManager);

                if (this.buffer.length === word.length) {
                    if (target.type === 'POWERUP_EMP') this.triggerEMP(entityManager);
                    else this.destroyWord(target, playingState);
                    this.buffer = "";
                    this.resetAllHighlights(entityManager);
                }
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

        // VISUAL EXPLOSION
        const pos = entity.getComponent(PositionComponent);
        if (pos) {
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

    triggerEMP(entityManager) {
        // Clear all entities
        const entities = entityManager.getEntitiesWith(WordComponent);
        entities.forEach(e => e.isActive = false);
        // console.log("EMP ACTIVATED");
    }
}
