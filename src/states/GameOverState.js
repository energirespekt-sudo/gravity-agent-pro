export class GameOverState {
    enter(params) {
        console.log('💀 GAME OVER / VICTORY');
        const score = params ? params.score : 0;
        const isVictory = params ? params.victory : false;

        // Create DOM
        this.el = document.createElement('div');
        this.el.className = 'game-over-screen';

        // Save High Score Logic
        const currentHigh = parseInt(localStorage.getItem('gravity_highscore')) || 0;
        if (score > currentHigh) {
            localStorage.setItem('gravity_highscore', score);
        }

        // Victory vs Defeat content
        const titleText = isVictory ? "MISSION COMPLETE" : "SYSTEM FAILURE";
        const titleClass = isVictory ? "victory" : "defeat";
        const subtext = isVictory
            ? "GRAVITY AGENT SYNC COMPLETE.<br>PROMPT ARCHIVE UNLOCKED."
            : "CONNECTION LOST. SIGNAL TERMINATED.";

        // Append to body
        document.body.appendChild(this.el);
        this.renderInputScreen(titleText, titleClass, score, subtext, isVictory);

        // Focus Input safely
        setTimeout(() => {
            const input = document.getElementById('agent-name');
            if (input) input.focus();
        }, 100);
    }

    renderInputScreen(title, titleClass, score, subtext, isVictory) {
        this.el.innerHTML = `
            <div class="game-over-content">
                <h1 class="game-over-title ${titleClass} glitch">${title}</h1>
                
                <div class="game-over-score">
                    FINAL SCORE: <span>${score}</span>
                </div>
                
                <div class="game-over-subtext">${subtext}</div>
                
                <div class="agent-input-group">
                    <label class="agent-input-label">ENTER AGENT ID</label>
                    <input type="text" id="agent-name" class="agent-input" placeholder="AGENT_X" maxlength="10">
                </div>

                <button id="submit-btn" class="neon-btn ${isVictory ? 'victory-btn' : ''}">SUBMIT DATA</button>
            </div>
        `;

        const submitAction = () => {
            const nameIn = document.getElementById('agent-name');
            const name = (nameIn && nameIn.value) ? nameIn.value.toUpperCase() : "UNKNOWN";
            this.saveAndShowLeaderboard(name, score, isVictory);
        };

        // Click Handler
        document.getElementById('submit-btn').addEventListener('click', submitAction);

        // Enter Key Handler
        document.getElementById('agent-name').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') submitAction();
        });
    }

    saveAndShowLeaderboard(name, score, isVictory) {
        // Save Leaderboard
        try {
            let leaderboard = JSON.parse(localStorage.getItem('gravity_leaderboard')) || [];
            leaderboard.push({ name, score, date: new Date().toISOString() });
            // Sort Descending
            leaderboard.sort((a, b) => b.score - a.score);
            // Keep top 10
            if (leaderboard.length > 10) leaderboard.length = 10;
            localStorage.setItem('gravity_leaderboard', JSON.stringify(leaderboard));

            this.renderLeaderboard(leaderboard, isVictory);
        } catch (e) { console.error("Save Error", e); }
    }

    renderLeaderboard(leaderboard, isVictory) {
        let rows = leaderboard.map((entry, index) => {
            // Rank styling is handled by CSS nth-child or first-child mostly, 
            // but we can add specific classes if needed.
            return `
                <div class="leaderboard-row">
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score}</span>
                </div>
            `;
        }).join('');

        this.el.innerHTML = `
            <div class="game-over-content">
                <h1 class="game-over-title ${isVictory ? 'victory' : 'defeat'}">TOP AGENTS</h1>
                
                <div class="leaderboard-container">
                    ${rows}
                </div>

                <button id="restart-btn" class="neon-btn ${isVictory ? 'victory-btn' : ''}">NEW MISSION</button>
            </div>
        `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            // Reload page to ensure clean state
            window.location.reload();
        });
    }

    exit() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
}
