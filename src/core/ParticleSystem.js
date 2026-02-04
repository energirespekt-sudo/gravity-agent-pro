/**
 * ParticleSystem.js
 * Lightweight DOM-based particle effects for "Juice".
 * Optimized for frequent use (pooling).
 */
export class ParticleSystem {
    constructor(container = document.body) {
        this.container = container;
        this.particles = [];
    }

    /**
     * Spawns a burst of particles at (x, y)
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @param {string} color - CSS color
     * @param {number} count - Number of particles
     */
    spawnBurst(x, y, color = '#ffd700', count = 10) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, color);
        }
    }

    createParticle(x, y, color) {
        const el = document.createElement('div');
        el.className = 'particle';
        el.style.backgroundColor = color;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Random Velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        this.container.appendChild(el);

        // Animate manually or via CSS? 
        // For performance in JS engine, let's use Web Animations API if simple, or CSS classes.
        // Let's us CSS transitions for simplicity and GPU offload.

        // Force reflow
        el.getBoundingClientRect();

        // Explosive move
        const destX = x + (vx * 20); // Move 20 frames worth
        const destY = y + (vy * 20);

        el.style.transition = 'all 0.5s ease-out';
        el.style.transform = `translate(${vx * 50}px, ${vy * 50}px) scale(0)`;
        el.style.opacity = '0';

        // Cleanup
        setTimeout(() => {
            el.remove();
        }, 500);
    }

    /**
     * Massive explosion for Boss Death
     */
    spawnExplosion(x, y) {
        this.spawnBurst(x, y, '#ff0000', 30);
        this.spawnBurst(x, y, '#ffd700', 30);
        this.spawnBurst(x, y, '#ffffff', 20);
    }
}
