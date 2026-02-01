export class MenuState {
    enter() {
        console.log('🖥️ Entering MenuState');
        const overlay = document.getElementById('start-screen');
        const startBtn = document.getElementById('start-btn');

        if (overlay) overlay.classList.remove('hidden');

        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'INITIATE MISSION';
            startBtn.onclick = () => {
                // Initialize Audio Context here if needed (User Gesture)
                if (window.GravityAgent && window.GravityAgent.fsm) {
                    window.GravityAgent.fsm.change('playing');
                }
            };
        }
    }

    exit() {
        console.log('Leaving MenuState...');
        const overlay = document.getElementById('start-screen');
        if (overlay) overlay.classList.add('hidden');

        // Clean up event listeners to avoid duplicates if returning to menu
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.onclick = null;
    }
}
