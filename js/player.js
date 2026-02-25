import { CONFIG } from './config.js';
import { PhysicsBody } from './physics.js';
import { pointInPolygon } from './math.js';
export class BasePlayer extends PhysicsBody {
    constructor(x, y) {
        const img = document.getElementById('tex-player');
        console.info("BasePlayer constructor executing", {x,y,img});
        super(x, y, img ? img.width : 64, img ? img.height : 64, false);
        this.originalImage = img;
        if (img) {
            console.debug("BasePlayer setting hitbox from image");
            this.setHitboxFromImage(img);
        } else {
            console.warn("BasePlayer missing image element");
        }
        this.facingRight = true;
        this.cursor = { x: 0, y: 0 };
        this.heldProp = null;
        this.fixedRotation = true;
        this.mass = 40;
        this.invMass = 1 / this.mass;
        console.info("BasePlayer initialization complete");
    }
    commonInput(input, camera, props) {
        console.trace("BasePlayer commonInput tick");
        if (!input || !camera || !props) {
            console.error("BasePlayer commonInput: missing dependencies", {input, camera, props});
            return;
        }
        const accel = this.grounded ? CONFIG.groundAccel : CONFIG.airAccel;
        let moving = false;
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            this.vx -= accel;
            moving = true;
            console.trace("BasePlayer moving left, vx:", this.vx);
        }
        if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            this.vx += accel;
            moving = true;
            console.trace("BasePlayer moving right, vx:", this.vx);
        }
        if (!moving) {
            this.vx *= this.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
            console.trace("BasePlayer idling, friction applied, vx:", this.vx);
        }
        if (this.vx > CONFIG.maxSpeed) { this.vx = CONFIG.maxSpeed; console.debug("BasePlayer max positive speed hit"); }
        if (this.vx < -CONFIG.maxSpeed) { this.vx = -CONFIG.maxSpeed; console.debug("BasePlayer max negative speed hit"); }
        if ((input.keys['KeyW'] || input.keys['ArrowUp'] || input.keys['Space']) && this.grounded) {
            let bonus = 0;
            if (this.isDisguised) {
                bonus = this.h * 0.05;
                console.debug("BasePlayer applying disguise jump bonus", bonus);
            }
            this.vy = -(CONFIG.baseJumpForce + bonus);
            this.grounded = false;
            console.info("BasePlayer jumped, vy:", this.vy);
        }
        const worldMouseX = (input.mouse.x / CONFIG.worldScale) + camera.x;
        const worldMouseY = (input.mouse.y / CONFIG.worldScale) + camera.y;
        this.facingRight = worldMouseX > (this.x + this.w / 2);
        console.trace("BasePlayer facing direction evaluated", this.facingRight);
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;
        const dx = worldMouseX - centerX;
        const dy = worldMouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONFIG.reachDistance) {
            const angle = Math.atan2(dy, dx);
            this.cursor.x = centerX + Math.cos(angle) * CONFIG.reachDistance;
            this.cursor.y = centerY + Math.sin(angle) * CONFIG.reachDistance;
            console.trace("BasePlayer cursor clamped to max reach limit");
        } else {
            this.cursor.x = worldMouseX;
            this.cursor.y = worldMouseY;
            console.trace("BasePlayer cursor set to raw world mouse coordinates");
        }
        if (input.mouse.rightDown) {
            console.trace("BasePlayer right mouse down detected");
            if (!this.heldProp) {
                console.debug("BasePlayer evaluating grab logic for nearby props");
                for (let prop of props) {
                    if (!prop) { console.warn("BasePlayer: null prop in list"); continue; }
                    const v = prop.getVertices();
                    if (v && pointInPolygon(this.cursor, v)) {
                        this.heldProp = prop;
                        this.heldProp.isHeld = true;
                        console.info("BasePlayer grabbed prop", prop);
                        break;
                    }
                }
            }
            if (this.heldProp && this.heldProp.box) {
                console.trace("BasePlayer accelerating held prop towards cursor");
                const targetX = this.cursor.x - this.heldProp.box.w / 2 - this.heldProp.box.x;
                const targetY = this.cursor.y - this.heldProp.box.h / 2 - this.heldProp.box.y;
                const pDx = targetX - this.heldProp.x;
                const pDy = targetY - this.heldProp.y;
                this.heldProp.vx += (pDx * 0.2 - this.heldProp.vx) * 0.6;
                this.heldProp.vy += (pDy * 0.2 - this.heldProp.vy) * 0.6;
                this.heldProp.angularVelocity *= 0.8;
            }
        } else {
            if (this.heldProp) {
                console.info("BasePlayer released held prop", this.heldProp);
                this.heldProp.isHeld = false;
                this.heldProp = null;
            }
        }
    }
    drawCursor(ctx) {
        console.trace("BasePlayer drawCursor called");
        if (!this.cursor) {
            console.error("BasePlayer drawCursor: cursor is null");
            return;
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.cursor.x, this.cursor.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    handleSpecificInput(input, entities) {
        console.trace("BasePlayer base handleSpecificInput invoked (empty abstract)");
    }
}