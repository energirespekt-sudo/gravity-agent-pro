import { RenderComponent, PositionComponent, WordComponent } from '../components.js';

export class RenderSystem {
    constructor() {
        this.sky = document.getElementById('sky');
        this.laneWidth = window.innerWidth / 6;
    }

    update(entityManager) {
        const entities = entityManager.getEntitiesWith(RenderComponent);

        for (const entity of entities) {
            const render = entity.getComponent(RenderComponent);
            const pos = entity.getComponent(PositionComponent);
            const word = entity.getComponent(WordComponent);

            // Create DOM if missing
            if (!render.el) {
                this.createDOM(entity, render, pos, word);
            }

            // Sync Position
            if (render.el) {
                render.el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

                // If entity marked inactive (destroyed), remove DOM
                if (!entity.isActive) {
                    render.el.remove();
                    render.el = null;
                }
            }
        }
    }

    createDOM(entity, render, pos, word) {
        const obj = document.createElement('div');
        obj.className = 'falling-object';
        // Note: Translation handles position, but we set initial left/top to 0 to make translate work relative to container
        obj.style.position = 'absolute';
        obj.style.left = '0px';
        obj.style.top = '0px';

        // HTML Template from Legacy
        obj.innerHTML = `
            <div class="parachute-canopy">
                <div class="word-on-canopy" data-original-word="${word.word}">
                    ${word.word.split('').map(char => `<span class="letter">${char}</span>`).join('')}
                </div>
            </div>
            <div class="parachute-lines"></div>
            <div class="chibi-container" style="background-image: url('assets/chibi/${render.chibiFile}')"></div>
        `;

        this.sky.appendChild(obj);
        render.el = obj;
    }
}
