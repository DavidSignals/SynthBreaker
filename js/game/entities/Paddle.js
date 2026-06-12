export class Paddle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 120;
        this.height = 12;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 40;
        this.targetX = this.x;
        
        // Listeners for mouse
        window.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX - this.width / 2;
        });
        
        // Listeners for mobile touch
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetX = e.touches[0].clientX - this.width / 2;
            }
        }, { passive: true });
    }
    
    update() {
        // Smooth follow
        this.x += (this.targetX - this.x) * 0.2;
        
        // Bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF00E5';
        
        // Rounded rectangle paddle
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 6);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}
