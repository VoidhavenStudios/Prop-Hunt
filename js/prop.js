class PropPlayer extends BasePlayer {
    constructor(x, y) {
        super(x, y);
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.fixedRotation = true; 
    }

    handleSpecificInput(input, entities) {
        if (input.keys['KeyP']) {
            this.resetDisguise();
        }

        if (input.mouse.leftPressed) {
            this.tryMorph(entities);
        }
    }

    tryMorph(props) {
        for (let prop of props) {
            if (pointInPolygon(this.cursor, prop.getVertices())) {
                if (prop !== this.heldProp) {
                    this.becomeProp(prop);
                }
                return;
            }
        }
    }

    becomeProp(targetProp) {
        this.isDisguised = true;
        this.currentImage = targetProp.image;
        this.w = targetProp.image.width;
        this.h = targetProp.image.height;
        this.box = { ...targetProp.box };
        this.y -= 10;
        this.angle = targetProp.angle;
        this.fixedRotation = false; 
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalImage.width;
        this.h = this.originalImage.height;
        this.setHitboxFromImage(this.originalImage);
        this.y -= 10;
        this.angle = 0;
        this.angularVelocity = 0;
        this.fixedRotation = true; 
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        if (!this.isDisguised && !this.facingRight) ctx.scale(-1, 1);
        if (this.isDisguised) ctx.rotate(this.angle);
        ctx.drawImage(this.currentImage, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        ctx.restore();
        
        this.drawCursor(ctx);
    }
}