class HunterPlayer extends BasePlayer {
    constructor(x, y) {
        super(x, y);
        this.guns = [
            document.getElementById('tex-gun0'),
            document.getElementById('tex-gun1'),
            document.getElementById('tex-gun2'),
            document.getElementById('tex-gun3')
        ];
        this.currentGunIndex = 0;
        this.gunOffset = 0; 
    }

    handleSpecificInput(input, entities) {
        if (input.keys['Digit1']) this.currentGunIndex = 0;
        if (input.keys['Digit2']) this.currentGunIndex = 1;
        if (input.keys['Digit3']) this.currentGunIndex = 2;
        if (input.keys['Digit4']) this.currentGunIndex = 3;

        if (input.mouse.leftDown) {
            // Shoot logic (placeholder)
        }
        
        if (input.mouse.rightDown) {
            // Pickup logic (placeholder)
        }
        
        if (input.mouse.middleDown) {
            // Special logic (placeholder)
        }
    }

    draw(ctx) {
        // Draw Player
        ctx.drawImage(this.originalImage, this.x, this.y);

        // Draw Gun
        const gunImg = this.guns[this.currentGunIndex];
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;
        
        // Calculate angle to cursor
        const dx = this.cursor.x - centerX;
        const dy = this.cursor.y - centerY;
        const angle = Math.atan2(dy, dx);

        // Gun Anchor Position (Edge of sprite)
        const anchorDist = this.w / 2;
        const gunX = centerX + Math.cos(angle) * anchorDist;
        const gunY = centerY + Math.sin(angle) * anchorDist;

        ctx.save();
        ctx.translate(gunX, gunY);
        ctx.rotate(angle);
        
        if (Math.abs(angle) > Math.PI / 2) {
            ctx.scale(1, -1);
        }

        ctx.drawImage(gunImg, 0, -gunImg.height / 2);
        ctx.restore();

        this.drawCursor(ctx);
    }
}