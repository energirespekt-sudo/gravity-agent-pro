export class GameOverState {
    enter(params) {
        console.log('💀 GAME OVER / VICTORY');
        const score = params ? params.score : 0;
        const isVictory = params ? params.victory : false;

        // Create DOM
        this.el = document.createElement('div');
        this.el.className = 'game-over-screen';

        // Save High Score Logic (Legacy Auto-Save)
        const currentHigh = parseInt(localStorage.getItem('gravity_highscore')) || 0;
        if (score > currentHigh) {
            localStorage.setItem('gravity_highscore', score);
        }

        // Victory vs Defeat content
        const title = isVictory ? "MISSION COMPLETE" : "SYSTEM FAILURE";
        const color = isVictory ? "#0f0" : "#f00";
        const subtext = isVictory
            ? "GRAVITY AGENT SYNC COMPLETE.<br>PROMPT ARCHIVE UNLOCKED."
            : "CONNECTION LOST";

        // Append FIRST so ID lookups work
        document.body.appendChild(this.el);
        this.renderInputScreen(title, color, score, subtext);

        // Focus Input safely
        setTimeout(() => {
            const input = document.getElementById('agent-name');
            if (input) input.focus();
        }, 100);
    }

    renderInputScreen(title, color, score, subtext) {
        this.el.innerHTML = `
            <div style="text-align:center">
                <h1 class="glitch" style="color: ${color}; font-size: 4rem; margin-bottom: 20px;">${title}</h1>
                <p style="color: white; font-size: 2rem;">FINAL SCORE: <span style="color:#00f3ff">${score}</span></p>
                <p style="font-size: 14px; opacity: 0.8; color: #ccc">${subtext}</p>
                
                <div style="margin: 40px 0;">
                    <p style="color: #00f3ff; font-weight: bold;">ENTER AGENT NAME:</p>
                    <input type="text" id="agent-name" placeholder="AGENT_X" maxlength="10" 
                           style="background:#111; border:2px solid #00f3ff; color:#fff; padding:10px; font-size:1.5rem; text-align:center; text-transform:uppercase;">
                </div>

                <button id="submit-btn" style="
                    background: transparent;
                    border: 2px solid #00f3ff;
                    color: #00f3ff;
                    padding: 15px 40px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    font-family: 'Space Mono', monospace;
                ">SUBMIT DATA</button>
            </div>
        `;

        const submitAction = () => {
            const nameIn = document.getElementById('agent-name');
            const name = (nameIn && nameIn.value) ? nameIn.value.toUpperCase() : "UNKNOWN";
            this.saveAndShowLeaderboard(name, score);
        };

        // Click Handler
        document.getElementById('submit-btn').addEventListener('click', submitAction);

        // Enter Key Handler
        document.getElementById('agent-name').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') submitAction();
        });
    }

    saveAndShowLeaderboard(name, score) {
        // Save Leaderboard
        try {
            let leaderboard = JSON.parse(localStorage.getItem('gravity_leaderboard')) || [];
            leaderboard.push({ name, score, date: new Date().toISOString() });
            // Sort Descending
            leaderboard.sort((a, b) => b.score - a.score);
            // Keep top 10
            if (leaderboard.length > 10) leaderboard.length = 10;
            localStorage.setItem('gravity_leaderboard', JSON.stringify(leaderboard));

            this.renderLeaderboard(leaderboard);
        } catch (e) { console.error("Save Error", e); }
    }

    renderLeaderboard(leaderboard) {
        let rows = leaderboard.map((entry, index) => {
            const color = index === 0 ? '#FFD700' : (index === 1 ? '#C0C0C0' : (index === 2 ? '#CD7F32' : '#fff'));
            return `
                <div style="display:flex; justify-content:space-between; width:400px; margin:5px auto; border-bottom:1px solid #333; padding:5px;">
                    <span style="color:${color}">${index + 1}. ${entry.name}</span>
                    <span style="color:#00f3ff">${entry.score}</span>
                </div>
            `;
        }).join('');

        this.el.innerHTML = `
            <div style="text-align:center">
                <h1 style="color: #00f3ff; font-size: 3rem; margin-bottom: 20px;">TOP AGENTS</h1>
                <div style="background:rgba(0,0,0,0.5); padding:20px; border:1px solid #00f3ff; margin-bottom:30px;">
                    ${rows}
                </div>
                <button id="restart-btn" style="
                    background: #00f3ff;
                    border: none;
                    color: #000;
                    padding: 15px 40px;
                    font-size: 1.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    font-family: 'Space Mono', monospace;
                ">NEW MISSION</button>
            </div>
        `;

        document.getElementById('restart-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    exit() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
}
