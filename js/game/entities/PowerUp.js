export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.type = type; // 'expand' or 'multiball'
        this.vy = 2.5; // fall speed
        this.active = true;
        
        if (type === 'expand') {
            this.color = '#00FF9D'; // Spring Green
        } else {
            this.color = '#FF00E5'; // Magenta
        }
    }
    
    update() {
        this.y += this.vy;
    }
    
    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        
        // Draw a diamond shape
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y);
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y);
        
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
