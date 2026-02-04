import { RenderComponent, PositionComponent, WordComponent, RopeComponent } from '../components.js';

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

            const rope = entity.getComponent(RopeComponent);

            // Create DOM if missing
            if (!render.el) {
                this.createDOM(entity, render, pos, wordComp, rope);
            }

            // Sync Position & Cleanup
            if (render.el) {
                // Determine Swing if Rope Present using "Kinetic Resonance" logic
                // If rope exists, the position is actually controlled by the physics engine (Verlet)
                // But for V1, let's assume PositionComponent is the "Head"

                // Rotation for "Gungning" (Swinging)
                let rotation = 0;
                if (pos.vx) {
                    rotation = pos.vx * 2; // Simple tilt based on velocity
                }

                // Render Rope (SVG Update)
                if (rope && render.ropeEl) {
                    // Update Rope Constraints Drawing
                    // For now, simple line from Anchor(Top) to Entity(Bottom)
                    // In real Verlet, we'd draw all segments.
                    // V1 Shortcut: Draw line to top of screen or anchor
                    const startX = 50; // Centered relative to container
                    const startY = -1000; // Way up
                    const endX = 50;
                    const endY = 0; // At the entity

                    // We need a better draw strategy for ropes, likely a global SVG layer or canvas
                    // But for "Vibe" code, let's just rotate the whole container
                }

                // Use translate3d for better performance + Rotation
                render.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${rotation}deg)`;

                // If entity marked inactive (destroyed), remove DOM
                if (!entity.isActive) {
                    render.el.remove();
                    render.el = null;
                }
            }
        }
    }

    createDOM(entity, render, pos, wordComp, rope) {
        const obj = document.createElement('div');
        obj.className = 'falling-object';
        obj.style.left = '0px';
        obj.style.top = '0px';

        // NEW NEON STRUCTURE
        // Platform at bottom, Chibi on top, Word above Chibi
        // If ROPE, add a visible "String" line going up
        let ropeHTML = '';
        if (rope) {
            // SVG Container for the Rope
            // Needs to be large enough to contain the swing. 
            // We'll calculate the path in update(), relative to the Entity Position.
            // Actullay, simpler: The SVG is absolutely positioned at 0,0 of the SCREEN/WORLD? 
            // OR: The SVG travels with the div, but draws lines UPWARDS.
            ropeHTML = `
            <svg class="kinetic-rope-svg" viewBox="-100 -2000 200 2000" preserveAspectRatio="none">
                <path d="M50 2000 L50 0" stroke="cyan" stroke-width="2" fill="none" class="rope-path" />
            </svg>`;
        }

        obj.innerHTML = `
            ${ropeHTML}
            <div class="word-container">
                <div class="word-box" data-original-word="${wordComp.word}">
                    ${wordComp.word.split('').map(char => `<span class="letter">${char}</span>`).join('')}
                </div>
            </div>
            <div class="chibi-wrapper">
                <div class="chibi" style="background-image: url('assets/chibi/${render.chibiFile}')"></div>
            </div>
            <div class="platform"></div>
        `;

        // Note: Chibi logic in style.css handles the positioning relative to platform
        // assets path assumed to be flat in assets/ (e.g. assets/volt.png) based on previous SpawningSystem logic

        this.worldLayer.appendChild(obj);
        render.el = obj;
        if (rope) {
            render.ropeEl = obj.querySelector('.kinetic-rope-svg');
        }
    }
}
