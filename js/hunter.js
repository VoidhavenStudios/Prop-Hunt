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
    }

    handleSpecificInput(input, entities) {
        if (input.keys['Digit1']) this.currentGunIndex = 0;
        if (input.keys['Digit2']) this.currentGunIndex = 1;
        if (input.keys['Digit3']) this.currentGunIndex = 2;
        if (input.keys['Digit4']) this.currentGunIndex = 3;

        if (input.mouse.leftPressed) {
            // Shoot
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        if (!this.facingRight) ctx.scale(-1, 1);
        ctx.drawImage(this.originalImage, -this.w / 2, -this.h / 2);
        ctx.restore();

        const gunImg = this.guns[this.currentGunIndex];
        
        // Anchor point on player (Side edge, slightly above middle)
        const anchorX = this.facingRight ? this.x + this.w - 5 : this.x + 5;
        const anchorY = this.y + this.h * 0.45;
        
        const dx = this.cursor.x - anchorX;
        const dy = this.cursor.y - anchorY;

        ctx.save();
        ctx.translate(anchorX, anchorY);
        
        if (this.facingRight) {
            const angle = Math.atan2(dy, Math.max(0, dx)); // Limit to right side 180
            ctx.rotate(angle);
            // Pivot around center of gun image
            ctx.drawImage(gunImg, -gunImg.width / 2, -gunImg.height / 2);
        } else {
            const angle = Math.atan2(dy, Math.min(0, dx)); // Limit to left side 180
            ctx.scale(-1, 1);
            ctx.rotate(-angle + Math.PI); // Adjust for mirrored scale
            ctx.drawImage(gunImg, -gunImg.width / 2, -gunImg.height / 2);
        }
        
        ctx.restore();
        this.drawCursor(ctx);
    }
}