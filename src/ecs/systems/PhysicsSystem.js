import { PositionComponent, VelocityComponent, LaneComponent } from '../components.js';
import { LevelUtils } from '../../utils/LevelUtils.js';

export class PhysicsSystem {
    constructor() {
        this.floorY = window.innerHeight - 80;
    }

    update(entityManager, dt, playingState) {
        const params = LevelUtils.getParams(playingState.level);
        const entities = entityManager.getEntitiesWith(PositionComponent, VelocityComponent);
        const killY = window.innerHeight - 60; // Threshold

        entities.forEach(entity => {
            if (!entity.isActive) return;

            const pos = entity.getComponent(PositionComponent);
            const vel = entity.getComponent(VelocityComponent);

            // Speed Logic:
            // If entity is BOSS_WORD, use its internal velocity (slower).
            // Otherwise use the Global Level Speed (for synchronized wave adjustment).
            let currentSpeed = params.speed;

            if (entity.type === 'BOSS_WORD') {
                currentSpeed = vel.vy; // Use the 40 speed set in SpawningSystem
            }

            // Move
            pos.y += currentSpeed * (dt / 1000);

            // Floor Check
            if (pos.y >= killY) {
                // LOGIC: Enemy reached bottom -> DAMAGE
                console.log(`💀 IMPACT: Entity reached ${pos.y.toFixed(1)}`);

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
