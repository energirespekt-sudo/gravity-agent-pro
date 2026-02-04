import { Globals } from '../../core/Globals.js';
import { LevelUtils } from '../../utils/LevelUtils.js';
import { PositionComponent, VelocityComponent, WordComponent, RenderComponent, LaneComponent, RopeComponent } from '../components.js';
import { WordCurriculum } from '../../core/WordCurriculum.js';

export class SpawningSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.spawnTimer = 0;
        this.nextSpawnIn = 1000;
        this.wordCurriculum = new WordCurriculum();

        // Boss State
        this.bossQueue = [];
        this.bossWaveStarted = false;
        this.bossSpawnTimer = 0;
        this.isBossLevel = false;

        // Distribution Logic
        this.lastLane = -1;
        this.laneBag = [0, 1, 2, 3, 4, 5]; // Shuffle bag for even distribution
    }

    update(dt, level) {
        this.spawnTimer += dt;

        // Check for Boss Level (Strict Roadmap)
        const bossLevels = [3, 10, 20, 30, 40, 50];
        this.isBossLevel = bossLevels.includes(level);

        if (this.isBossLevel) {
            if (!this.bossWaveStarted) {
                this.startBossWave(level);
            }

            // BOSS SPAWN LOGIC (Sequential)
            if (this.bossQueue.length > 0) {
                this.bossSpawnTimer += dt;
                if (this.bossSpawnTimer >= 2500) { // 2.5s Delay between story lines
                    const word = this.bossQueue.shift();
                    this.spawnEntity(word, true); // true = Boss Word
                    this.bossSpawnTimer = 0;
                }
            }
            return; // Skip normal spawning
        }

        // NORMAL SPAWN LOGIC (Random)
        this.bossWaveStarted = false;

        const params = LevelUtils.getParams(level, Globals.levelConfig);

        if (this.spawnTimer >= this.nextSpawnIn) {
            // HIGH DANGER CHECK (EMP TRIGGER)
            const activeCount = this.entityManager.getEntitiesWith(WordComponent).length;

            // Only trigger EMP chance if we actually have words (Prevent invalid spawn loop)
            if (activeCount > 8 && Math.random() < 0.25) {
                // Power Up Probability
                const r = Math.random();
                let type = "[RESET]";
                if (r > 0.6) type = "[FREEZE]";
                else if (r > 0.3) type = "[NUKE]";

                this.spawnEntity(type, false, true); // Word, isBoss, isPowerUp
            } else {
                this.spawnWord(level);
            }

            this.spawnTimer = 0;
            // Safety Check for delay
            this.nextSpawnIn = (params && params.delay) ? params.delay : 2000;
        }
    }

    startBossWave(level) {
        console.log(`💀 BOSS WAVE START: Level ${level}`);
        this.bossWaveStarted = true;
        this.bossSpawnTimer = 2500; // Delay first spawn
        // Fetch Boss Words
        const words = this.wordCurriculum.getBossWords(level);
        if (words) {
            this.bossQueue = [...words];
        } else {
            console.warn("No boss words for level " + level);
            this.bossQueue = ["ERROR_NO_STORY"];
        }
    }

    spawnWord(level) {
        try {
            // Prevent Duplicates
            const activeEntities = this.entityManager.getEntitiesWith(WordComponent);
            const activeWords = new Set(activeEntities.map(e => e.getComponent(WordComponent).word));

            let word = this.wordCurriculum.getWord(level);

            // Safety Fallback if Curriculum fails
            if (!word) {
                console.warn(`Curriculum Warning: No word found for level ${level}`);
                word = "SYSTEM_REBOOT";
            }

            let retries = 5;
            while (activeWords.has(word) && retries > 0) {
                word = this.wordCurriculum.getWord(level);
                retries--;
            }

            this.spawnEntity(word, false);
        } catch (err) {
            console.error("SPAWN WORD ERROR:", err);
            // Non-fatal fallback
            this.spawnEntity("ERROR", false);
        }
    }

    spawnEntity(wordText, isBoss = false, isPowerUp = false) {
        try {
            const entity = this.entityManager.createEntity();

            // Lane Logic (NaN Protection)
            const w = (window.innerWidth && window.innerWidth > 0) ? window.innerWidth : 1024;

            // Shuffle Bag refill
            if (this.laneBag.length === 0) {
                this.laneBag = [0, 1, 2, 3, 4, 5];
            }
            // Pick random index from bag
            const bagIndex = Math.floor(Math.random() * this.laneBag.length);
            const lane = this.laneBag.splice(bagIndex, 1)[0];

            const laneWidth = w / 6;
            let x = (lane * laneWidth) + (laneWidth / 2) - 30;

            if (isNaN(x)) x = 100; // Validate X

            // Chibi Logic
            const chibiFiles = [
                'breach.png', 'cipher.png', 'echo.png', 'flux.png',
                'ghost.png', 'grid.png', 'link.png', 'sentry.png',
                'static.png', 'trace.png', 'vanguard.png', 'volt.png'
            ];
            // Use 'volt.png' for PowerUp ensuring loop integrity
            const chibiFile = isPowerUp ? 'volt.png' : chibiFiles[Math.floor(Math.random() * chibiFiles.length)];

            // Speed Logic
            // Boss Words: 40
            // PowerUps: 150
            // Normal: Level Speed
            let speed = 100;
            const params = LevelUtils.getParams(0, Globals.levelConfig);
            if (params && params.speed) speed = params.speed;

            if (isBoss) speed = 40;
            if (isPowerUp) speed = 150;

            if (isNaN(speed)) speed = 100; // Validate Speed

            entity.addComponent(new PositionComponent(x, -100));
            entity.addComponent(new VelocityComponent(0, speed));
            entity.addComponent(new WordComponent(wordText));
            entity.addComponent(new LaneComponent(lane));

            // KINETIC RESONANCE: Attach Rope
            entity.addComponent(new RopeComponent(x, -100, 100, 5));

            // Render Type
            const renderType = isPowerUp ? 'powerup' : 'normal';
            entity.addComponent(new RenderComponent(renderType, chibiFile));

            if (isBoss) entity.type = 'BOSS_WORD';
            if (isPowerUp) entity.type = 'POWERUP_EMP';

        } catch (e) {
            console.error("SPAWN ENTITY CRITICAL:", e);
        }
    }

    getWordPool(level) {
        return this.wordCurriculum.getWord(level);
    }
}
