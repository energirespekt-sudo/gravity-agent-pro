/**
 * GRAVITY AGENT - GEMINI 3 ENGINE ENTRY POINT
 * Architecture: Fixed Timestep + ECS
 */

import { GameLoop } from './core/GameLoop.js';
import { StateMachine } from './core/StateMachine.js';
import { LoadingState } from './states/LoadingState.js';
import { MenuState } from './states/MenuState.js';
import { PlayingState } from './states/PlayingState.js';
import { GameOverState } from './states/GameOverState.js';
import { BossState } from './states/BossState.js';
import { Boss2State } from './states/Boss2State.js';
import { WarningState } from './states/WarningState.js';
import { LoreState } from './states/LoreState.js';
import { BriefingState } from './states/BriefingState.js';
import { GameOps } from './core/GameOps.js';

console.log('🚀 SYSTEM_INIT: Gravity Agent Engine Loading...');

// Initialize Core Systems
const gameLoop = new GameLoop();
const stateMachine = new StateMachine();

// Register States
stateMachine.register('loading', new LoadingState());
stateMachine.register('menu', new MenuState());
stateMachine.register('playing', new PlayingState());
stateMachine.register('gameover', new GameOverState());
stateMachine.register('boss', new BossState(gameLoop)); // Pass gameLoop/context if needed
stateMachine.register('boss2', new Boss2State(gameLoop));
stateMachine.register('warning', new WarningState(gameLoop)); // Protocol 1
stateMachine.register('lore', new LoreState(gameLoop)); // Protocol 3
stateMachine.register('briefing', new BriefingState(gameLoop)); // Protocol 4

// Global Access for Debugging
window.GravityAgent = {
    loop: gameLoop,
    fsm: stateMachine
};

// Initialize Engine Ops
new GameOps(gameLoop, stateMachine);

// Start the Loop
gameLoop.start(
    (dt) => stateMachine.update(dt),
    (alpha) => stateMachine.render(alpha)
);

// Kickoff
stateMachine.change('loading');

console.log('✅ ENGINE STARTED: 60Hz Fixed Timestep Active');

// Force Focus Logic
document.addEventListener('click', () => {
    const typer = document.getElementById('typer');
    if (typer) typer.focus();
});
