export class ParticleSystem {
    constructor() {
        this.container = document.getElementById('game-container');
    }

    emit(x, y, color = '#00f3ff') {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(x, y, color);
        }
    }

    createParticle(x, y, color) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.backgroundColor = color;

        // Physics
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        this.container.appendChild(p);

        // Animation
        const lifetime = 500 + Math.random() * 300;
        let startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / lifetime;

            if (progress >= 1) {
                p.remove();
                return;
            }

            // Move
            const cx = parseFloat(p.style.left) + vx;
            const cy = parseFloat(p.style.top) + vy;
            p.style.left = `${cx}px`;
            p.style.top = `${cy}px`;

            // Fade & Shrink
            p.style.opacity = 1 - progress;
            p.style.transform = `scale(${1 - progress})`;

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}
