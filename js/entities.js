import { CONFIG } from './config.js';
import { PhysicsBody } from './physics.js';
import { PROP_TYPES } from './objects.js';
export class Block extends PhysicsBody {
    constructor(x, y, w, h, imgId) {
        super(x, y, w, h, true);
        console.info("Block constructor executing", imgId);
        this.image = document.getElementById(imgId);
        this.pattern = null;
        if (!this.image) console.error("Block constructor: invalid imgId", imgId);
    }
    draw(ctx) {
        console.trace("Block draw call");
        if (!this.pattern && this.image && this.image.complete) {
            console.debug("Block pattern created");
            this.pattern = ctx.createPattern(this.image, 'repeat');
        }
        if (this.pattern) {
            ctx.fillStyle = this.pattern;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillRect(0, 0, this.w, this.h);
            ctx.restore();
        } else {
            console.warn("Block drawing fallback solid color");
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}
export class WorldProp extends PhysicsBody {
    constructor(x, y, typeIndex) {
        const propData = PROP_TYPES[typeIndex];
        console.info("WorldProp constructor executing", typeIndex, propData);
        if (!propData) console.error("WorldProp invalid typeIndex", typeIndex);
        const img = document.getElementById(propData ? propData.imgId : 'tex-crate0');
        super(x, y, img ? img.width : 64, img ? img.height : 64, false);
        this.image = img;
        this.typeIndex = typeIndex;
        this.setHitboxFromImage(img);
        this.fixedRotation = false;
        this.mass = propData ? (propData.mass || CONFIG.defaultPropMass) : CONFIG.defaultPropMass;
        this.invMass = 1 / this.mass;
        this.inertia = (this.mass * (this.box.w * this.box.w + this.box.h * this.box.h)) / 12;
        this.invInertia = 1 / this.inertia;
        console.debug("WorldProp mass/inertia configured", this.mass, this.inertia);
    }
    draw(ctx) {
        console.trace("WorldProp draw call", this.x, this.y, this.angle);
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        ctx.rotate(this.angle);
        if (this.image) {
            ctx.drawImage(this.image, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        } else {
            console.error("WorldProp missing image in draw");
        }
        ctx.restore();
    }
}