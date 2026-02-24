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
        const tightBox = getTightHitbox(img);
        
        super(x + tightBox.x, y + tightBox.y, tightBox.w, tightBox.h, false);
        
        this.image = img;
        this.typeIndex = typeIndex;
        this.hitboxOffset = { x: tightBox.x, y: tightBox.y };
        this.fullWidth = img.width;
        this.fullHeight = img.height;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x - this.hitboxOffset.x, this.y - this.hitboxOffset.y);
    }
}

class Player extends PhysicsBody {
    constructor(x, y) {
        const img = document.getElementById('tex-player');
        const tightBox = getTightHitbox(img);
        super(x + tightBox.x, y + tightBox.y, tightBox.w, tightBox.h, false);
        
        this.originalImage = img;
        this.currentImage = img;
        this.isDisguised = false;
        
        this.hitboxOffset = { x: tightBox.x, y: tightBox.y };
        this.originalStats = { w: tightBox.w, h: tightBox.h, offX: tightBox.x, offY: tightBox.y };
        
        this.reticle = { x: 0, y: 0 };
    }

    handleInput(input, worldMouse, props) {
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            this.vx -= 1;
        }
        if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            this.vx += 1;
        }
        
        let jForce = CONFIG.baseJumpForce;
        if (this.isDisguised) {
            const sizeFactor = (this.w * this.h) / 2000; 
            jForce += Math.min(sizeFactor, 5); 
        }

        if ((input.keys['KeyW'] || input.keys['ArrowUp'] || input.keys['Space']) && this.grounded) {
            this.vy = -jForce;
            this.grounded = false;
        }

        const dx = worldMouse.x - (this.x + this.w/2);
        const dy = worldMouse.y - (this.y + this.h/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx);
        
        const clampDist = Math.min(dist, CONFIG.reachDistance);
        
        this.reticle.x = (this.x + this.w/2) + Math.cos(angle) * clampDist;
        this.reticle.y = (this.y + this.h/2) + Math.sin(angle) * clampDist;

        if (input.mouse.rightDown) {
            this.resetDisguise();
        }

        if (input.mouse.leftDown) {
            this.tryMorph(props);
            input.mouse.leftDown = false; 
        }
    }

    tryMorph(props) {
        const rSize = 4;
        const pointerRect = { 
            x: this.reticle.x - rSize/2, 
            y: this.reticle.y - rSize/2, 
            w: rSize, 
            h: rSize 
        };

        for (let prop of props) {
            if (checkAABB(pointerRect, prop)) {
                 this.becomeProp(prop);
                 return;
            }
        }
    }

    becomeProp(prop) {
        this.isDisguised = true;
        this.currentImage = prop.image;
        this.w = prop.w;
        this.h = prop.h;
        this.hitboxOffset = { x: prop.hitboxOffset.x, y: prop.hitboxOffset.y };
        this.y -= 5; 
    }

    resetDisguise() {
        this.isDisguised = false;
        this.currentImage = this.originalImage;
        this.w = this.originalStats.w;
        this.h = this.originalStats.h;
        this.hitboxOffset = { x: this.originalStats.offX, y: this.originalStats.offY };
        this.y -= 5;
    }

    draw(ctx) {
        ctx.drawImage(this.currentImage, this.x - this.hitboxOffset.x, this.y - this.hitboxOffset.y);
        
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(this.reticle.x, this.reticle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}