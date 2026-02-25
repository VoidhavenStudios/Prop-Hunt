class Block extends PhysicsBody {
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

class Prop extends PhysicsBody {
    constructor(x, y, typeIndex) {
        const imgId = `tex-crate${typeIndex}`;
        const img = document.getElementById(imgId);
        super(x, y, img.width, img.height, false);
        this.image = img;
        this.typeIndex = typeIndex;
        this.calculateTightHitbox(img);
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y);
    }
}

class Player extends PhysicsBody {
    constructor(x, y) {
        const img = document.getElementById('tex-player');
        super(x, y, img.width, img.height, false);
        this.originalImage = img;
        this.currentImage = img;
        this.isDisguised = false;
        this.calculateTightHitbox(img);
        this.cursor = { x: 0, y: 0 };
    }

    handleInput(input, camera, props) {
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

        if (input.mouse.rightDown) {
            this.resetDisguise();
        }

        const worldMouseX = (input.mouse.x / CONFIG.worldScale) + camera.x;
        const worldMouseY = (input.mouse.y / CONFIG.worldScale) + camera.y;
        
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

        if (input.mouse.leftDown) {
            this.tryMorph(this.cursor, props);
            input.mouse.leftDown = false; 
        }
    }

    tryMorph(cursorPos, props) {
        for (let prop of props) {
            const r = getHitbox(prop);
            if (cursorPos.x >= r.x && cursorPos.x <= r.x + r.w &&
                cursorPos.y >= r.y && cursorPos.y <= r.y + r.h) {
                this.becomeProp(prop);
                return;
            }
        }
    }

    becomeProp(prop) {
        this.isDisguised = true;
        this.currentImage = prop.image;
        this.w = prop.image.width;
        this.h = prop.image.height;
        this.box = { ...prop.box }; 
        this.y -= 10;
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalImage.width;
        this.h = this.originalImage.height;
        this.calculateTightHitbox(this.originalImage);
        this.y -= 10;
    }

    draw(ctx) {
        ctx.drawImage(this.currentImage, this.x, this.y);
        
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.beginPath();
        ctx.arc(this.cursor.x, this.cursor.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}