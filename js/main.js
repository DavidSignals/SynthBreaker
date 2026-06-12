import { AudioEngine } from './audio/AudioEngine.js';
import { GameEngine } from './game/GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const startScreen = document.getElementById('startScreen');
    const hud = document.getElementById('hud');
    const pauseMenu = document.getElementById('pauseMenu');
    
    const menuBtn = document.getElementById('menu-btn');
    const btnResume = document.getElementById('btn-resume');
    const btnRestart = document.getElementById('btn-restart');
    const btnExit = document.getElementById('btn-exit');

    const levelTransition = document.getElementById('levelTransition');
    const transitionText = document.getElementById('transitionText');

    const scoreEl = document.getElementById('hud-score');
    const lfoEl = document.getElementById('hud-lfo');
    const cutoffEl = document.getElementById('hud-cutoff');
    
    const audioEngine = new AudioEngine();
    const gameEngine = new GameEngine(canvas, audioEngine);
    
    // Wire up HUD
    gameEngine.onScoreUpdate = (score) => {
        scoreEl.innerText = `SCORE: ${score.toString().padStart(5, '0')}`;
    };
    
    gameEngine.onAudioUpdate = (params) => {
        lfoEl.innerText = `Delay FB: ${params.lfoRate.toFixed(2)}`;
        cutoffEl.innerText = `Cutoff: ${Math.round(params.freq)}Hz`;
    };
    
    gameEngine.onLevelTransition = (level) => {
        if (level !== null) {
            transitionText.innerText = `LEVEL ${level}`;
            levelTransition.classList.remove('hidden');
        } else {
            levelTransition.classList.add('hidden');
        }
    };
    
    // Draw initial state before start (uses the new initLevel API)
    gameEngine.initLevel(0);
    gameEngine.draw();
    
    // Start Sequence
    const handleStart = async () => {
        if (gameEngine.state !== 'MENU') return;
        
        startScreen.classList.add('fade-out');
        hud.classList.remove('hidden');
        hud.classList.add('visible');
        
        await audioEngine.init();
        gameEngine.start();
    };
    
    // Listen on document so click is captured regardless of overlay z-index stacking
    document.addEventListener('click', handleStart);

    // Menu Actions
    menuBtn.addEventListener('click', () => {
        if (gameEngine.state === 'PLAYING') {
            gameEngine.pause();
            pauseMenu.classList.remove('hidden');
            hud.classList.remove('visible');
        }
    });

    btnResume.addEventListener('click', () => {
        pauseMenu.classList.add('hidden');
        hud.classList.add('visible');
        gameEngine.resume();
    });

    btnRestart.addEventListener('click', () => {
        pauseMenu.classList.add('hidden');
        hud.classList.add('visible');
        gameEngine.restart();
    });

    btnExit.addEventListener('click', () => {
        pauseMenu.classList.add('hidden');
        hud.classList.remove('visible');
        hud.classList.add('hidden');
        startScreen.classList.remove('fade-out');
        
        gameEngine.exit();
    });
});
