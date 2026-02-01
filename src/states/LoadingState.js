import { Globals } from '../core/Globals.js';

export class LoadingState {
    async enter() {
        console.log('⏳ Entering LoadingState...');
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = 'LOADING DATA... (ENGINE 2.0)';
        }

        try {
            await this.loadData();
            Globals.isDataLoaded = true;
            console.log('✅ All Data Loaded');
            if (window.GravityAgent && window.GravityAgent.fsm) {
                window.GravityAgent.fsm.change('menu');
            }
        } catch (e) {
            console.error('❌ Data Load Error:', e);
            if (startBtn) startBtn.textContent = 'DATA LOAD FAIL';
        }
    }

    async loadData() {
        const [curr, story, chibi, lane, prog, narr] = await Promise.all([
            fetch('ue_src/WordCurriculum.json').then(r => r.json()),
            fetch('ue_src/StoryConfig.json').then(r => r.json()),
            fetch('ue_src/Config_Chibi.json').then(r => r.json()),
            fetch('ue_src/Config_Lanes.json').then(r => r.json()),
            fetch('ue_src/LevelProgression.json').then(r => r.json()),
            fetch('ue_src/StoryNarrative.json').then(r => r.json())
        ]);

        Globals.wordCurriculum = curr;
        Globals.storyConfig = story;
        Globals.chibiData = chibi;
        Globals.laneConfig = lane;
        Globals.levelProgression = prog;
        Globals.storyNarrative = narr;
    }
}
