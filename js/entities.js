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
    }

    handleInput(input, worldMouse, props) {
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            this.vx -= 1;
        }
        if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            this.vx += 1;
        }
        if ((input.keys['KeyW'] || input.keys['ArrowUp'] || input.keys['Space']) && this.grounded) {
            this.vy = -CONFIG.jumpForce;
            this.grounded = false;
        }

        if (input.mouse.rightDown) {
            this.resetDisguise();
        }

        if (input.mouse.leftDown) {
            this.tryMorph(worldMouse, props);
            input.mouse.leftDown = false; 
        }
    }

    tryMorph(mouse, props) {
        for (let prop of props) {
            if (checkAABB({x: mouse.x, y: mouse.y, w: 1, h: 1}, prop)) {
                const dist = getDistance(this.x + this.w/2, this.y + this.h/2, prop.x + prop.w/2, prop.y + prop.h/2);
                if (dist <= CONFIG.reachDistance) {
                    this.becomeProp(prop);
                    return;
                }
            }
        }
    }

    becomeProp(prop) {
        this.isDisguised = true;
        this.currentImage = prop.image;
        this.w = prop.w;
        this.h = prop.h;
        this.y -= 5;
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalImage.width;
        this.h = this.originalImage.height;
        this.y -= 5;
    }

    draw(ctx) {
        ctx.drawImage(this.currentImage, this.x, this.y, this.w, this.h);
        
        if (!this.isDisguised) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w/2, this.y + this.h/2, CONFIG.reachDistance, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}