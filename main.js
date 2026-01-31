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

// --- MUSIC ENGINE ---
const MusicEngine = {
    ctx: audioCtx,
    nodes: [],
    start: function () {
        if (this.nodes.length > 0) return;
        const t = this.ctx.currentTime;
        const pulseOsc = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();
        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(32.7, t);
        pulseGain.gain.setValueAtTime(0.05, t);
        pulseOsc.connect(pulseGain);
        pulseGain.connect(this.ctx.destination);
        pulseOsc.start(t);
        this.nodes.push({ id: 'pulse', osc: pulseOsc, gain: pulseGain });

        const droneOsc = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(65.41, t);
        droneGain.gain.setValueAtTime(0.02, t);
        droneOsc.connect(droneGain);
        droneGain.connect(this.ctx.destination);
        droneOsc.start(t);
        this.nodes.push({ id: 'drone', osc: droneOsc, gain: droneGain });
    },
    stop: function () {
        this.nodes.forEach(n => {
            try { n.osc.stop(); n.gain.disconnect(); } catch (e) { }
        });
        this.nodes = [];
    },
    update: function () {
        const t = this.ctx.currentTime;
        const pulseLayer = this.nodes.find(n => n.id === 'pulse');
        if (pulseLayer) {
            if (state.bossActive) {
                pulseLayer.osc.frequency.linearRampToValueAtTime(65.41, t + 1);
            } else {
                pulseLayer.osc.frequency.linearRampToValueAtTime(32.7, t + 1);
            }
        }
        const droneLayer = this.nodes.find(n => n.id === 'drone');
        if (droneLayer && state.dynamicSpeedMod > 0.2) {
            droneLayer.osc.frequency.linearRampToValueAtTime(65.41 + (state.dynamicSpeedMod * 5), t + 1);
        }
    }
};

// --- PHASE 19: CHIPTUNE BACKGROUND MUSIC ENGINE ---
const ChiptuneMusic = {
    ctx: audioCtx,
    isPlaying: false,
    melodyOsc: null,
    bassOsc: null,
    melodyGain: null,
    bassGain: null,
    noteIndex: 0,
    intervalId: null,
    melody: [
        523.25, 659.25, 783.99, 659.25,
        587.33, 698.46, 880.00, 698.46,
        659.25, 783.99, 1046.5, 783.99,
        783.99, 659.25, 523.25, 0
    ],
    bass: [
        130.81, 130.81, 130.81, 130.81,
        146.83, 146.83, 146.83, 146.83,
        164.81, 164.81, 164.81, 164.81,
        196.00, 196.00, 130.81, 0
    ],
    start: function () {
        if (this.isPlaying) return;
        resumeAudio();
        this.isPlaying = true;
        this.melodyOsc = this.ctx.createOscillator();
        this.melodyGain = this.ctx.createGain();
        this.melodyOsc.type = 'square';
        this.melodyGain.gain.value = 0.08;
        this.melodyOsc.connect(this.melodyGain);
        this.melodyGain.connect(this.ctx.destination);
        this.melodyOsc.start();
        this.bassOsc = this.ctx.createOscillator();
        this.bassGain = this.ctx.createGain();
        this.bassOsc.type = 'square';
        this.bassGain.gain.value = 0.05;
        this.bassOsc.connect(this.bassGain);
        this.bassGain.connect(this.ctx.destination);
        this.bassOsc.start();
        this.playNote();
        this.intervalId = setInterval(() => this.playNote(), 428);
    },
    playNote: function () {
        if (!this.isPlaying) return;
        const melodyFreq = this.melody[this.noteIndex];
        const bassFreq = this.bass[this.noteIndex];
        if (melodyFreq > 0) {
            this.melodyOsc.frequency.setValueAtTime(melodyFreq, this.ctx.currentTime);
            this.melodyGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        } else {
            this.melodyGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        if (bassFreq > 0) {
            this.bassOsc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
            this.bassGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        } else {
            this.bassGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    },
    stop: function () {
        if (!this.isPlaying) return;
        clearInterval(this.intervalId);
        try {
            if (this.melodyOsc) this.melodyOsc.stop();
            if (this.bassOsc) this.bassOsc.stop();
        } catch (e) { }
        if (this.melodyGain) this.melodyGain.disconnect();
        if (this.bassGain) this.bassGain.disconnect();
        this.melodyOsc = null;
        this.bassOsc = null;
        this.isPlaying = false;
    }
};

function playSound(type) {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    if (type === 'hit') {
        osc.type = 'sawtooth';
        const pitchMod = Math.min(state.streak, 20) * 40;
        const baseFreq = 220 + pitchMod;
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 4, t + 0.1);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    } else if (type === 'damage') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.4);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
    } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.setValueAtTime(554, t + 0.1);
        osc.frequency.setValueAtTime(659, t + 0.2);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
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

