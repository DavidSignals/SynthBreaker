export class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 15;
        this.x = Math.random() > 0.5 ? -20 : canvas.width + 20;
        this.y = 200 + Math.random() * (canvas.height / 2 - 100);
        
        // Move towards the center
        this.vx = (this.x < 0 ? 1 : -1) * (1.5 + Math.random() * 1.5);
        this.vy = (Math.random() - 0.5) * 2;
        
        this.active = true;
        this.rotation = 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.05;
        
        // Soft bounce top/bottom
        if (this.y < 150 || this.y > this.canvas.height - 250) {
            this.vy *= -1;
        }
        
        // Kill if completely off screen on the other side
        if ((this.vx > 0 && this.x > this.canvas.width + 50) || 
            (this.vx < 0 && this.x < -50)) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = '#FF3300'; // Glitch Red/Orange
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF3300';
        
        // Draw an X or a weird geometry
        ctx.beginPath();
        ctx.moveTo(-12, -12);
        ctx.lineTo(12, 12);
        ctx.moveTo(12, -12);
        ctx.lineTo(-12, 12);
        ctx.stroke();
        
        ctx.restore();
    }
}
