export class LevelUtils {
    static getParams(level, config) {
        // Default config fallback
        // Default config fallback
        // Difficulty Config (User Request: "Don't increase speed much, increase word difficulty")
        const cfg = {
            baseSpawnDelay: 2000,
            minSpawnDelay: 800,
            baseDropSpeed: 100.0, // Base pixels per second
            dropSpeedPerLevel: 0.5, // Flattened Curve (Was 6.0).
            // Level 1: 100 px/s
            // Level 50: 125 px/s (Very subtle increase)
            waveSizeBase: 3,
            waveSizePerLevel: 0.2,
            baseDropSpeed: 100.0, // Base pixels per second
            spawnDelayPerLevel: 60, // Aggressive Spawn Rate increase (More words!)
            // Level 1: 2000ms delay
            // Level 10: 1400ms delay
            // Level 20: 800ms delay (Horde Mode)
            dropSpeedPerLevel: 0.2, // Almost Constant Speed (User Request)
            waveSizeBase: 3,
            waveSizePerLevel: 0.2
        };

        const waveIndex = (level - 1) % cfg.waveCycleLength;
        const isRelief = waveIndex === (cfg.waveCycleLength - 1);

        // Speed Calculation (Linear Logic - Very Slow Increase)
        let speed = cfg.baseDropSpeed + ((level - 1) * cfg.dropSpeedPerLevel);

        // Relief Wave: Slower
        if (isRelief) speed *= 0.8;

        // Delay Calculation (Density Logic)
        let delay = cfg.baseSpawnDelay - ((level - 1) * cfg.spawnDelayPerLevel);
        if (isRelief) delay += 1000;
        delay = Math.max(delay, cfg.minSpawnDelay);

        return { speed, delay, isRelief };
    }
}
