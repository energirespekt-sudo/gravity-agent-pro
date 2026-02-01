// GRAVITY AGENT PRO - Complete Game Engine
// Phase 19: With ChiptuneMusic + Active Word Focus

console.log("🎮 GRAVITY AGENT LOADING...");

// --- DOM REFERENCES ---
const sky = document.getElementById('sky');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const typer = document.getElementById('typer');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const shareBtn = document.getElementById('share-btn');
const inventoryEl = document.getElementById('inventory');
const strikeBar = document.getElementById('strike-bar');
const freezeCountEl = document.getElementById('freeze-count');
const nukeCountEl = document.getElementById('nuke-count');
const bossUI = document.getElementById('boss-ui');
const bossHPBar = document.getElementById('boss-hp-bar');

// --- CHIBI ASSETS ---
const chibiFiles = {
    vanguard: 'vanguard.png', cipher: 'cipher.png', echo: 'echo.png',
    flux: 'flux.png', ghost: 'ghost.png', grid: 'grid.png',
    link: 'link.png', overlord: 'overlord.png', sentry: 'sentry.png',
    static: 'static.png', trace: 'trace.png', volt: 'volt.png', breach: 'breach.png'
};

const chibiList = Object.values(chibiFiles);

// --- AUDIO CONTEXT ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function resumeAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => console.log("🔊 Audio Context Resumed"));
    }
}

function playMechanicalClick() {
    resumeAudio();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
}

// --- RPG AUDIO ENGINE (Mechanical Thock Edition) ---
// Synthesizes deep, satisfying mechanical keyboard sounds
// --- LANE MANAGER
// Lane config will be loaded from JSON (see DATA LOADING section below)
// Lane state array will be initialized when lane config loads
let laneState = []; // Timestamp of last spawn per lane

function getSafeLane(speed) {
    const now = Date.now();
    const validLanes = [];

    // Calculate required time gap based on speed to ensure vertical distance
    // Time = Distance / Speed. We want at least 150px gap.
    // speed is px/frame (approx 60fps). 
    // Speed px/sec = speed * 60.
    // Time (ms) = (Gap / (Speed * 60)) * 1000
    // Simplified: (Gap / Speed) * 16.6
    const requiredTime = (laneConfig.safeGap / Math.max(1, speed)) * 20;

    for (let i = 0; i < laneConfig.count; i++) {
        if (now - laneState[i] > requiredTime) {
            validLanes.push(i);
        }
    }

    if (validLanes.length === 0) return -1; // No lanes open
    return validLanes[Math.floor(Math.random() * validLanes.length)];
}



// --- UPDATED AUDIO ENGINE (Synthesis) ---
function playSound(type) {
    resumeAudio();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
        // "MECHANICAL CLICK" (Pure Tack-Tack)
        // No frequency sweep (piping). Just a short burst.
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.02); // Very fast drop

        gain.gain.setValueAtTime(0.1, t); // Quiet
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02); // Instant stop

        osc.start(t);
        osc.stop(t + 0.02);

    } else if (type === 'success') {
        // "POP" - Subtle Bubble Wrap (Restored Phase 28)
        // No high pitch sparkle. Just a clean, satisfying Pop.
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05); // Fast drop

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05); // Short

        osc.start(t);
        osc.stop(t + 0.05);

    } else if (type === 'error') {
        // "Buzz"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.15);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    }
}

// --- PHASE 25: FOCUSED HIGHLIGHTING (RPG CLARITY) ---
// --- CONFIG LOADING ---
const levelConfig = {
    maxLevel: 50,
    baseDropSpeed: 1.0,
    baseSpawnDelay: 2000,
    waveCycleLength: 5,
    minSpawnDelay: 400,
    maxSpawnDelay: 3000, // Added maxSpawnDelay
    maxDropSpeed: 15.0,
    linearStressPerLevel: 0.05,
    dropSpeedPerLevel: 0.15,
    dropSpeedWaveMod: 0.2,
    spawnDelayPerLevel: 30,
    spawnDelayWaveMod: 150,
    reliefModifier: 0.6
};

