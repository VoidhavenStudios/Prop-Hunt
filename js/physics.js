class PhysicsBody {
    constructor(x, y, w, h, isStatic) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.vx = 0;
        this.vy = 0;
        this.isStatic = isStatic;
        this.grounded = false;
        this.box = { x: 0, y: 0, w: w, h: h };
        
        this.angle = 0;
        this.angularVelocity = 0;
    }

    update() {
        if (!this.isStatic) {
            this.vy += CONFIG.gravity;
            
            const friction = this.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
            this.vx *= friction;
            this.angularVelocity *= CONFIG.angularDrag;

            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.angularVelocity;
        }
    }

    setHitboxFromImage(img) {
        this.box = calculateTightHitbox(img);
    }

    resolveCollision(other) {
        const r1 = getHitbox(this);
        const r2 = getHitbox(other);

        if (checkAABB(r1, r2)) {
            let overlapX = (r1.w / 2 + r2.w / 2) - Math.abs((r1.x + r1.w / 2) - (r2.x + r2.w / 2));
            let overlapY = (r1.h / 2 + r2.h / 2) - Math.abs((r1.y + r1.h / 2) - (r2.y + r2.h / 2));

            if (overlapX < overlapY) {
                if (r1.x < r2.x) this.x -= overlapX;
                else this.x += overlapX;
                this.vx *= 0.5;
                if(!this.isStatic && !other.isStatic) {
                    this.angularVelocity += (this.vy * 0.01);
                }
            } else {
                if (r1.y < r2.y) {
                    this.y -= overlapY;
                    this.grounded = true;
                } else {
                    this.y += overlapY;
                }
                this.vy = 0;
                if(!this.isStatic && Math.abs(this.vx) > 1) {
                     this.angularVelocity += (this.vx * 0.02);
                }
            }
            return true;
        }
        return false;
    }
}