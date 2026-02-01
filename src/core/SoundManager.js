export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.noiseBuffer = this.createNoiseBuffer();
    }

    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playType() {
        if (!this.enabled) return;
        this.resume();

        const t = this.ctx.currentTime;
        const randomness = (Math.random() * 0.1) - 0.05; // +/- 5% Pitch variation

        // 1. CLICK (High Frequency Noise - Crisp)
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1500, t);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.1, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        noise.stop(t + 0.05);

        // 2. THOCK (Body tone - Low Triangle)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 * (1 + randomness), t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.resume(); // Ensure AudioContext is running

        const t = this.ctx.currentTime;

        // "TONG!" LASER (FM Synthesis)
        // Carrier (The Tone)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Modulator (The Metallic Ring)
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        // Config Carrier
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t); // Start Pitch
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.35); // Laser Drop

        // Config Modulator
        modulator.type = 'sawtooth';
        modulator.frequency.setValueAtTime(250, t); // Ratio to carrier
        modGain.gain.setValueAtTime(400, t); // FM Depth
        modGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); // Fade FM

        // Config Envelope (Punchy)
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.01); // Instant attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35); // Tail

        // Routing
        modulator.connect(modGain);
        modGain.connect(osc.frequency); // FM Modulation
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Trigger
        osc.start(t);
        osc.stop(t + 0.4);
        modulator.start(t);
        modulator.stop(t + 0.4);
    }

    playDamage() {
        if (!this.enabled) return;
        this.resume();

        // Heavy Bass Thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playError() {
        if (!this.enabled) return;
        this.resume();

        // Short Buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Legacy support (optional)
    playClank() { this.playType(); }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

export const soundManager = new SoundManager();
window.soundManager = soundManager;
