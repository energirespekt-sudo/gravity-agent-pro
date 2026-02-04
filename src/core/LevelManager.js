/**
 * LevelManager.js
 * Handles the "Story Progression" and "Visual Themes".
 * Implements the "Sawtooth" difficulty described in Kinetic Resonance.
 */
import { Globals } from './Globals.js';

export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.chapter = 1; // 1 = Archives, 2 = Clocktower
    }

    getLevelConfig(level) {
        // Procedural "Sawtooth" Logic
        // Intro (1-5), Hard (6-9), Boss (10)

        const phase = level % 10;
        let difficulty = 1.0;
        let theme = "city_grid"; // Default

        // 1. Determine Difficulty
        if (phase === 0) difficulty = 3.0; // Boss (10)
        else if (phase < 5) difficulty = 1.0 + (level * 0.05); // Intro ramp
        else difficulty = 1.5 + (level * 0.1); // Hard ramp

        // 2. Determine Theme (Story)
        if (level <= 10) theme = "archives";
        else if (level <= 20) theme = "clocktower";
        else if (level <= 30) theme = "void";

        return {
            level: level,
            theme: theme,
            spawnRate: Math.max(500, 3000 - (difficulty * 200)), // Cap at 0.5s
            gravity: 0.5 + (difficulty * 0.1),
            mechanic: this.getMechanicForLevel(level)
        };
    }

    getMechanicForLevel(level) {
        if (level > 20) return "glitch";
        if (level > 10) return "wind";
        return "normal";
    }

    applyTheme(theme) {
        // Update CSS classes on Body to switch backgrounds
        document.body.className = ''; // Reset
        document.body.classList.add(`theme-${theme}`);
        console.log(`🎨 VISUALS: Switched to Theme '${theme}'`);
    }
}
