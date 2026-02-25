import { CONFIG } from './config.js';
import { PhysicsBody } from './physics.js';
import { pointInPolygon } from './math.js';
export class BasePlayer extends PhysicsBody {
    constructor(x, y) {
        console.info(`Creating BasePlayer at (${x}, ${y})`);
        const img = document.getElementById('tex-player');
        if (!img) console.error("Player texture 'tex-player' not found!");
        super(x, y, img ? img.width : 64, img ? img.height : 64, false);
        this.originalImage = img;
        if (img) this.setHitboxFromImage(img);
        this.facingRight = true;
        this.cursor = { x: 0, y: 0 };
        this.heldProp = null;
        this.fixedRotation = true;
        this.mass = 40;
        this.invMass = 1 / this.mass;
    }
    commonInput(input, camera, props) {
        if (!input || !camera || !props) {
            console.error("commonInput received invalid parameters");
            return;
        }
        const accel = this.grounded ? CONFIG.groundAccel : CONFIG.airAccel;
        let moving = false;
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            this.vx -= accel;
            moving = true;
        }
        if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            this.vx += accel;
            moving = true;
        }
        if (!moving) {
            this.vx *= this.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
        }
        if (this.vx > CONFIG.maxSpeed) this.vx = CONFIG.maxSpeed;
        if (this.vx < -CONFIG.maxSpeed) this.vx = -CONFIG.maxSpeed;
        if ((input.keys['KeyW'] || input.keys['ArrowUp'] || input.keys['Space']) && this.grounded) {
            let bonus = 0;
            if (this.isDisguised) {
                bonus = this.h * 0.05;
            }
            this.vy = -(CONFIG.baseJumpForce + bonus);
            this.grounded = false;
            console.debug("Player jumped with force:", this.vy);
        }
        const worldMouseX = (input.mouse.x / CONFIG.worldScale) + camera.x;
        const worldMouseY = (input.mouse.y / CONFIG.worldScale) + camera.y;
        this.facingRight = worldMouseX > (this.x + this.w / 2);
        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;
        const dx = worldMouseX - centerX;
        const dy = worldMouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONFIG.reachDistance) {
            const angle = Math.atan2(dy, dx);
            this.cursor.x = centerX + Math.cos(angle) * CONFIG.reachDistance;
            this.cursor.y = centerY + Math.sin(angle) * CONFIG.reachDistance;
        } else {
            this.cursor.x = worldMouseX;
            this.cursor.y = worldMouseY;
        }
        if (input.mouse.rightDown) {
            if (!this.heldProp) {
                for (let prop of props) {
                    if (!prop) continue;
                    const v = prop.getVertices();
                    if (v && pointInPolygon(this.cursor, v)) {
                        console.info("Player grabbed prop", prop);
                        this.heldProp = prop;
                        this.heldProp.isHeld = true;
                        break;
                    }
                }
            }
            if (this.heldProp && this.heldProp.box) {
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
                console.info("Player released prop", this.heldProp);
                this.heldProp.isHeld = false;
                this.heldProp = null;
            }
        }
    }
    drawCursor(ctx) {
        if (!this.cursor) return;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.cursor.x, this.cursor.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    handleSpecificInput(input, entities) {}
}