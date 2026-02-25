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
        }
        
        if (input.mouse.middleDown) {
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        if (!this.facingRight) ctx.scale(-1, 1);
        ctx.drawImage(this.originalImage, -this.w / 2, -this.h / 2);
        ctx.restore();

        const gunImg = this.guns[this.currentGunIndex];
        const anchorX = this.facingRight ? this.x + this.w : this.x;
        const anchorY = this.y + this.h * 0.4;
        
        const dx = this.cursor.x - anchorX;
        const dy = this.cursor.y - anchorY;

        ctx.save();
        ctx.translate(anchorX, anchorY);
        
        if (this.facingRight) {
            const angle = Math.atan2(dy, Math.max(0.001, dx));
            ctx.rotate(angle);
            ctx.drawImage(gunImg, 0, -gunImg.height / 2);
        } else {
            const angle = Math.atan2(dy, Math.max(0.001, -dx));
            ctx.scale(-1, 1);
            ctx.rotate(angle);
            ctx.drawImage(gunImg, 0, -gunImg.height / 2);
        }
        
        ctx.restore();
        this.drawCursor(ctx);
    }
}