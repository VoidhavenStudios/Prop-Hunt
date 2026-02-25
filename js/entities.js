import { CONFIG } from './config.js';
import { PhysicsBody } from './physics.js';
import { PROP_TYPES } from './objects.js';
export class Block extends PhysicsBody {
    constructor(x, y, w, h, imgId) {
        super(x, y, w, h, true);
        console.info(`Creating Block at (${x}, ${y}) with size (${w}x${h})`);
        this.image = document.getElementById(imgId);
        if (!this.image) console.error(`Block image with ID ${imgId} not found!`);
        this.pattern = null;
    }
    draw(ctx) {
        if (!this.pattern && this.image && this.image.complete) {
            console.debug("Creating pattern for Block");
            this.pattern = ctx.createPattern(this.image, 'repeat');
        }
        if (this.pattern) {
            ctx.fillStyle = this.pattern;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillRect(0, 0, this.w, this.h);
            ctx.restore();
        } else {
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}
export class WorldProp extends PhysicsBody {
    constructor(x, y, typeIndex) {
        const propData = PROP_TYPES[typeIndex];
        if (!propData) console.error(`Invalid prop typeIndex: ${typeIndex}`);
        const img = document.getElementById(propData.imgId);
        if (!img) console.error(`WorldProp image with ID ${propData.imgId} not found!`);
        super(x, y, img ? img.width : 64, img ? img.height : 64, false);
        console.info(`Creating WorldProp at (${x}, ${y}) type: ${typeIndex}`);
        this.image = img;
        this.typeIndex = typeIndex;
        if (img) this.setHitboxFromImage(img);
        this.fixedRotation = false;
        this.mass = propData.mass || CONFIG.defaultPropMass;
        this.invMass = 1 / this.mass;
        this.inertia = (this.mass * (this.box.w * this.box.w + this.box.h * this.box.h)) / 12;
        this.invInertia = 1 / this.inertia;
    }
    draw(ctx) {
        if (!this.image) return;
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        ctx.restore();
    }
}