import { BasePlayer } from './player.js';
import { pointInPolygon } from './math.js';
export class PropPlayer extends BasePlayer {
    constructor(x, y) {
        super(x, y);
        console.info("Initializing PropPlayer");
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.fixedRotation = true; 
        this.defaultLocalVertices = this.localVertices ? [...this.localVertices] : null;
        this.defaultBox = { ...this.box };
    }
    handleSpecificInput(input, entities) {
        if (!input) return;
        if (input.keys['KeyP']) {
            if (this.isDisguised) {
                console.info("PropPlayer unmorphing via P key");
                this.resetDisguise();
            }
        }
        if (input.mouse.leftPressed) {
            this.tryMorph(entities);
        }
    }
    tryMorph(props) {
        if (!props || !this.cursor) {
            console.warn("tryMorph missing props or cursor");
            return;
        }
        for (let prop of props) {
            if (!prop) continue;
            const v = prop.getVertices();
            if (v && pointInPolygon(this.cursor, v)) {
                if (prop !== this.heldProp) {
                    console.info("PropPlayer morphing into prop type", prop.typeIndex);
                    this.becomeProp(prop);
                } else {
                    console.debug("Cannot morph into currently held prop");
                }
                return;
            }
        }
    }
    becomeProp(targetProp) {
        if (!targetProp || !targetProp.image || !targetProp.box) {
            console.error("Invalid targetProp for becomeProp", targetProp);
            return;
        }
        this.isDisguised = true;
        this.currentImage = targetProp.image;
        this.w = targetProp.image.width;
        this.h = targetProp.image.height;
        this.box = { ...targetProp.box };
        this.localVertices = targetProp.localVertices ? [...targetProp.localVertices] : null;
        this.y -= 10;
        this.angle = targetProp.angle || 0;
        this.fixedRotation = false; 
        this.mass = targetProp.mass;
        this.invMass = targetProp.invMass;
        this.inertia = targetProp.inertia;
        this.invInertia = targetProp.invInertia;
    }
    resetDisguise() {
        console.info("Resetting PropPlayer disguise");
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        if (this.originalImage) {
            this.w = this.originalImage.width;
            this.h = this.originalImage.height;
        } else {
            console.error("Missing originalImage during resetDisguise");
        }
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
        if (!this.box || !this.currentImage) return;
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        if (!this.isDisguised && !this.facingRight) ctx.scale(-1, 1);
        if (this.isDisguised) ctx.rotate(this.angle);
        ctx.drawImage(this.currentImage, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        ctx.restore();
        this.drawCursor(ctx);
    }
}