// --- DATA LOADING ---
let wordCurriculum = null;
let storyConfig = null;
let chibiData = null;
let laneConfig = null;
let levelProgression = null;  // NEW: 50-level progression system
let storyNarrative = null;     // NEW: Emoji story sequences
let currentStoryIndex = 0;
let dataLoaded = false;

// Load all JSON data files BEFORE allowing game to start
Promise.all([
    fetch('ue_src/WordCurriculum.json').then(r => r.json()),
    fetch('ue_src/StoryConfig.json').then(r => r.json()),
    fetch('ue_src/Config_Chibi.json').then(r => r.json()),
    fetch('ue_src/Config_Lanes.json').then(r => r.json()),
    fetch('ue_src/LevelProgression.json').then(r => r.json()),    // NEW
    fetch('ue_src/StoryNarrative.json').then(r => r.json())      // NEW
]).then(([curriculumData, storyData, chibiDataFile, laneData, progressionData, narrativeData]) => {
    wordCurriculum = curriculumData;
    storyConfig = storyData;
    chibiData = chibiDataFile;
    laneConfig = laneData;
    levelProgression = progressionData;  // NEW
    storyNarrative = narrativeData;      // NEW
    laneState = new Array(laneConfig.count).fill(0);
    dataLoaded = true;

    console.log('✅ ALL DATA LOADED');
    console.log('  - Word Curriculum:', wordCurriculum ? 'OK' : 'FAIL');
    console.log('  - Story Config:', storyConfig ? 'OK' : 'FAIL');
    console.log('  - Chibi Data:', chibiData ? 'OK' : 'FAIL');
    console.log('  - Lane Config:', laneConfig ? 'OK' : 'FAIL');
    console.log('  - Level Progression:', levelProgression ? 'OK' : 'FAIL');  // NEW
    console.log('  - Story Narrative:', storyNarrative ? 'OK' : 'FAIL');      // NEW

    // Enable start button only after data loads
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'INITIATE MISSION';
    }
}).catch(e => {
    console.error('❌ CRITICAL: Failed to load game data:', e);
    if (startBtn) {
        startBtn.textContent = 'DATA LOAD ERROR';
        startBtn.disabled = true;
    }
});

// Disable start button until data loads
if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'LOADING DATA...';
}

// --- DIFFICULTY ENGINE ---
function getLevelParams(level) {
    const waveIndex = (level - 1) % levelConfig.waveCycleLength;
    const isRelief = waveIndex === (levelConfig.waveCycleLength - 1);

    // Intensity Curve: 0.8 -> 1.4 -> 0.6 (Relief)
    let intensity = isRelief ? levelConfig.reliefModifier : (0.8 + (waveIndex * 0.2));

    // Calculate Speed
    let speed = levelConfig.baseDropSpeed + (level * levelConfig.dropSpeedPerLevel) + (waveIndex * levelConfig.dropSpeedWaveMod);
    if (isRelief) speed *= 0.8;
    speed = Math.min(speed, levelConfig.maxDropSpeed);

    // Calculate Delay
    let delay = levelConfig.baseSpawnDelay - (level * levelConfig.spawnDelayPerLevel) - (waveIndex * levelConfig.spawnDelayWaveMod);
    if (isRelief) delay += 800; // Breath
    delay = Math.max(delay, levelConfig.minSpawnDelay);

    return { speed, delay, intensity, isRelief };
}

