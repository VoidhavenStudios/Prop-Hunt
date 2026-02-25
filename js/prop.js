class PropPlayer extends BasePlayer {
    constructor(x, y) {
        super(x, y);
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.fixedRotation = true; 
        this.defaultLocalVertices = this.localVertices ? [...this.localVertices] : null;
        this.defaultBox = { ...this.box };
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
        this.localVertices = targetProp.localVertices ? [...targetProp.localVertices] : null;
        this.y -= 10;
        this.angle = targetProp.angle;
        this.fixedRotation = false; 
        this.mass = targetProp.mass;
        this.invMass = targetProp.invMass;
        this.inertia = targetProp.inertia;
        this.invInertia = targetProp.invInertia;
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalImage.width;
        this.h = this.originalImage.height;
        this.box = { ...this.defaultBox };
        this.localVertices = this.defaultLocalVertices ? [...this.defaultLocalVertices] : null;
        this.y -= 10;
        this.angle = 0;
        this.angularVelocity = 0;
        this.fixedRotation = true; 
        this.mass = 40;
        this.invMass = 1 / this.mass;
        this.inertia = 0;
        this.invInertia = 0;
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