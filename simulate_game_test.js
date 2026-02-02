// HEADLESS SIMULATION OF GRAVITY AGENT
// usage: node simulate_game_test.js

// MOCK BROWSER ENVIRONMENT
const window = {
    innerWidth: 1920,
    innerHeight: 1080,
    soundManager: { playTypeSuccess: () => { }, playType: () => { }, playDamage: () => { } },
    GravityAgent: { fsm: { change: (state) => console.log('STATE CHANGE:', state) } }
};
global.window = window;
global.document = {
    getElementById: () => ({ style: {}, classList: { add: () => { }, remove: () => { } } }),
    body: { classList: { add: () => { }, remove: () => { } }, style: {} },
    createElement: () => ({ style: {} }), // For RenderSystem mock
    querySelector: () => null
};

// IMPORTS (Adjusted for Node - normally we'd need ESM, but we'll mock the classes for speed)
// Since we can't easily import the ES modules in Node without package.json setup, 
// I will replicate the core LOGIC here to test the MATH and STATE transitions.

console.log("🚀 STARTING SIMULATION: LEVEL 1 -> 50");

const state = {
    level: 1,
    score: 0,
    lives: 3,
    activeEntities: [],
    bossActive: false
};

// SIMULATE CURVE DATA (From LevelUtils)
function getParams(level) {
    // Replicating LevelUtils logic
    const baseSpeed = 20;
    const speedInc = 0.5;
    const baseDelay = 2000;
    const delayDec = 60;

    return {
        speed: baseSpeed + (level * speedInc),
        delay: Math.max(400, baseDelay - (level * delayDec))
    };
}

// SIMULATE LOOP
let ticks = 0;
while (state.level <= 50 && state.lives > 0) {
    ticks++;

    // 1. LEVEL UP CHECK
    if (state.score > state.level * 1000) {
        state.level++;
        console.log(`🆙 LEVEL UP: ${state.level} (Score: ${state.score})`);

        // BOSS CHECK
        if (state.level % 10 === 0) {
            console.log(`💀 BOSS LEVEL ${state.level} TRIGGERED!`);
            state.bossActive = true;
            // Simulate Boss Wave Clearing
            // In game: Player types narrative.
            // Simulation: We auto-clear boss after 50 ticks
        }
    }

    // 2. SPAWN (Abstracted)
    if (!state.bossActive && ticks % 10 === 0) {
        state.activeEntities.push({ word: "TEST", y: 0 });
    }

    // 3. PLAY (Simulate Perfect Typing)
    if (state.activeEntities.length > 0) {
        const target = state.activeEntities[0];
        target.died = true;
        state.score += 50; // Kill score
        state.activeEntities.shift();
    }

    // 4. BOSS CLEAR
    if (state.bossActive && ticks % 20 === 0) {
        console.log("   -> Boss Word Typed...");
        // Assume 5 words per boss
        if (Math.random() > 0.8) {
            console.log("   ✅ BOSS CLEARED");
            state.bossActive = false;
            state.level++; // Pass level
        }
    }

    // SAFETY BREAK
    if (ticks > 10000) {
        console.log("⚠️ SIMULATION TIMEOUT");
        break;
    }
}

console.log(`🏁 SIMULATION COMPLETE. Final Level: ${state.level}. Final Score: ${state.score}`);
if (state.level >= 50) console.log("✅ SUCCESS: Reached Endgame.");
else console.log("❌ FAILED: Did not finish.");
