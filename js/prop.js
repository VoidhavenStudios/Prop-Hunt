class PropPlayer extends BasePlayer {
    constructor(x, y) {
        super(x, y);
        this.isDisguised = false;
        this.currentImage = this.originalImage;
    }

    handleSpecificInput(input, entities) {
        // P to Unmorph
        if (input.keys['KeyP']) {
            this.resetDisguise();
        }

        if (input.mouse.leftDown) {
            this.tryMorph(entities);
            input.mouse.leftDown = false;
        }

        if (input.mouse.rightDown) {
            // Grab logic (placeholder)
        }
        
        if (input.mouse.middleDown) {
            // Taunt logic (placeholder)
        }
    }

    tryMorph(props) {
        for (let prop of props) {
            const r = getHitbox(prop);
            // Check if cursor clicks the prop
            if (this.cursor.x >= r.x && this.cursor.x <= r.x + r.w &&
                this.cursor.y >= r.y && this.cursor.y <= r.y + r.h) {
                this.becomeProp(prop);
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
        
        // Inherit rotation
        this.angle = targetProp.angle;
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalImage.width;
        this.h = this.originalImage.height;
        this.setHitboxFromImage(this.originalImage);
        this.y -= 10;
        this.angle = 0;
    }

    draw(ctx) {
        if (this.isDisguised) {
            ctx.save();
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.rotate(this.angle);
            ctx.drawImage(this.currentImage, -this.w / 2, -this.h / 2);
            ctx.restore();
        } else {
            ctx.drawImage(this.originalImage, this.x, this.y);
        }
        this.drawCursor(ctx);
    }
}