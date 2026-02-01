export class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 16.6 ms (60 FPS)
        this.rafId = null;
        this.isRunning = false;
        this.callback = () => { };
        this.renderCallback = () => { };
    }

    start(update, render) {
        this.isRunning = true;
        this.callback = update || (() => { });
        this.renderCallback = render || (() => { });
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;

        // Safety: Cap accumulator to prevent spiral of death
        if (this.accumulator > 250) this.accumulator = 250;

        while (this.accumulator >= this.timeStep) {
            this.callback(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        const alpha = this.accumulator / this.timeStep;
        this.renderCallback(alpha);

        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
}