// --- PHASE 17+: LIVE LETTER HIGHLIGHTING (FOCUSED VERSION) ---
function updateLetterHighlighting(typedText) {
    // Reset all highlighting first
    document.querySelectorAll('.word-on-canopy').forEach(el => {
        el.classList.remove('dimmed');
        el.querySelectorAll('.letter').forEach(l => l.classList.remove('highlight', 'active-letter'));
    });

    if (!typedText) return;

    // Find the BEST matching word (Focus Target)
    // We prioritize words that strictly START with the typed text
    const matchingObj = state.activeObjects.find(obj =>
        obj.word.toUpperCase().startsWith(typedText)
    );

    if (matchingObj) {
        // Dim everyone else to focus on the target
        state.activeObjects.forEach(obj => {
            if (obj !== matchingObj) {
                const wordEl = obj.el.querySelector('.word-on-canopy');
                if (wordEl) wordEl.classList.add('dimmed');
            }
        });

        // Highlight the target word's letters
        const wordEl = matchingObj.el.querySelector('.word-on-canopy');
        if (wordEl) {
            const letters = wordEl.querySelectorAll('.letter');
            for (let i = 0; i < typedText.length; i++) {
                if (letters[i]) letters[i].classList.add('highlight');
            }
            // Animate the next letter to guide the player? 
            if (letters[typedText.length]) {
                letters[typedText.length].classList.add('active-letter');
            }
        }
    }
}

// --- GAME STATE ---
const state = {
    vocab_bad: [
        { word: "ZORP", sheet: 1 }, { word: "BLORBLE", sheet: 1 }, { word: "SNAZZ", sheet: 1 },
        { word: "GLIMMER", sheet: 2 }, { word: "QUONK", sheet: 2 }, { word: "FLIBBERT", sheet: 2 },
        { word: "KERFUFFLE", sheet: 3 }, { word: "DISCOMBOBULATE", sheet: 3 }, { word: "SKEDADDLE", sheet: 3 }
    ],
    vocab_weird: [
        "ZONK", "FLURP", "SPLAT", "MUNCH", "GORK", "BEEP", "BOOP", "ZAP", "CRONCH", "SLURP",
        "GLOOP", "SQUISH", "ZIG", "ZAG", "POW", "BAM", "WHAM", "ZOOM", "YIKES", "OOF",
        "YEET", "YOINK", "BONK", "DOINK", "SPLASH", "CRASH", "SMASH", "TRASH", "BASH", "DASH",
        "GLITCH", "BUG", "ERROR", "NULL", "VOID", "NAN", "UNDEFINED", "ROOT", "SUDO", "GREP"
    ],
    vocab_glitch: [
        "PUFF", "ZZT", "K-CHING", "BAM", "X_X", "$@#%", "404", "ERR_CONNECTION", "SIGKILL", "SEGFAULT"
    ],
    vocab_good: [
        { word: "ROCKET", emoji: "🚀" }, { word: "CROWN", emoji: "👑" }, { word: "SUSHI", emoji: "🍣" },
        { word: "FOX", emoji: "🦊" }, { word: "CRYSTAL", emoji: "💎" }, { word: "FIRE", emoji: "🔥" }
    ],
    activeObjects: [],
    score: 0,
    highScore: 0,
    lives: 4,
    streak: 0,
    level: 1,
    speed: 1.0,
    gameLoop: null,
    spawnLoop: null,
    isPlaying: false,
    activeWordIndex: -1,
    lastAudioTime: 0,
    hitStopActive: 0,
    startTime: Date.now(),
    charsTyped: 0,
    wpm: 0,
    dynamicSpeedMod: 0,
    powerUps: { freeze: 0, nuke: 0 },
    freezeActive: 0,
    bossActive: false,
    bossHP: 100,
    bossMaxHP: 100,
    bossPhase: 0,
    // NEW: XP & Progression System
    xp: 0,
    totalXP: 0,
    wordsTypedThisLevel: 0,
    avgWPM: 0,
    avgAccuracy: 1.0,
    comboCount: 0,
    perfectStreak: 0
};

