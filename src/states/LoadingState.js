import { Globals } from '../core/Globals.js';

export class LoadingState {
    async enter() {
        console.log('⏳ Entering LoadingState (Static Load)...');
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = 'INITIALIZING SYSTEM...';
        }

        // Simulate short loading time for UX (data is already imported statically)
        setTimeout(() => {
            this.finalizeLoad();
        }, 1000);
    }

    finalizeLoad() {
        Globals.isDataLoaded = true;

        // Ensure defaults exist
        Globals.storyConfig = { enabled: false };
        Globals.chibiData = {};

        console.log('✅ System Ready');
        if (window.GravityAgent && window.GravityAgent.fsm) {
            window.GravityAgent.fsm.change('menu');
        }
    }
}
