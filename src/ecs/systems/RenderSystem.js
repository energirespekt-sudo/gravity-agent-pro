import { RenderComponent, PositionComponent, WordComponent } from '../components.js';

export class RenderSystem {
    constructor() {
        this.worldLayer = document.getElementById('world-layer') || document.body;
    }

    update(entityManager) {
        const entities = entityManager.getEntitiesWith(RenderComponent);

        for (const entity of entities) {
            const render = entity.getComponent(RenderComponent);
            const pos = entity.getComponent(PositionComponent);
            const wordComp = entity.getComponent(WordComponent);

            // Create DOM if missing
            if (!render.el) {
                this.createDOM(entity, render, pos, wordComp);
            }

            // Sync Position & Cleanup
            if (render.el) {
                // Use translate3d for better performance
                render.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

                // If entity marked inactive (destroyed), remove DOM
                if (!entity.isActive) {
                    render.el.remove();
                    render.el = null;
                }
            }
        }
    }

    createDOM(entity, render, pos, wordComp) {
        const obj = document.createElement('div');
        obj.className = 'falling-object';
        obj.style.left = '0px';
        obj.style.top = '0px';

        // NEW NEON STRUCTURE
        // Platform at bottom, Chibi on top, Word above Chibi
        obj.innerHTML = `
            <div class="word-box" data-original-word="${wordComp.word}">
                ${wordComp.word.split('').map(char => `<span class="letter">${char}</span>`).join('')}
            </div>
            <div class="chibi" style="background-image: url('assets/chibi/${render.chibiFile}')"></div>
            <div class="platform"></div>
        `;

        // Note: Chibi logic in style.css handles the positioning relative to platform
        // assets path assumed to be flat in assets/ (e.g. assets/volt.png) based on previous SpawningSystem logic

        this.worldLayer.appendChild(obj);
        render.el = obj;
    }
}