// --- XP & PROGRESSION SYSTEM ---
function calculateWPM() {
    const timeElapsed = (Date.now() - state.startTime) / 60000; // minutes
    if (timeElapsed === 0) return 0;
    const wordsTyped = state.charsTyped / 5; // Standard: 5 chars = 1 word
    return Math.round(wordsTyped / timeElapsed);
}

function awardXP(wordLength, accuracy, speed) {
    if (!levelProgression || !levelProgression.xpSystem) return 0;

    const xpConfig = levelProgression.xpSystem;
    const baseXP = wordLength * xpConfig.baseXpPerWord;

    // Accuracy bonus
    let accuracyBonus = xpConfig.accuracyBonus.acceptable;
    if (accuracy >= 1.0) accuracyBonus = xpConfig.accuracyBonus.perfect;
    else if (accuracy >= 0.95) accuracyBonus = xpConfig.accuracyBonus.excellent;
    else if (accuracy >= 0.90) accuracyBonus = xpConfig.accuracyBonus.good;

    // Speed bonus
    const speedBonus = speed > state.avgWPM ?
        xpConfig.speedBonus.aboveAverage :
        xpConfig.speedBonus.average;

    // Combo multiplier
    let comboMultiplier = 1.0;
    if (xpConfig.comboMultiplier.enabled) {
        const comboTier = Math.floor(state.comboCount / xpConfig.comboMultiplier.wordsPerTier);
        comboMultiplier = Math.min(
            1.0 + (comboTier * 0.2),
            xpConfig.comboMultiplier.maxMultiplier
        );
    }

    const finalXP = Math.round(baseXP * accuracyBonus * speedBonus * comboMultiplier);

    state.xp += finalXP;
    state.totalXP += finalXP;
    state.wordsTypedThisLevel++;

    console.log(`💎 +${finalXP} XP (${wordLength} chars × ${accuracyBonus.toFixed(1)}acc × ${speedBonus.toFixed(1)}spd × ${comboMultiplier.toFixed(1)}combo)`);

    return finalXP;
}

function checkLevelUp() {
    // TODO: Implement XP threshold for leveling up
    // For now, use existing level progression
    return false;
}

function getStorySequenceForLevel(level) {
    if (!storyNarrative || !storyNarrative.acts) return null;

    for (const act of storyNarrative.acts) {
        const sequence = act.sequences.find(s => s.level === level);
        if (sequence) return sequence;
    }
    return null;
}

function shouldTriggerStoryMode(level) {
    // Story mode triggers every level that has a sequence
    return getStorySequenceForLevel(level) !== null;
}

// --- STORY MODE: SQUAD SPAWNER ---
function spawnStorySequence() {
    if (!storyConfig || !storyConfig.chapters) return;

    // Get Current Chapter (for now, just use first chapter)
    const chapter = storyConfig.chapters[0];

    // Get next 3 words from sequence
    const wordsToSpawn = chapter.sequence.slice(currentStoryIndex, currentStoryIndex + 3);

    if (wordsToSpawn.length === 0) {
        currentStoryIndex = 0; // Loop back to start
        return;
    }

    // Calculate starting lane to center the words
    const startLane = Math.floor((laneConfig.count - wordsToSpawn.length) / 2);

    // Spawn each word in adjacent lanes (horizontal line)
    wordsToSpawn.forEach((word, i) => {
        const lane = startLane + i;

        // Get random chibi for each word
        const chibiKeys = Object.keys(chibiData);
        const randKey = chibiKeys[Math.floor(Math.random() * chibiKeys.length)];
        const chibiObj = chibiData[randKey];

        // Create the word with forced lane
        createWord(word, chibiObj.file, 'story', lane);
        currentStoryIndex++;
    });

    // Pause normal spawning for a moment (give player time to read the sentence)
    clearTimeout(state.spawnTimer);
    state.spawnTimer = setTimeout(spawnWord, 4000); // 4 seconds pause
}

