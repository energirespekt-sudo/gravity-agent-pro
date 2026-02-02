import curriculumData from './WordCurriculum.json';

export class WordCurriculum {
    constructor() {
        this.data = curriculumData;
        this.curriculum = this.data.curriculum || [];
        this.generalWords = this.curriculum.flatMap(s => s.words) || ["ERROR", "FIX"];
    }

    getWord(level) {
        // Find Stage for Level
        const stage = this.curriculum.find(s => level >= s.levels[0] && level <= s.levels[1]);

        let pool = [];
        if (stage) {
            pool = stage.words;
        } else {
            // Fallback: Last stage or all words
            pool = this.generalWords;
        }

        if (!pool || pool.length === 0) return "VOID";

        return pool[Math.floor(Math.random() * pool.length)];
    }

    getBossWords(level) {
        if (this.data.boss_levels && this.data.boss_levels[level]) {
            return this.data.boss_levels[level]; // Returns Array of Strings
        }
        return null;
    }

    getStageInfo(level) {
        return this.curriculum.find(s => level >= s.levels[0] && level <= s.levels[1]);
    }
}
