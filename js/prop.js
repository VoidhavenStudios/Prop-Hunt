import { BasePlayer } from './player.js';
import { pointInPolygon } from './math.js';
export class PropPlayer extends BasePlayer {
    constructor(x, y) {
        console.info("PropPlayer constructor started", x, y);
        super(x, y);
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.fixedRotation = true; 
        this.defaultLocalVertices = this.localVertices ? [...this.localVertices] : null;
        this.defaultBox = { ...this.box };
        console.info("PropPlayer initialized baseline data", this.defaultBox);
    }
    handleSpecificInput(input, entities) {
        console.trace("PropPlayer handleSpecificInput tick");
        if (!input) { console.error("PropPlayer input null"); return; }
        if (input.keys['KeyP']) {
            console.info("PropPlayer unmorph key pressed");
            this.resetDisguise();
        }
        if (input.mouse.leftPressed) {
            console.debug("PropPlayer left click detected, attempting morph");
            this.tryMorph(entities);
        }
    }
    tryMorph(props) {
        console.trace("PropPlayer tryMorph evaluating props");
        if (!props || !this.cursor) { console.warn("PropPlayer tryMorph invalid parameters", props, this.cursor); return; }
        for (let prop of props) {
            if (!prop) { console.warn("PropPlayer tryMorph encountered null prop"); continue; }
            const v = prop.getVertices();
            if (v && pointInPolygon(this.cursor, v)) {
                console.info("PropPlayer cursor overlaps prop vertices", prop);
                if (prop !== this.heldProp) {
                    console.info("PropPlayer proceeding to morph into", prop);
                    this.becomeProp(prop);
                } else {
                    console.warn("PropPlayer attempted to morph into currently held prop, ignoring");
                }
                return;
            }
        }
        console.debug("PropPlayer tryMorph found no overlapping props");
    }
    becomeProp(targetProp) {
        console.info("PropPlayer becomeProp executing", targetProp);
        if (!targetProp || !targetProp.image || !targetProp.box) { console.error("PropPlayer becomeProp invalid targetProp", targetProp); return; }
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
        console.info("PropPlayer disguise applied successfully", this.box, this.mass);
    }
    resetDisguise() {
        console.info("PropPlayer resetDisguise executing");
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        if (this.originalImage) {
            this.w = this.originalImage.width;
            this.h = this.originalImage.height;
            console.debug("PropPlayer reset dimensions from originalImage", this.w, this.h);
        } else {
            console.warn("PropPlayer resetDisguise originalImage missing");
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
        console.info("PropPlayer disguise removed successfully");
    }
    draw(ctx) {
        console.trace("PropPlayer draw call");
        if (!this.box || !this.currentImage) { console.error("PropPlayer draw failure: box or currentImage missing"); return; }
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        if (!this.isDisguised && !this.facingRight) {
            ctx.scale(-1, 1);
            console.trace("PropPlayer human form mirrored horizontally");
        }
        if (this.isDisguised) {
            ctx.rotate(this.angle);
            console.trace("PropPlayer disguised rotation applied", this.angle);
        }
        ctx.drawImage(this.currentImage, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        ctx.restore();
        this.drawCursor(ctx);
    }
}