import { Ball } from './entities/Ball.js';
import { Paddle } from './entities/Paddle.js';
import { Brick } from './entities/Brick.js';
import { Particles } from './Particles.js';
import { PowerUp } from './entities/PowerUp.js';
import { Obstacle } from './entities/Obstacle.js';

export class GameEngine {
    constructor(canvas, audioEngine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioEngine = audioEngine;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.paddle = new Paddle(this.canvas);
        this.particles = new Particles();
        
        this.score = 0;
        this.level = 0;
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, TRANSITION
        
        this.onScoreUpdate = null;
        this.onAudioUpdate = null;
        this.onLevelTransition = null;
        
        this.resetLevelEntities();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    resetLevelEntities() {
        this.balls = [new Ball(this.canvas)];
        this.powerUps = [];
        this.obstacles = [];
        this.bricks = [];
        this.paddle.width = 120; // reset paddle width
    }
    
    initLevel(levelIndex) {
        this.resetLevelEntities();
        this.audioEngine.setLevelProgression(levelIndex);
        
        // Dynamic layout based on level
        const isMobile = this.canvas.width < 600;
        const padding = isMobile ? 15 : 60;
        const availableWidth = this.canvas.width - padding * 2;
        
        // Base cols on level (starts lower, gets denser)
        let baseCols = 8 + (levelIndex * 2);
        if (isMobile) baseCols = Math.min(baseCols, 8);
        const cols = baseCols;
        
        const rows = 4 + levelIndex;
        const brickWidth = availableWidth / cols;
        const brickHeight = isMobile ? 20 : Math.max(15, 35 - (levelIndex * 5));
        const topOffset = isMobile ? 60 : 100;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = padding + c * brickWidth;
                const y = topOffset + r * brickHeight;
                
                let type = 0; // 0: Base
                if (Math.random() > 0.8) type = 1; // 1: Modulator
                if (Math.random() > 0.95) type = 2; // 2: Overdrive/PowerUp
                
                this.bricks.push(new Brick(x, y, brickWidth, brickHeight, r, type));
            }
        }
    }
    
    start() {
        if (this.state === 'MENU') {
            this.level = 0;
            this.score = 0;
            if (this.onScoreUpdate) this.onScoreUpdate(this.score);
            this.initLevel(this.level);
            this.state = 'PLAYING';
            this.balls[0].start();
            this.audioEngine.startMusic();
            this.loop();
        } else if (this.state === 'PAUSED') {
            this.resume();
        }
    }
    
    pause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.audioEngine.pauseMusic();
        }
    }

    resume() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.audioEngine.startMusic();
        }
    }

    restart() {
        this.level = 0;
        this.score = 0;
        if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        this.initLevel(this.level);
        this.state = 'PLAYING';
        this.balls[0].start();
        this.audioEngine.stopMusic();
        this.audioEngine.startMusic();
    }

    exit() {
        this.state = 'MENU';
        this.audioEngine.stopMusic();
        this.draw();
    }
    
    levelComplete() {
        this.state = 'TRANSITION';
        this.audioEngine.triggerTransitionRiser();
        if (this.onLevelTransition) this.onLevelTransition(this.level + 2); // Show next level (+1 for 0-index, +1 for next)
        
        setTimeout(() => {
            if (this.state === 'MENU') return; // User might have exited
            this.level++;
            this.initLevel(this.level);
            this.balls[0].start();
            this.state = 'PLAYING';
            if (this.onLevelTransition) this.onLevelTransition(null); // Hide UI
        }, 3000); // 3 seconds transition
    }

    spawnObstacle() {
        if (Math.random() < 0.005 && this.obstacles.length < 2) {
            this.obstacles.push(new Obstacle(this.canvas));
        }
    }
    
    checkCollisions() {
        const p = this.paddle;
        
        // Balls collisions
        for (let b of this.balls) {
            if (!b.active) continue;

            // Paddle collision
            if (b.y + b.radius >= p.y && b.y - b.radius <= p.y + p.height) {
                if (b.x >= p.x && b.x <= p.x + p.width) {
                    b.vy *= -1;
                    b.y = p.y - b.radius;
                    
                    const hitPoint = (b.x - (p.x + p.width / 2)) / (p.width / 2);
                    b.vx = hitPoint * 6;
                    
                    this.audioEngine.triggerPaddleHit();
                    this.particles.emit(b.x, b.y, '#FFFFFF');
                }
            }
            
            // Obstacle collision
            for (let obs of this.obstacles) {
                if (!obs.active) continue;
                const dx = b.x - obs.x;
                const dy = b.y - obs.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < b.radius + obs.radius) {
                    // Simple bounce
                    b.vx *= -1;
                    b.vy *= -1;
                    this.audioEngine.triggerObstacleHit();
                    this.particles.emit(obs.x, obs.y, '#FF3300');
                }
            }
            
            // Brick collision
            for (let brick of this.bricks) {
                if (!brick.active) continue;
                
                if (b.x + b.radius > brick.x && b.x - b.radius < brick.x + brick.width &&
                    b.y + b.radius > brick.y && b.y - b.radius < brick.y + brick.height) {
                    
                    brick.active = false;
                    b.vy *= -1;
                    
                    this.audioEngine.triggerBrickHit(brick.row, 10);
                    this.particles.emit(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
                    
                    this.score += 100 * (brick.type + 1);
                    if (this.onScoreUpdate) this.onScoreUpdate(this.score);
                    
                    // Drop PowerUp on Amber Bricks
                    if (brick.type === 2) {
                        const puType = Math.random() > 0.5 ? 'expand' : 'multiball';
                        this.powerUps.push(new PowerUp(brick.x + brick.width/2, brick.y, puType));
                    }
                    
                    break;
                }
            }
        }
        
        // PowerUps collisions with Paddle
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            let pu = this.powerUps[i];
            if (pu.y + pu.radius > p.y && pu.y - pu.radius < p.y + p.height &&
                pu.x + pu.radius > p.x && pu.x - pu.radius < p.x + p.width) {
                
                this.audioEngine.triggerPowerUp(pu.type);
                this.particles.emit(pu.x, pu.y, pu.color);
                
                if (pu.type === 'expand') {
                    p.width = 200;
                    setTimeout(() => { p.width = 120; }, 10000);
                } else if (pu.type === 'multiball') {
                    // Clone active balls
                    const newBalls = [];
                    for(let b of this.balls) {
                        if (b.active) {
                            let b1 = new Ball(this.canvas);
                            b1.x = b.x; b1.y = b.y; b1.vx = -b.vx; b1.vy = b.vy; b1.start();
                            let b2 = new Ball(this.canvas);
                            b2.x = b.x; b2.y = b.y; b2.vx = b.vx * 1.5; b2.vy = b.vy; b2.start();
                            newBalls.push(b1, b2);
                        }
                    }
                    this.balls.push(...newBalls);
                }
                
                pu.active = false;
                this.powerUps.splice(i, 1);
            } else if (pu.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    update() {
        if (this.state !== 'PLAYING') return null;

        this.paddle.update();
        
        let allBallsDead = true;
        for (let b of this.balls) {
            b.update();
            if (b.active || b.y < this.canvas.height) {
                allBallsDead = false;
            }
        }
        
        // If all balls fall, reset one ball
        if (allBallsDead && this.balls.length > 0) {
            this.balls = [new Ball(this.canvas)];
            this.balls[0].start();
        }

        for (let pu of this.powerUps) pu.update();
        for (let obs of this.obstacles) obs.update();
        
        this.particles.update();
        this.checkCollisions();
        this.spawnObstacle();
        
        // Level check
        const activeBricks = this.bricks.filter(b => b.active).length;
        if (activeBricks === 0) {
            this.levelComplete();
        }
        
        // Track the lowest ball for audio Y modulation
        let lowestY = 0;
        let lowestX = this.canvas.width / 2;
        for (let b of this.balls) {
            if (b.active && b.y > lowestY) {
                lowestY = b.y;
                lowestX = b.x;
            }
        }
        
        return this.audioEngine.updateBallPosition(lowestX, lowestY, this.canvas.width, this.canvas.height);
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(13, 13, 17, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let brick of this.bricks) brick.draw(this.ctx);
        for (let pu of this.powerUps) pu.draw(this.ctx);
        for (let obs of this.obstacles) obs.draw(this.ctx);
        
        this.particles.draw(this.ctx);
        this.paddle.draw(this.ctx);
        for (let b of this.balls) b.draw(this.ctx);
    }
    
    loop() {
        if (this.state === 'MENU') return;
        
        const audioParams = this.update();
        if (this.onAudioUpdate && audioParams) {
            this.onAudioUpdate(audioParams);
        }
        
        this.draw();
        
        requestAnimationFrame(() => this.loop());
    }
}
