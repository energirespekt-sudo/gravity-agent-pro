
const MAX_LEVEL = 50;
const BASE_DROP_SPEED = 1.0; // Pixels per frame (approx)
const BASE_SPAWN_DELAY = 2000; // ms

// OUTPUT DATA
const levelData = [];

// UTILS
function getWaveMod(level) {
    const cycleLength = 5;
    const radian = (level / cycleLength) * Math.PI * 2;
    return Math.sin(radian);
}

// SIMULATE
console.log("LEVEL | SPEED | DELAY | WAVE | NOTE");
console.log("-------------------------------------");

for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {

    // 1. WAVE PHASE (Sawtooth / Sine)
    // 5-Level Cycle: 1, 2, 3, 4, 5 (Relief)
    const waveIndex = (lvl - 1) % 5; // 0, 1, 2, 3, 4

    // Intensity: 0.8, 1.0, 1.2, 1.4, 0.6 (Relief)
    let waveIntensity;
    if (waveIndex === 4) waveIntensity = 0.6; // Relief every 5th level
    else waveIntensity = 0.8 + (waveIndex * 0.2);

    // 2. LINEAR BASELINE
    // Difficulty rises linearly strictly by level
    const linearStress = 1.0 + (lvl * 0.05); // +5% per level

    // Drop Speed:
    // Cap at 15.0 (Very Fast)
    // Start at 1.0
    let dropSpeed = BASE_DROP_SPEED + (lvl * 0.15) + (waveIndex * 0.2);
    if (waveIndex === 4) dropSpeed *= 0.8; // Slow down on relief
    if (dropSpeed > 15) dropSpeed = 15;

    // Spawn Delay:
    // Cap at 400ms (Machine Gun)
    // Start at 2000ms
    let spawnDelay = BASE_SPAWN_DELAY - (lvl * 30) - (waveIndex * 150);
    if (waveIndex === 4) spawnDelay += 800; // Huge Breath on relief

    // Clamps
    if (spawnDelay < 400) spawnDelay = 400;

    // Log
    let note = "";
    if (waveIndex === 4) note = "[[ RELIEF ]]";
    if (lvl === 50) note = "[[ FINAL BOSS ]]";

    console.log(
        `${lvl.toString().padStart(2)}    | ` +
        `${dropSpeed.toFixed(2)}  | ` +
        `${Math.floor(spawnDelay)}  | ` +
        `${waveIntensity.toFixed(1)}  | ` +
        `${note}`
    );

    levelData.push({ level: lvl, speed: dropSpeed, delay: spawnDelay, intensity: waveIntensity });
}
