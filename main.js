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

// --- RPG AUDIO ENGINE (IMPACT ONLY) ---
// Synthesizes crisp "Blade Hit" and "Coin Drop" sounds
function playSound(type) {
    resumeAudio();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Low-pass filter for "Thud" or High-pass for "Chime"
    const filter = audioCtx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
        // "BLADE HIT" - Sharp metallic impact
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.start(t);
        osc.stop(t + 0.15);

        // Add a secondary "Clang" layer for richness
        const clang = audioCtx.createOscillator();
        const clangGain = audioCtx.createGain();
        clang.type = 'triangle';
        clang.frequency.setValueAtTime(2400, t);
        clang.frequency.exponentialRampToValueAtTime(1200, t + 0.2);
        clangGain.gain.setValueAtTime(0.1, t);
        clangGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        clang.connect(audioCtx.destination);
        clang.start(t);
        clang.stop(t + 0.2);

    } else if (type === 'damage') {
        // "SHIELD BREAK" - Dull crrumble
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);

        osc.start(t);
        osc.stop(t + 0.3);

    } else if (type === 'success') {
        // "GOLD COIN" - High pitch chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.start(t);
        osc.stop(t + 0.3);
    }
}

// --- PHASE 25: FOCUSED HIGHLIGHTING (RPG CLARITY) ---
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
    bossPhase: 0
};

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
    if (state.bossActive) {
        if (state.activeObjects.length < 3 && Math.random() < 0.3) {
            const bossWords = ["DECRYPT", "FIREWALL", "QUANTUM", "BREACH"];
            const word = bossWords[Math.floor(Math.random() * bossWords.length)];
            createWord(word, chibiList[Math.floor(Math.random() * chibiList.length)], 'boss');
        }
        state.spawnTimer = setTimeout(spawnWord, 2000);
        return;
    }
    const pool = getDifficultyPool();
    const item = pool[Math.floor(Math.random() * pool.length)];
    let word, chibi, type;
    if (typeof item === 'object' && item.emoji) {
        word = item.word;
        chibi = chibiList[Math.floor(Math.random() * chibiList.length)];
        type = 'good';
    } else if (typeof item === 'object') {
        word = item.word;
        chibi = chibiList[item.sheet - 1];
        type = 'bad';
    } else {
        word = item;
        chibi = chibiList[Math.floor(Math.random() * chibiList.length)];
        type = 'weird';
    }
    createWord(word, chibi, type);
    // PHASE 21: SMART SPAWN BALANCE
    // Longer words need more time.
    // Base delay: 600ms
    // Per Character: +150ms
    // Difficulty Mod: level reduces delay
    const chars = word.length;
    const baseDelay = 600 + (chars * 150);
    const levelReduction = (state.level * 20) + (state.dynamicSpeedMod * 100);
    const delay = Math.max(800, baseDelay - levelReduction); // Minimum 800ms

    state.spawnTimer = setTimeout(spawnWord, delay);
}

// ... (CreateWord function remains)

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
    const obj = state.activeObjects[index];
    if (!obj) return;

    // Capture coordinates BEFORE removal for Fly Animation
    const rect = obj.el.getBoundingClientRect();

    obj.el.remove();
    state.activeObjects.splice(index, 1);

    if (isSuccess) {
        playSound('hit');
        state.score += 100;
        state.streak++;

        if (state.bossActive) damageBoss(10);

        if (state.streak % 10 === 0 && state.streak > 0) {
            state.powerUps.freeze++;
            updatePowerUpUI();
        }

        if (obj.type === 'good') {
            state.score += 200;
            // Pass rect to animation system
            addToInventory(obj, rect);
            state.powerUps.nuke++;
            updatePowerUpUI();
        }

        updateScoreDisplay();
        updateCombo(state.streak);

        if (state.score >= state.level * 1000) {
            levelUp();
        }
    } else {
        playSound('damage');
        document.body.classList.add('visual-disturbance');
        document.body.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-30deg)';
        setTimeout(() => {
            document.body.classList.remove('visual-disturbance');
            document.body.style.filter = 'none';
        }, 400);
        state.lives--;
        state.streak = 0;
        updateCombo(0);
        updateHUD();
        if (state.lives <= 0) {
            gameOver();
        }
    }
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
    livesEl.textContent = "❤️".repeat(state.lives);
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
    const modifier = 1 + state.dynamicSpeedMod;
    const isFrozen = Date.now() < state.freezeActive;
    state.activeObjects.forEach((obj, index) => {
        if (!isFrozen) {
            // PHASE 20: GRAVITY PHYSICS (FIXED)
            // 0.002 is the sweet spot for "Heavy but Fair"
            const gravity = 0.002 + (state.level * 0.0001);
            obj.velocity += gravity;

            // Terminal velocity cap
            const maxV = 10 + state.level;
            if (obj.velocity > maxV) obj.velocity = maxV;

            obj.y += obj.velocity * modifier;
            obj.el.style.top = `${obj.y}px`;
        }

        // Critical State (Red Parachute)
        if (obj.y > window.innerHeight - 250 && obj.y < window.innerHeight - 100) {
            obj.el.classList.add('critical'); // Triggers Red Pulse
        } else {
            obj.el.classList.remove('critical');
        }

        if (obj.y > window.innerHeight - 100) {
            destroyWord(index, false);
        }
    });
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

typer.addEventListener('input', (e) => {
    state.charsTyped++;
    playSound('hit');
    const val = e.target.value.toUpperCase().trim();
    updateLetterHighlighting(val);
    const idx = state.activeObjects.findIndex(o => o.word.trim().toUpperCase() === val);
    if (idx !== -1) {
        destroyWord(idx, true);
        typer.value = '';
        typer.style.borderColor = '#00ff00';
        typer.style.boxShadow = '0 0 20px #00ff00';
        setTimeout(() => {
            typer.style.borderColor = 'var(--neon-pink)';
            typer.style.boxShadow = '0 0 10px rgba(255, 0, 85, 0.2)';
        }, 100);
    }
});

startBtn.addEventListener('click', initGame);

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
