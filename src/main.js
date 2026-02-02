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

// Global Access for Debugging
window.GravityAgent = {
    loop: gameLoop,
    fsm: stateMachine
};

// Start the Loop
gameLoop.start(
    (dt) => stateMachine.update(dt),
    (alpha) => stateMachine.render(alpha)
);

// Kickoff
stateMachine.change('loading');

console.log('✅ ENGINE STARTED: 60Hz Fixed Timestep Active');