// --- HIGH SCORE PERSISTENCE ---
const STORAGE_KEY = 'gravity_agent_highscore';
function loadHighScore() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
}
function saveHighScore(score) {
    localStorage.setItem(STORAGE_KEY, score.toString());
    console.log(`💾 HIGH SCORE SAVED: ${score}`);
}



function spawnWord() {
    if (!state.isPlaying) return;

    // Boss Mode Handling
    if (state.bossActive) {
        if (state.activeObjects.length < 3 && Math.random() < 0.3) {
            const bossWords = ["DECRYPT", "FIREWALL", "QUANTUM", "BREACH"];
            const word = bossWords[Math.floor(Math.random() * bossWords.length)];
            const chibiKeys = Object.keys(chibiData);
            const randKey = chibiKeys[Math.floor(Math.random() * chibiKeys.length)];
            createWord(word, chibiData[randKey].file, 'boss');
        }
        state.spawnTimer = setTimeout(spawnWord, 2000);
        return;
    }

    // --- STORY MODE TRIGGER ---
    if (state.charsTyped > 0 && state.charsTyped % 50 === 0) {
        if (Math.random() > 0.8) {
            spawnStorySequence();
            return;
        }
    }

    // --- REGULAR CURRICULUM-BASED SPAWNING ---
    const params = getLevelParams(state.level);
    const curriculum = wordCurriculum ? wordCurriculum.curriculum : [];

    // Find matching stage for current level
    let pool = [];
    for (let stage of curriculum) {
        if (state.level >= stage.levels[0] && state.level <= stage.levels[1]) {
            pool = stage.words;
            break;
        }
    }

    // Fallback to last stage if no match
    if (pool.length === 0 && curriculum.length > 0) {
        pool = curriculum[curriculum.length - 1].words;
    } else if (pool.length === 0) {
        pool = ['ERROR']; // Safety fallback
    }

    const word = pool[Math.floor(Math.random() * pool.length)];

    // Select random chibi
    const chibiKeys = Object.keys(chibiData);
    const randKey = chibiKeys[Math.floor(Math.random() * chibiKeys.length)];
    const chibiObj = chibiData[randKey];

    createWord(word, chibiObj.file, 'normal');

    // Calculate next spawn timing based on word complexity
    const complexKeys = ['Q', 'Z', 'X', 'J', 'K', 'V'];
    let complexityScore = 0;
    for (let char of word) {
        if (complexKeys.includes(char.toUpperCase())) complexityScore += 0.5;
    }
    const chars = word.length;
    let finalDelay = params.delay + (chars * 50) + (complexityScore * 150);

    state.spawnTimer = setTimeout(spawnWord, finalDelay);
}


// Music disabled per user request ("ta bort musiken")
// MusicEngine.start(); 
// ChiptuneMusic.start();

function getDifficultyPool() {
    if (state.level <= 10) {
        return [...state.vocab_bad, ...state.vocab_good];
    } else if (state.level <= 20) {
        return [...state.vocab_bad, ...state.vocab_weird.slice(0, 20), ...state.vocab_good];
    } else if (state.level <= 30) {
        return [...state.vocab_weird, ...state.vocab_glitch, ...state.vocab_good];
    } else {
        return [...state.vocab_weird, ...state.vocab_glitch, ...state.vocab_good];
    }
}

// (Old function removed to fix duplicate declaration)
function createWord(word, chibiFile, type) {
    const obj = document.createElement('div');
    obj.className = 'falling-object';
    const laneWidth = window.innerWidth / 6;
    const lane = Math.floor(Math.random() * 6);
    const x = lane * laneWidth + laneWidth / 2 - 40;
    obj.style.left = `${x}px`;
    obj.style.top = '-100px';
    obj.innerHTML = `
        <div class="parachute-canopy">
            <div class="word-on-canopy" data-original-word="${word}">
                ${word.split('').map(char => `<span class="letter">${char}</span>`).join('')}
            </div>
        </div>
        <div class="parachute-lines"></div>
        <div class="chibi-container" style="background-image: url('assets/chibi/${chibiFile}')"></div>
    `;
    sky.appendChild(obj);
    state.activeObjects.push({
        el: obj,
        word: word,
        y: -100,
        velocity: 0, // PHASE 20: Gravity Init
        type: type,
        chibiFile: chibiFile
    });
}

