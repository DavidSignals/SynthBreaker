export class Ball {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 6;
        this.reset();
        this.trail = [];
    }
    
    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 120; // Empieza cerca de la raqueta
        
        // Escalar velocidad de la bola en base a si es móvil o desktop
        const isMobile = this.canvas.width < 600;
        const speedMultiplier = isMobile ? 0.7 : 1.0;
        
        this.vx = 5 * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
        this.vy = -5 * speedMultiplier;
        
        this.trail = [];
        this.active = false;
    }
    
    start() {
        this.active = true;
    }
    
    update() {
        if (!this.active) return;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x + this.radius > this.canvas.width) {
            this.x = this.canvas.width - this.radius;
            this.vx *= -1;
        }
        
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        }
        
        // Floor collision (death)
        if (this.y + this.radius > this.canvas.height) {
            this.reset();
            this.start(); // For now, auto restart
        }
        
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 20) {
            this.trail.shift();
        }
    }
    
    draw(ctx) {
        // Draw trail
        if (this.trail.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = this.radius;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00F0FF';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}
