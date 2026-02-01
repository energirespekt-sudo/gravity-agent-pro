import { Globals } from '../../core/Globals.js';
import { LevelUtils } from '../../utils/LevelUtils.js';
import { PositionComponent, VelocityComponent, WordComponent, RenderComponent, LaneComponent } from '../components.js';
import { WordCurriculum } from '../../core/WordCurriculum.js';

export class SpawningSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.spawnTimer = 0;
        this.nextSpawnIn = 1000;
        this.curriculum = new WordCurriculum();
    }

    update(dt, level) {
        this.spawnTimer += dt;

        if (this.spawnTimer >= this.nextSpawnIn) {
            this.spawnWord(level);
            this.spawnTimer = 0;

            // Calculate next spawn
            const params = LevelUtils.getParams(level, Globals.levelConfig); // Assuming Globals.levelConfig exists or use defaults
            this.nextSpawnIn = params.delay;
        }
    }

    spawnWord(level) {
        const lane = Math.floor(Math.random() * 6);
        const params = LevelUtils.getParams(level, Globals.levelConfig); // Ensure Globals.levelConfig is passed

        // Filter out words that are already on screen
        const activeEntities = this.entityManager.getEntitiesWith(WordComponent);
        const activeWords = new Set(activeEntities.map(e => e.getComponent(WordComponent).word));

        // Simple retry logic or filter
        let word = this.curriculum.getWord(level);
        let retries = 5;
        while (activeWords.has(word) && retries > 0) {
            word = this.curriculum.getWord(level);
            retries--;
        }

        // If we failed to find unique word, maybe just skip spawn this frame or spawn duplicate (fallback)
        // Ideally we spawn nothing to avoid confusion, but that reduces difficulty.
        // Let's spawn fallback if really stuck, but retries should usually work.

        // CHIBI RANDOMIZER (Real Assets)
        const chibiFiles = [
            'breach.png', 'cipher.png', 'echo.png', 'flux.png',
            'ghost.png', 'grid.png', 'link.png', 'sentry.png',
            'static.png', 'trace.png', 'vanguard.png', 'volt.png'
        ];
        const chibiFile = chibiFiles[Math.floor(Math.random() * chibiFiles.length)];

        // Calculate X position based on lane (0-5)
        const laneWidth = window.innerWidth / 6;
        const x = (lane * laneWidth) + (laneWidth / 2) - 30; // Center in lane

        const entity = this.entityManager.createEntity();

        entity.addComponent(new PositionComponent(x, -100))
            .addComponent(new VelocityComponent(0, params.speed))
            .addComponent(new WordComponent(word))
            .addComponent(new LaneComponent(lane))
            .addComponent(new RenderComponent('normal', chibiFile));
    }

    getWordPool(level) {
        // Fallback logic if curriculum fails
        if (!Globals.wordCurriculum) return ['ERROR', 'GLITCH', 'BUG'];

        const curriculum = Globals.wordCurriculum.curriculum;
        for (let stage of curriculum) {
            if (level >= stage.levels[0] && level <= stage.levels[1]) {
                return stage.words;
            }
        }
        return curriculum[curriculum.length - 1].words;
    }
}
