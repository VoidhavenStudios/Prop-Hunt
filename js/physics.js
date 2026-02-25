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
        this.isHeld = false;
        this.fixedRotation = false;
    }

    update() {
        if (!this.isStatic) {
            if (!this.isHeld) {
                this.vy += CONFIG.gravity;
                const friction = this.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
                this.vx *= friction;
                
                if (!this.fixedRotation) {
                    this.angularVelocity *= CONFIG.angularDrag;
                    if (Math.abs(this.angularVelocity) < 0.001) this.angularVelocity = 0;
                    if (this.angularVelocity > CONFIG.maxAngularVelocity) this.angularVelocity = CONFIG.maxAngularVelocity;
                    if (this.angularVelocity < -CONFIG.maxAngularVelocity) this.angularVelocity = -CONFIG.maxAngularVelocity;
                    this.angle += this.angularVelocity;
                } else {
                    this.angle = 0;
                    this.angularVelocity = 0;
                }
                
                this.x += this.vx;
                this.y += this.vy;
            }
        }
    }

    setHitboxFromImage(img) {
        this.box = calculateTightHitbox(img);
    }

    getVertices() {
        const cx = this.x + this.box.x + this.box.w / 2;
        const cy = this.y + this.box.y + this.box.h / 2;
        const hw = this.box.w / 2;
        const hh = this.box.h / 2;
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const rotate = (dx, dy) => ({
            x: cx + dx * cos - dy * sin,
            y: cy + dx * sin + dy * cos
        });

        return [
            rotate(-hw, -hh),
            rotate(hw, -hh),
            rotate(hw, hh),
            rotate(-hw, hh)
        ];
    }

    resolveCollision(other) {
        if (this.isHeld && other.isHeld) return false;

        const v1 = this.getVertices();
        const v2 = other.getVertices();
        const axes = getAxes(v1).concat(getAxes(v2));

        let minOverlap = Infinity;
        let mtv = null;

        for (const axis of axes) {
            const p1 = project(v1, axis);
            const p2 = project(v2, axis);

            if (p1.max < p2.min || p2.max < p1.min) {
                return false;
            }

            const overlap = Math.min(p1.max - p2.min, p2.max - p1.min);
            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtv = axis;
            }
        }

        const cx1 = this.x + this.box.x + this.box.w / 2;
        const cy1 = this.y + this.box.y + this.box.h / 2;
        const cx2 = other.x + other.box.x + other.box.w / 2;
        const cy2 = other.y + other.box.y + other.box.h / 2;

        const dx = cx1 - cx2;
        const dy = cy1 - cy2;
        if (dx * mtv.x + dy * mtv.y < 0) {
            mtv.x = -mtv.x;
            mtv.y = -mtv.y;
        }

        if (this.isHeld && !other.isStatic) {
            other.x -= mtv.x * minOverlap;
            other.y -= mtv.y * minOverlap;
            other.applyCollisionResponse({ x: -mtv.x, y: -mtv.y }, this);
        }
        else if (other.isHeld && !this.isStatic) {
            this.x += mtv.x * minOverlap;
            this.y += mtv.y * minOverlap;
            this.applyCollisionResponse(mtv, other);
        }
        else if (!this.isStatic && other.isStatic) {
            this.x += mtv.x * minOverlap;
            this.y += mtv.y * minOverlap;
            this.applyCollisionResponse(mtv, other);
        } else if (this.isStatic && !other.isStatic) {
            other.x -= mtv.x * minOverlap;
            other.y -= mtv.y * minOverlap;
            other.applyCollisionResponse({ x: -mtv.x, y: -mtv.y }, this);
        } else if (!this.isStatic && !other.isStatic) {
            const shift = minOverlap / 2;
            this.x += mtv.x * shift;
            this.y += mtv.y * shift;
            other.x -= mtv.x * shift;
            other.y -= mtv.y * shift;
            this.applyCollisionResponse(mtv, other);
            other.applyCollisionResponse({ x: -mtv.x, y: -mtv.y }, this);
        }

        return true;
    }

    applyCollisionResponse(normal, other) {
        if (normal.y < -0.5) {
            this.grounded = true;
        }

        const dot = this.vx * normal.x + this.vy * normal.y;
        if (dot < 0) {
            const restitution = 0.2;
            const impulse = dot * (1 + restitution);
            this.vx -= impulse * normal.x;
            this.vy -= impulse * normal.y;
        }

        if (!this.fixedRotation && !this.isHeld && Math.abs(dot) > 1.0) {
            const torque = (normal.x * this.vy - normal.y * this.vx) * 0.005;
            this.angularVelocity += torque;
        }
    }
}