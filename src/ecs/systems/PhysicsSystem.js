import { PositionComponent, VelocityComponent, LaneComponent, RopeComponent } from '../components.js';
import { LevelUtils } from '../../utils/LevelUtils.js';
import { PhysicsEngine } from '../../core/PhysicsEngine.js';

export class PhysicsSystem {
    constructor() {
        this.floorY = window.innerHeight - 80;
        this.engine = new PhysicsEngine(); // Verlet Solver
    }

    update(entityManager, dt, playingState) {
        const params = LevelUtils.getParams(playingState.level);
        const entities = entityManager.getEntitiesWith(PositionComponent, VelocityComponent);

        // CONSTANTS
        const KILL_Y = window.innerHeight - 60;
        const DT_SECONDS = dt / 1000;

        entities.forEach(entity => {
            if (!entity.isActive) return;

            const pos = entity.getComponent(PositionComponent);
            const vel = entity.getComponent(VelocityComponent);

            // --- 1. PURE MATH / SIMULATION ---

            // Determine Speed
            let currentSpeed = params.speed;
            if (entity.type === 'BOSS_WORD') {
                currentSpeed = vel.vy;
            }

            // Apply Movement
            const newY = pos.y + (currentSpeed * DT_SECONDS);

            // KINETIC RESONANCE: Rope Logic
            const ropeComp = entity.getComponent(RopeComponent);
            if (ropeComp) {
                // 1. Initialize Rope if needed
                if (!ropeComp.rope) {
                    ropeComp.rope = this.engine.createRope(pos.x, -100, ropeComp.segments, 30);
                }

                // 2. Update Rope Physics (Verlet)
                // KINETIC RESONANCE: Rope Logic
                // MODIFIED: User Request "Rakt ner" (No Wind/Sway)
                const time = Date.now() / 1000;
                // const windNoise = Math.sin(time * 2 + pos.y * 0.01) * 0.5; // DISABLED

                ropeComp.rope.points.forEach((p, i) => {
                    if (!p.pinned) {
                        // p.x += windNoise * (i * 0.1); // DISABLED
                        // STRICT ALIGNMENT: x matches entity x (or previous node to be straight)
                        // Actually, just let gravity/Verlet handle y. Keep x stable.
                        p.x = p.oldx; // Kill X velocity
                    }
                });

                this.engine.update(ropeComp.rope, dt);

                // 3. Sync Entity Position to Last Node (The "Weight")
                const lastNode = ropeComp.rope.points[ropeComp.rope.points.length - 1];
                pos.x = lastNode.x;
                pos.y = lastNode.y;

                // Calculate pseudo-velocity for Rotation
                const prevX = lastNode.oldx;
                vel.vx = (pos.x - prevX) * 50; // Estimate velocity for swing visual

                // 4. Force Linear Descent of Anchor (So the whole rope falls)
                // In a real rope game, the anchor is fixed or moves. Here, the WHOLE rope falls?
                // OR the anchor stays top and we extend?
                // Let's make the ANCHOR fall for now, simulating the old gameplay but with swing.

                // Move all points down by speed?
                // Better: Move the Anchor(Pinned Node 0) down.
                ropeComp.rope.points[0].y += (currentSpeed * DT_SECONDS);
                ropeComp.rope.points[0].oldy += (currentSpeed * DT_SECONDS); // Move physics state

            } else {
                // Fallback Linear
                pos.y = newY;
            }

            // Check Boundary Condition
            const isOutOfBounds = pos.y >= KILL_Y;

            // --- 2. GAMEPLAY SIDE EFFECTS ---
            if (isOutOfBounds) {
                // LOGIC: Enemy reached bottom -> DAMAGE

                // A. TRIGGER DAMAGE
                if (playingState.triggerDamageSequence) {
                    playingState.triggerDamageSequence();
                } else {
                    playingState.lives--;
                }

                // B. VISUAL & AUDIO FEEDBACK
                if (window.soundManager) {
                    try {
                        window.soundManager.playDamage();
                    } catch (e) { console.warn("Audio Error", e); }
                }

                // C. DESTROY ENTITY
                entityManager.removeEntity(entity);
            }
        });
    }
}
