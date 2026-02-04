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

            // 1. Create DOM if missing
            if (!render.el) {
                this.createDOM(entity, render, pos, wordComp, rope);
            }

            // 2. Render Loop
            if (render.el) {
                // A. Rope Physics Visualization (HIGH FIDELITY BEZIER)
                if (rope && render.ropeEl && rope.rope) {
                    const svgPath = render.ropeEl.querySelector('.rope-path');
                    if (svgPath) {
                        const points = rope.rope.points;
                        const head = points[0];
                        const tail = points[points.length - 1];

                        // Convert World Coordinates to Local SVG Coordinates
                        // Center of object is at (pos.x, pos.y)
                        // SVG origin is effectively (pos.x, pos.y) but shifted by viewBox
                        // We map World Points -> Local Offset relative to (pos.x, pos.y)

                        // Start point (Screen Top typically, or previous node)
                        const startX = (head.x - pos.x) + 50; // +50 centers it in the 100px wide viewBox
                        const startY = (head.y - pos.y);

                        // End point (The character itself)
                        const endX = (tail.x - pos.x) + 50;
                        const endY = (tail.y - pos.y);

                        // Control Point for Curve (Simulates slack/drag)
                        // Heuristic: Midpoint + some lag based on velocity
                        const midX = (startX + endX) / 2 - (pos.vx * 0.1);
                        const midY = (startY + endY) / 2 + (Math.abs(pos.vx) * 0.1); // Droop slightly

                        const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

                        svgPath.setAttribute('d', d);

                        // Dynamic Stroke Width based on tension could happen here
                        svgPath.style.strokeWidth = Math.max(1, 3 - Math.abs(pos.vx / 1000));
                    }
                }

                // B. Entity Rotation (Pendulum Effect)
                // DISABLED: User Request "Se till att de inte svänger"
                let rotation = 0;
                // if (pos.vx) rotation = pos.vx * 0.3; // Commented out to enforce strict stability

                // C. Apply Transform
                // TRANSLATION applies to the whole container (Entity moves X/Y)
                render.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

                // D. Decoupled Rotation
                // We rotate the AVATAR, but keep the WORD level.
                const avatar = render.el.querySelector('.avatar-container');
                const legs = render.el.querySelector('.agent-legs');

                if (avatar) {
                    avatar.style.transform = `rotate(${rotation}deg)`;
                    avatar.style.transformOrigin = "50px 0px"; // Pivot from rope connection
                }

                // Procedural Leg Swing (Physics Inertia)
                if (legs) {
                    const time = Date.now() / 300; // Slower
                    const swing = Math.sin(time) * 5 + (pos.vx * -0.05); // Dampened
                    legs.style.transform = `rotate(${swing}deg)`;
                }

                // D. Cleanup
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
        // NEW PROCEDURAL AGENT STRUCTURE (Reviewer: High Fidelity Code-Drawn Graphics)
        // No more static images. We draw the agent using vector math.

        let ropeHTML = '';
        if (rope) {
            // Rope is drawn in update(), but we prep the container
            ropeHTML = `
            <svg class="kinetic-rope-svg" viewBox="-100 -2000 200 2000" preserveAspectRatio="none">
                <path d="M50 2000 L50 0" class="rope-path" />
            </svg>`;
        }

        // PROCEDURAL BALLOON AGENT
        // User Request: "Different colored balloons with word inside", "No swinging"

        const colors = ['#ff0055', '#00f3ff', '#0aff0a', '#ffaa00', '#bc13fe'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Balloon SVG
        // Centered at (50, 50) relative to entity
        const avatarHTML = `
        <div class="avatar-container" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
            <svg class="procedural-avatar" width="140" height="160" viewBox="0 0 140 160" style="position:absolute; top:-20px; left:-70px;">
                 <defs>
                    <radialGradient id="balloon-grad-${randomColor.replace('#', '')}" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.9" />
                    </radialGradient>
                    <filter id="balloon-glow-${randomColor.replace('#', '')}">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${randomColor}"/>
                    </filter>
                 </defs>
                 
                 <g class="balloon-unit" filter="url(#balloon-glow-${randomColor.replace('#', '')})">
                    <!-- String/Knot -->
                    <path d="M 70 130 L 70 160" stroke="#fff" stroke-width="2" />
                    <polygon points="70,130 65,138 75,138" fill="${randomColor}" />

                    <!-- Main Balloon Body -->
                    <ellipse cx="70" cy="70" rx="60" ry="70" fill="url(#balloon-grad-${randomColor.replace('#', '')})" />
                    
                    <!-- Highlight Reflection -->
                    <ellipse cx="50" cy="40" rx="10" ry="15" fill="#fff" opacity="0.4" transform="rotate(-30 50 40)" />
                 </g>
            </svg>
        </div>
        `;

        obj.innerHTML = `
            ${ropeHTML}
            
            ${avatarHTML}
        `;

        // ---------------------------------------------------------
        // RE-DRAWING SVG FOR HANGING BALLOON (Knot at TOP)
        // ---------------------------------------------------------

        // Update the innerHTML with new structure
        obj.innerHTML = `
            ${ropeHTML}
            
            <div class="avatar-container" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
                <svg class="procedural-avatar" width="140" height="160" viewBox="0 0 140 160" style="position:absolute; top:0px; left:-70px;">
                     <defs>
                        <radialGradient id="balloon-grad-${randomColor.replace('#', '')}" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.9" />
                        </radialGradient>
                        <filter id="balloon-glow-${randomColor.replace('#', '')}">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${randomColor}"/>
                        </filter>
                     </defs>
                     
                     <g class="balloon-unit" filter="url(#balloon-glow-${randomColor.replace('#', '')})">
                        <!-- Rope Connection (Top Center) -->
                        <!-- Knot at 70, 0 -->
                        <path d="M 70 0 L 70 20" stroke="#fff" stroke-width="2" />
                        <polygon points="70,20 65,12 75,12" fill="${randomColor}" />
    
                        <!-- Main Balloon Body (Hanging BELOW knot) -->
                        <!-- Center roughly at 70, 80 -->
                        <ellipse cx="70" cy="80" rx="60" ry="70" fill="url(#balloon-grad-${randomColor.replace('#', '')})" />
                        
                        <!-- Highlight Reflection -->
                        <ellipse cx="50" cy="50" rx="10" ry="15" fill="#fff" opacity="0.4" transform="rotate(-30 50 50)" />
                     </g>
                </svg>
            </div>

            <!-- WORD INSIDE BALLOON
                 Positioned to align with ellipse center (cy=80).
                 svg top is 0. center is ~80px down.
                 Text should be centered at width 0 (container center).
            -->
            <div class="word-container" style="z-index:100; top: 60px; position: absolute; width: 100%; text-align: center; pointer-events: none;">
                <div class="word-box" data-original-word="${wordComp.word}" style="
                    background: transparent; 
                    border: none; 
                    box-shadow: none; 
                    padding: 0; 
                    display: inline-block;">
                    ${wordComp.word.split('').map(char => `<span class="letter" style="
                        font-family: 'Arial', sans-serif; 
                        font-weight: 900; 
                        font-size: 1.8em; 
                        color: rgba(255,255,255,0.95); 
                        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                        display:inline-block;">${char}</span>`).join('')}
                </div>
            </div>
            
            <!-- Platform Removed -->
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
