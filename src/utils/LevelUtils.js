export class LevelUtils {
    static getParams(level, config) {
        // Default config fallback
        // Default config fallback
        // Default config fallback
        const cfg = config || {
            maxLevel: 50,
            baseDropSpeed: 100.0, // Pixels Per Second (Typer Shark Pace)
            baseSpawnDelay: 2500,
            waveCycleLength: 10,
            minSpawnDelay: 600,
            dropSpeedPerLevel: 6.0,
            spawnDelayPerLevel: 35
        };

        const waveIndex = (level - 1) % cfg.waveCycleLength;
        const isRelief = waveIndex === (cfg.waveCycleLength - 1);

        // Speed Calculation (Linear Logic)
        // Lvl 1: 100 px/s
        let speed = cfg.baseDropSpeed + ((level - 1) * cfg.dropSpeedPerLevel);

        // Relief Wave (Boss/Checkpoint): Slower
        if (isRelief) speed *= 0.8;

        // Delay Calculation
        let delay = cfg.baseSpawnDelay - ((level - 1) * cfg.spawnDelayPerLevel);
        if (isRelief) delay += 1000;
        delay = Math.max(delay, cfg.minSpawnDelay);

        return { speed, delay, isRelief };
    }
}