// PHASE 22: VISCERAL FEEDBACK LOGIC
function destroyWord(index, isSuccess) {
    if (index < 0 || index >= state.activeObjects.length) return;

    const obj = state.activeObjects[index];
    if (!obj) return;

    // Capture coordinates BEFORE removal for animations
    const rect = obj.el.getBoundingClientRect();
    const wordEl = obj.el;

    if (isSuccess) {
        playSound('hit');

        // Calculate score
        const basePoints = obj.word.length * 10;
        const bonusPoints = state.streak * 5;
        const totalPoints = basePoints + bonusPoints;
        state.score += totalPoints;
        state.streak++;

        // Calculate WPM for XP system
        const currentWPM = calculateWPM();
        state.avgWPM = state.avgWPM === 0 ? currentWPM : (state.avgWPM + currentWPM) / 2;

        // Award XP based on accuracy and speed
        const accuracy = 1.0; // Perfect if word was fully typed
        awardXP(obj.word.length, accuracy, currentWPM);

        // Boss mode handling
        if (state.bossActive) damageBoss(10);

        // Power-up rewards
        if (state.streak % 10 === 0 && state.streak > 0) {
            state.powerUps.freeze++;
            updatePowerUpUI();
        }

        // Good word handling (inventory)
        if (obj.type === 'good') {
            state.score += 200;
            addToInventory(obj, rect);
            state.powerUps.nuke++;
            updatePowerUpUI();
        }

        // Update displays
        updateScoreDisplay();
        updateCombo(state.streak);

        // Level up check
        if (state.score >= state.level * 1000) {
            levelUp();
        }

    } else {
        // Word reached bottom (failed)
        playSound('damage');
        document.body.classList.add('visual-disturbance');
        document.body.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-30deg)';
        setTimeout(() => {
            document.body.classList.remove('visual-disturbance');
            document.body.style.filter = 'none';
        }, 400);
        state.lives--;
        state.streak = 0;
        state.comboCount = 0; // Reset combo
        updateCombo(0);
        updateHUD();
        if (state.lives <= 0) {
            gameOver();
        }
    }

    // CRITICAL: Remove element from DOM and array
    wordEl.remove();
    state.activeObjects.splice(index, 1);
}

