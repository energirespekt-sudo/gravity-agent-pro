/**
 * GameOps - Engine Operations & Console Control
 * "Unity-MCP" equivalent for runtime manipulation.
 */
export class GameOps {
    constructor(gameLoop, stateMachine) {
        this.loop = gameLoop;
        this.fsm = stateMachine;
        this.bindGlobal();
    }

    bindGlobal() {
        window.GameOps = {
            // State Jumps
            loadState: (name) => {
                console.log(`🔧 GameOps: Forcing State -> ${name}`);
                try {
                    // Pass empty params to avoid undefined errors
                    this.fsm.change(name, { manualOverride: true });
                } catch (e) {
                    console.error(`❌ GameOps Failed to load state '${name}'.`, e);
                    alert(`Failed to load state '${name}': ${e.message}`);
                }
            },

            // Time Control (Requires support in GameLoop, placeholder for now)
            setTimeScale: (scale) => {
                console.log(`🔧 GameOps: Time Scale -> ${scale}`);
                if (this.loop.setTimeScale) {
                    this.loop.setTimeScale(scale);
                } else {
                    console.warn("GameLoop does not support time scaling yet. Implement 'setTimeScale' in GameLoop.js");
                }
            },

            // Entity Inspection
            listEntities: () => {
                const state = this.fsm.currentState; // Accessing the current state instance
                if (state && state.entityManager) {
                    console.log(`📦 Active Entities in '${this.fsm.currentStateName}':`, state.entityManager.entities.length);
                    // console.table is great but can be huge, let's limit output
                    console.table(state.entityManager.entities.map(e => ({
                        id: e.id,
                        type: e.type,
                        active: e.isActive,
                        pos: e.components.get('Position') ? Math.floor(e.components.get('Position').y) : 'N/A'
                    })));
                } else {
                    console.warn("Current state has no entityManager or is not exposed.");
                }
            },

            // God Mode (Inject into PlayingState)
            godMode: (enable = true) => {
                const state = this.fsm.currentState;
                if (this.fsm.currentStateName === 'playing') {
                    state.godMode = enable;
                    console.log(`🛡️ God Mode: ${enable ? 'ON' : 'OFF'}`);
                } else {
                    console.warn("God Mode only available in 'playing' state.");
                }
            },

            // Help
            help: () => {
                console.log(`
                🛠️ ENGINE OPS CONSOLE 🛠️
                ---------------------------
                GameOps.loadState('name')  -> Jump to state (menu, playing, boss2, warning)
                GameOps.listEntities()     -> Show active ECS entities
                GameOps.godMode(true/false)-> Toggle invincibility (PlayingState)
                `);
            }
        };
        console.log("🔧 Engine Ops (GameOps) Mounted. Type 'GameOps.help()' for commands.");
    }
}
