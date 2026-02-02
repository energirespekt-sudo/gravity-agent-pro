export class LevelUtils {
    static getParams(level, config) {
        // Default config fallback
        // Default config fallback
        // Difficulty Config (User Request: "Don't increase speed much, increase word difficulty")
        const cfg = {
            baseSpawnDelay: 2000,
            minSpawnDelay: 800,
            baseDropSpeed: 100.0,
            dropSpeedPerLevel: 0.2, // Linear, subtle increase
            spawnDelayPerLevel: 60, // Density increase
            waveSizeBase: 3,
            waveSizePerLevel: 0.2,
            waveCycleLength: 10 // Fixed missing property
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
