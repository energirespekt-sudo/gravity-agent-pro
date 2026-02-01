export class GameOverState {
    enter(params) {
        console.log('💀 Entering GameOverState', params);
        const overlay = document.getElementById('start-screen');
        const startBtn = document.getElementById('start-btn');
        const title = overlay.querySelector('h1');
        const desc = overlay.querySelector('p'); // Assuming structure matches index.html

        if (overlay) overlay.classList.remove('hidden');

        if (title) title.textContent = 'MISSION FAILED';
        if (desc) desc.textContent = `FINAL SCORE: ${params.score || 0}`;

        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'RETRY MISSION';
            startBtn.classList.remove('hidden');
            startBtn.onclick = () => {
                if (window.GravityAgent && window.GravityAgent.fsm) {
                    window.GravityAgent.fsm.change('playing');
                }
            };
        }
    }

    exit() {
        const overlay = document.getElementById('start-screen');
        if (overlay) overlay.classList.add('hidden');

        // Reset title for next time (optional, handled by enter() typically)
        const title = overlay.querySelector('h1');
        if (title) title.textContent = 'EMOJI HUNT';
    }
}