// --- PHASE 17+: LIVE LETTER HIGHLIGHTING (YELLOW VERSION) ---
function updateLetterHighlighting(typedText) {
    // 1. Clear all previous highlights
    document.querySelectorAll('.word-on-canopy .letter').forEach(letter => {
        letter.classList.remove('highlight');
    });

    if (!typedText) return;

    // 2. Highlight EVERY matching letter in EVERY word
    state.activeObjects.forEach(obj => {
        const wordEl = obj.el.querySelector('.word-on-canopy');
        if (wordEl) {
            const fullWord = obj.word.toUpperCase();
            const letterSpans = wordEl.querySelectorAll('.letter');

            // Check each letter for match
            letterSpans.forEach((span, index) => {
                const letterInWord = fullWord[index];
                // If the typed text contains this letter, highlight it
                // (e.g. typing "Z" highlights all Z's)
                if (typedText.includes(letterInWord)) {
                    span.classList.add('highlight');
                }
            });
        }
    });
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
    const delay = Math.max(500, 2000 - (state.level * 50) - (state.dynamicSpeedMod * 300));
    state.spawnTimer = setTimeout(spawnWord, delay);
}

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
        type: type,
        chibiFile: chibiFile
    });
}

function destroyWord(index, isSuccess) {
    const obj = state.activeObjects[index];
    if (!obj) return;
    obj.el.remove();
    state.activeObjects.splice(index, 1);
    if (isSuccess) {
        playSound('hit');
        state.score += 100;
        state.streak++;
        if (state.bossActive) {
            damageBoss(10);
        }
        if (state.streak % 10 === 0 && state.streak > 0) {
            state.powerUps.freeze++;
            updatePowerUpUI();
        }
        if (obj.type === 'good') {
            state.score += 200;
            addToInventory(obj);
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

function addToInventory(obj) {
    const item = document.createElement('div');
    item.style.backgroundImage = `url('assets/chibi/${obj.chibiFile}')`;
    item.style.width = '32px';
    item.style.height = '32px';
    item.style.margin = '2px';
    item.style.cursor = 'pointer';
    item.style.backgroundSize = 'contain';
    item.title = "Copy to Clipboard";
    item.animate([
        { transform: 'scale(0)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
    ], { duration: 300 });
    item.onclick = () => {
        navigator.clipboard.writeText(obj.word);
        item.style.filter = 'brightness(2)';
        setTimeout(() => item.style.filter = 'none', 200);
    };
    inventoryEl.appendChild(item);
    inventoryEl.scrollTop = inventoryEl.scrollHeight;
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
    MusicEngine.stop();
    ChiptuneMusic.stop();
}

function update() {
    if (!state.isPlaying) return;
    MusicEngine.update();
    const modifier = 1 + state.dynamicSpeedMod;
    const isFrozen = Date.now() < state.freezeActive;
    state.activeObjects.forEach((obj, index) => {
        if (!isFrozen) {
            obj.y += state.speed * modifier;
            obj.el.style.top = `${obj.y}px`;
        }
        if (obj.y > window.innerHeight - 200 && obj.y < window.innerHeight - 100) {
            obj.el.classList.add('critical-word');
        } else {
            obj.el.classList.remove('critical-word');
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
    MusicEngine.start();
    ChiptuneMusic.start();
    shareBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
}

typer.addEventListener('input', (e) => {
    state.charsTyped++;
    playMechanicalClick();
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
