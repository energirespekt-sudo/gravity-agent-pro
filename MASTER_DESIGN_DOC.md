# MASTER SPECIFICATION: GRAVITY AGENT PRO (50-LEVEL BUILD)

**Role:** Senior Game Director & Lead Architect
**Date:** 2026-01-31
**Context:** [PROJECT_NEXUS_CONTEXT.md](file:///home/maziar/Spel/GravityAgent/PROJECT_NEXUS_CONTEXT.md)

---

## 1. DEEP SCAN & ANALYSIS

### Current State (Codebase Audit)

- **Engine:** Electron + Vanilla JS (`main.js` ~22KB).
- **Core Loop:** Typing mechanic with falling words.
- **Visuals:** Neon Brutalist (Cyan/Pink), Yellow Highlighting (Restored), Chibi Assets (Restored).
- **Audio:** Custom Chiptune Engine (Square/Sawtooth waves).

### Level Pacing Analysis (The "50 Level" Curve)

*Current Implementation in `main.js`:*

- **Spawn Delay:** `2000ms - (Level * 50ms)`
- **Speed Modifier:** `1.0 + dynamicSpeedMod`
- **Content Tiers:**
  - **Lvl 1-10:** Bad + Good words.
  - **Lvl 11-20:** + Weird words.
  - **Lvl 21-40:** + Glitch words.
  - **Lvl 41+:** All pools.

**CRITICAL FINDINGS (Discrepancies):**

1. **Level 40 Cap:** The Boss Logic (`if (state.level % 10 === 0 && state.level <= 40)`) explicitly stops after Level 40. **Levels 41-50 currently have NO BOSSES.**
2. **Speed Cap:** At Level 30, spawn delay drops by 1500ms (to 500ms floor). Levels 30-50 will feel identical in terms of spawn rate, leading to a "plateau" in difficulty.
3. **Visual Stagnation:** The background (`#city-bg`) is static. For a 50-level journey, the player needs visual progression (e.g., sky color changes or weather intensity).

### "Game Feel" Audit

- **Impact (Juice):**
  - ✅ **Yellow Highlighting:** Excellent visual feedback (Pulse).
  - ✅ **Screen Shake:** Present on damage.
  - ⚠️ **Success Feedback:** Needs more "pop" on word destruction (currently just disappears). Needs particles?
- **Responsiveness:**
  - ⚠️ **Start Delay:** `spawnWord` has a delay. Level 1 starts slow. Needs an "Immediate First Spawn" to hook the player.

---

## 2. CRITICAL SPECIFICATION (The Fix)

### A. Level Progression (The "Golden Path")

We will implement a struct-based level design to ensure distinct phases up to Level 50.

| Level Range | Phase Name | Environment | Mechanic |
|-------------|------------|-------------|----------|
| **01-10** | *The Descent* | Night City (Cyan) | Basic Words |
| **11-20** | *The Glitch* | Static Rain (Purple) | + Weird/Glitch Words |
| **21-30** | *The Breach* | Red Alert (Red) | Faster Gravity |
| **31-40** | *The Void* | Pitch Black (White UI) | **Boss Rush** (Every 5) |
| **41-50** | *The Singularity* | Inverted Colors | Max Speed + Invisible Words |

### B. Boss Structure (Refined)

- **Lvl 10:** The Gatekeeper (Normal)
- **Lvl 20:** The Cipher (Fast Regen)
- **Lvl 30:** The Breacher (Heavy Damage)
- **Lvl 40:** The Admin (Glitch Effects)
- **Lvl 50:** **OMEGA (Final Boss)** - Must have unique mechanics (e.g., types back at you?).

### C. Physics & Controls

- **Fix:** Remove input lag.
- **Fix:** Ensure lateral movement (if planned) helps, not hinders.
- **Requirement:** "Combo System" must scale. 10 streak = Freeze is good. Add **Screen Wipe (Nuke)** at 50 streak.

---

## 3. IMPLEMENTATION PLAN (Immediate Actions)

1. **MEMORY LOCK:** Pushed `PROJECT_NEXUS_CONTEXT.md` (✅ Done).
2. **LOGIC PATCH:**
    - Update `spawnWord` to handle Levels 41-50.
    - Add `Omega Boss` trigger at Level 50.
    - Smooth usage of `spawnDelay` so it doesn't cap out at Lvl 30.
3. **ASSET VERIFICATION:**
    - Ensure `vanguard.png` etc. are loaded correctly (✅ Done).
    - Need explicit "Boss" visuals (currently reusing Chibis?). *Action: Tint bosses Red.*
4. **GIT SECURE:**
    - Commit all changes with tag `v1.0-50level- RC`.

---

# SIGN-OFF

**Authorized By:** Senior Architect (Antigravity)
**Status:** READY FOR EXECUTION.
