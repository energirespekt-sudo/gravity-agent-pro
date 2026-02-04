/**
 * PhysicsEngine.js
 * Implements Verlet Integration for "Kinetic Resonance" mechanics.
 * Handles Ropes, Pendulums, and Soft Body dynamics.
 */
export class PhysicsEngine {
    constructor() {
        this.gravity = 0.5;
        this.friction = 0.99;
        this.groundY = window.innerHeight;
    }

    /**
     * Creates a rope structure
     * @param {number} startX - Anchor X
     * @param {number} startY - Anchor Y
     * @param {number} segments - Number of nodes
     * @param {number} spacing - Distance between nodes
     */
    createRope(startX, startY, segments = 5, spacing = 20) {
        const points = [];
        const constraints = [];

        for (let i = 0; i < segments; i++) {
            points.push({
                x: startX,
                y: startY + (i * spacing),
                oldx: startX,
                oldy: startY + (i * spacing),
                pinned: i === 0 // Pin the first node (Anchor)
            });

            if (i > 0) {
                constraints.push({
                    p1: points[i - 1],
                    p2: points[i],
                    length: spacing
                });
            }
        }

        return { points, constraints };
    }

    update(rope, dt) {
        // 1. Update Points (Verlet)
        for (const p of rope.points) {
            if (!p.pinned) {
                const vx = (p.x - p.oldx) * this.friction;
                const vy = (p.y - p.oldy) * this.friction;

                p.oldx = p.x;
                p.oldy = p.y;

                p.x += vx;
                p.y += vy;
                p.y += this.gravity; // Gravity
            }
        }

        // 2. Solve Constraints (Stiffness)
        // Iterate multiple times for stability
        for (let i = 0; i < 3; i++) {
            for (const c of rope.constraints) {
                const dx = c.p2.x - c.p1.x;
                const dy = c.p2.y - c.p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const difference = c.length - distance;
                const percent = difference / distance / 2;
                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (!c.p1.pinned) {
                    c.p1.x -= offsetX;
                    c.p1.y -= offsetY;
                }
                if (!c.p2.pinned) {
                    c.p2.x += offsetX;
                    c.p2.y += offsetY;
                }
            }
        }
    }
}
