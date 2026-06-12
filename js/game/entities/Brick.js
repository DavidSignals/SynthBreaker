export class Brick {
    constructor(x, y, width, height, row, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.row = row;
        this.type = type; // 0: Base, 1: Modulator, 2: Overdrive
        this.active = true;
        
        switch(type) {
            case 1: this.color = '#FF00E5'; break; // Magenta
            case 2: this.color = '#FFB300'; break; // Amber
            default: this.color = '#00F0FF'; break; // Cyan
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = this.color;
        // Draw slightly smaller than grid for gaps
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        ctx.globalAlpha = 1.0;
        
        // Inner glow or border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        ctx.globalAlpha = 1.0;
    }
}
