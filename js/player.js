class BasePlayer extends PhysicsBody {
    constructor(x, y) {
        const img = document.getElementById('tex-player');
        super(x, y, img.width, img.height, false);
        this.originalImage = img;
        this.setHitboxFromImage(img);
        this.facingRight = true;
        this.cursor = { x: 0, y: 0 };
        this.heldProp = null;
    }

    commonInput(input, camera, props) {
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            this.vx -= 1;
        }
        if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            this.vx += 1;
        }
        if ((input.keys['KeyW'] || input.keys['ArrowUp'] || input.keys['Space']) && this.grounded) {
            let bonus = 0;
            if (this.isDisguised) {
                bonus = this.h * 0.05;
            }
            this.vy = -(CONFIG.baseJumpForce + bonus);
            this.grounded = false;
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

        if (input.mouse.rightPressed) {
            if (this.heldProp) {
                this.heldProp.isHeld = false;
                this.heldProp = null;
            } else {
                for (let prop of props) {
                    if (pointInPolygon(this.cursor, prop.getVertices())) {
                        this.heldProp = prop;
                        this.heldProp.isHeld = true;
                        break;
                    }
                }
            }
        }

        if (this.heldProp) {
            const px = this.heldProp.x;
            const py = this.heldProp.y;
            
            const targetX = this.cursor.x - this.heldProp.box.w / 2 - this.heldProp.box.x;
            const targetY = this.cursor.y - this.heldProp.box.h / 2 - this.heldProp.box.y;

            this.heldProp.x += (targetX - this.heldProp.x) * 0.5;
            this.heldProp.y += (targetY - this.heldProp.y) * 0.5;

            this.heldProp.vx = this.heldProp.x - px;
            this.heldProp.vy = this.heldProp.y - py;
            this.heldProp.angularVelocity = 0;
        }
    }

    drawCursor(ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.cursor.x, this.cursor.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    handleSpecificInput(input, entities) {}
}