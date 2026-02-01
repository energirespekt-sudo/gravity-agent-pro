import { PositionComponent, VelocityComponent, LaneComponent } from '../components.js';

export class PhysicsSystem {
    constructor() {
        this.floorY = window.innerHeight - 80;
    }

    update(entityManager, dt, playingState) {
        // GET ALL MOVING ENTITIES
        const entities = entityManager.getEntitiesWith(VelocityComponent);

        // FLOOR THRESHOLD (The Kill Zone)
        // Hardcoded backup if window.innerHeight fluctuates
        const killY = window.innerHeight - 60;

        for (const entity of entities) {
            if (!entity.isActive) continue;

            const pos = entity.getComponent(PositionComponent);
            const vel = entity.getComponent(VelocityComponent);

            // 1. CONSTANT FALL (Parachute Physics)
            const oldY = pos.y;
            pos.y += (vel.vy * (dt / 1000));
            if (Math.random() < 0.01) console.log(`DEBUG: Entity ${entity.id} moving. Y: ${oldY.toFixed(1)} -> ${pos.y.toFixed(1)} Vel: ${vel.vy}`);

            // 2. STRICT FLOOR COLLISION
            if (pos.y >= killY) {
                // LOGIC: Enemy reached bottom -> DAMAGE
                console.log(`💀 IMPACT: Entity reached ${pos.y.toFixed(1)} (Threshold: ${killY})`);

                // A. TRIGGER DAMAGE
                if (playingState.triggerDamageSequence) {
                    playingState.triggerDamageSequence();
                } else {
                    console.error("Critical: triggerDamageSequence missing on playingState");
                    playingState.lives--;
                }

                // B. VISUAL & AUDIO FEEDBACK
                if (window.soundManager) {
                    try {
                        window.soundManager.playDamage();
                    } catch (e) { console.warn("Audio Error", e); }
                }

                // C. DESTROY ENTITY (No Stacking)
                // This ensures it disappears and can't be typed again
                entityManager.removeEntity(entity);
            }
        }
    }
}