// PHASE 22: FLY ANIMATION (VISCERAL FEEDBACK)
function addToInventory(obj, startRect) {
    // 1. Coordinates (passed from destroyWord to ensure validity)
    // Fallback if startRect is missing (safety)
    if (!startRect) {
        startRect = { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    }

    const targetEl = document.getElementById('inventory-container');
    const targetRect = targetEl.getBoundingClientRect();

    // 2. Create Flying Clone
    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.width = '50px';
    flyer.style.height = '50px';
    flyer.style.backgroundImage = `url('assets/chibi/${obj.chibiFile}')`;
    flyer.style.backgroundSize = 'contain';
    flyer.style.backgroundRepeat = 'no-repeat';
    flyer.style.zIndex = '9999';
    flyer.style.pointerEvents = 'none';
    flyer.style.filter = 'drop-shadow(0 0 10px #00ffff)';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)'; // Exponential ease out
    document.body.appendChild(flyer);

    // 3. Trigger Animation (Next Frame)
    requestAnimationFrame(() => {
        // Target center of inventory container (or slightly offset)
        flyer.style.left = `${targetRect.right - 60}px`;
        flyer.style.top = `${targetRect.bottom - 60}px`;
        flyer.style.transform = 'scale(0.5)';
        flyer.style.opacity = '0.8';
    });

    // 4. On Arrival: Add to real inventory
    setTimeout(() => {
        flyer.remove();

        // Add static item to inventory UI
        const item = document.createElement('div');
        item.style.backgroundImage = `url('assets/chibi/${obj.chibiFile}')`;
        item.style.width = '32px';
        item.style.height = '32px';
        item.style.margin = '2px';
        item.style.cursor = 'pointer';
        item.style.backgroundSize = 'contain';
        item.classList.add('inventory-item'); // For CSS styling if needed

        // "Pop" effect
        item.animate([
            { transform: 'scale(0)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });

        item.onclick = () => {
            navigator.clipboard.writeText(obj.word);
            // Visual feedback
        };
        inventoryEl.appendChild(item);
        inventoryEl.scrollTop = inventoryEl.scrollHeight;
    }, 800);
}




function damageBoss(amount) {
    state.bossHP -= amount;
    if (state.bossHP <= 0) {
        state.bossHP = 0;
        endBoss();
    }
    updateBossUI();
}

function endBoss() {
    state.bossActive = false;
    bossUI.classList.add('hidden');
    state.score += 5000;
    playSound('success');
    updateScoreDisplay();
}

function updateBossUI() {
    const pct = (state.bossHP / state.bossMaxHP) * 100;
    bossHPBar.style.width = `${pct}%`;
}

function levelUp() {
    state.level++;
    levelEl.textContent = state.level.toString().padStart(2, '0');
    if (state.level % 10 === 0 && state.level <= 40) {
        startBoss();
    }
}

function startBoss() {
    state.bossActive = true;
    state.bossHP = 100;
    state.bossMaxHP = 100;
    state.bossPhase = 0;
    bossUI.classList.remove('hidden');
    updateBossUI();
    clearTimeout(state.spawnTimer);
    spawnWord();
}



function updateHUD() {
    // Clamp lives to prevent negative .repeat() crash
    const safeLives = Math.max(0, state.lives);
    livesEl.textContent = "❤️".repeat(safeLives);
}

function updateCombo(val) {
    strikeBar.style.width = `${val * 10}%`;
}

function updateScoreDisplay() {
    scoreEl.textContent = state.score.toString().padStart(5, '0');
}

function updatePowerUpUI() {
    freezeCountEl.textContent = state.powerUps.freeze;
    nukeCountEl.textContent = state.powerUps.nuke;
}


function gameOver() {
    state.isPlaying = false;
    cancelAnimationFrame(state.gameLoop);
    clearTimeout(state.spawnTimer);
    const isNewRecord = state.score > state.highScore;
    if (isNewRecord) {
        state.highScore = state.score;
        saveHighScore(state.highScore);
    }
    const items = inventoryEl.children;
    let penaltyMsg = "";
    if (items.length > 0) {
        const count = Math.min(items.length, 2);
        for (let i = 0; i < count; i++) {
            inventoryEl.lastElementChild.remove();
        }
        penaltyMsg = `\n⚠️ SYSTEM FAILURE: LOST ${count} COLLECTED DATA.`;
    }
    const recordMsg = isNewRecord ? "\n🏆 NEW RECORD!" : "";
    alert(`MISSION FAILED.\nSCORE: ${state.score}${recordMsg}${penaltyMsg}`);
    startScreen.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    shareBtn.classList.add('hidden');
}

function update() {
    if (!state.isPlaying) return;

    // Check freeze status
    const now = Date.now();
    const isFrozen = now < state.freezeActive;

    if (!isFrozen) {
        // Get level parameters for speed
        const params = getLevelParams(state.level);
        const baseSpeed = params.speed;
        const modifier = 1 + state.dynamicSpeedMod;

        state.activeObjects.forEach((obj, index) => {
            // Calculate velocity based on type
            let velocity = baseSpeed * modifier;
            if (obj.type === 'boss') velocity *= 0.5;

            // Apply gravity (SLOWER for readability)
            obj.velocity += 0.1; // Reduced from 0.3 to 0.1

            // Update Y position
            obj.y += obj.velocity;

            // Update DOM position
            obj.el.style.top = `${obj.y}px`;

            // Critical state warning (red glow)
            if (obj.y > window.innerHeight - 200) {
                obj.el.classList.add('critical');
            }

            // Check if word reached bottom (FAIL)
            if (obj.y > window.innerHeight - 100) {
                destroyWord(index, false);
            }
        });
    }

    // Continue game loop
    state.gameLoop = requestAnimationFrame(update);
}




function initGame() {
    startScreen.classList.add('hidden');
    document.body.classList.add('game-active');
    state.isPlaying = true;
    state.score = 0;
    state.highScore = loadHighScore();
    state.level = 1;
    state.streak = 0;
    state.speed = 1.0;
    state.lives = 3; // CRITICAL: Set lives to 3 at start
    state.activeObjects = [];
    state.charsTyped = 0;
    state.startTime = Date.now();
    state.dynamicSpeedMod = 0;
    state.powerUps.freeze = 0;
    state.powerUps.nuke = 0;
    state.bossActive = false;
    bossUI.classList.add('hidden');
    updatePowerUpUI();
    sky.innerHTML = '';
    inventoryEl.innerHTML = '';
    scoreEl.textContent = '00000';
    updateHUD();
    updateCombo(0);
    typer.value = '';
    typer.focus();
    state.gameLoop = requestAnimationFrame(update);
    spawnWord();
    shareBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
}

// --- PHASE 29: UX INPUT POLISH (Auto-Focus & Auto-Clear) ---
// 1. Aggressive Focus
function forceFocus() {
    if (!state.isPlaying && !startScreen.classList.contains('hidden')) return; // Allow interaction with start screen
    typer.focus();
}
document.addEventListener('click', forceFocus);
typer.addEventListener('blur', () => {
    // Slight delay to allow UI clicking
    setTimeout(forceFocus, 10);
});

// --- PHASE 37: THE SATISFYING ENTER (Audio & Visual Juice) ---

function triggerSuccessFeedback() {
    // 1. Audio: The "Reward"
    playSound('success');

    // 2. Visual: The "Flash"
    typer.classList.add('success-flash');

    // 3. Visual: The "Bump" (Screen Shake)
    document.body.classList.add('screen-bump');

    // Reset animations
    setTimeout(() => {
        typer.classList.remove('success-flash');
        document.body.classList.remove('screen-bump');
    }, 200);
}

// Rewritten Input Handler for Maximum Responsiveness
typer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const text = typer.value.trim().toUpperCase();

        // Always Clear Logic (UX Standard)
        typer.value = '';
        updateLetterHighlighting('');

        if (text.length > 0) {
            const idx = state.activeObjects.findIndex(o => o.word.trim().toUpperCase() === text);

            if (idx !== -1) {
                // SUCCESS: The "Twom" Moment
                destroyWord(idx, true);
                triggerSuccessFeedback();
            } else {
                // FAILURE: Subtle "Error" Feedback
                playSound('error');
                typer.classList.add('error-shake');
                setTimeout(() => typer.classList.remove('error-shake'), 200);
            }
        } else {
            // Empty Enter
            playSound('error');
        }
    }
});


startBtn.addEventListener('click', initGame);

// Initial Render
renderHighScores();
// playSound moved to single definition above

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.high-score-display')) {
        const invContainer = document.getElementById('inventory-container');
        if (invContainer) {
            const currentRecord = loadHighScore();
            const hsDiv = document.createElement('div');
            hsDiv.className = 'high-score-display';
            hsDiv.id = 'high-score-val';
            hsDiv.textContent = `HIGH SCORE: ${currentRecord}`;
            invContainer.appendChild(hsDiv);
        }
    }
});

console.log("✅ GRAVITY AGENT READY!");
