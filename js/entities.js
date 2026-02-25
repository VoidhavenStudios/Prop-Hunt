import { CONFIG } from './config.js';
import { PhysicsBody } from './physics.js';

export class Block extends PhysicsBody {
    constructor(x, y, w, h, imgId) {
        super(x, y, w, h, true);
        this.image = document.getElementById(imgId);
        this.pattern = null;
    }

    draw(ctx) {
        if (!this.pattern && this.image.complete) {
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
        const imgId = `tex-crate${typeIndex}`;
        const img = document.getElementById(imgId);
        super(x, y, img.width, img.height, false);
        this.image = img;
        this.typeIndex = typeIndex;
        this.setHitboxFromImage(img);
        this.fixedRotation = false;
        
        this.mass = CONFIG.propMass;
        this.invMass = 1 / this.mass;
        this.inertia = (this.mass * (this.box.w * this.box.w + this.box.h * this.box.h)) / 12;
        this.invInertia = 1 / this.inertia;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.box.x + this.box.w / 2, this.y + this.box.y + this.box.h / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.box.w / 2 - this.box.x, -this.box.h / 2 - this.box.y);
        ctx.restore();
    }
}