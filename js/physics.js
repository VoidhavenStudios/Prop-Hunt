import { CONFIG } from './config.js';
import { calculateTightHitbox, calculateConvexHullFromImage, getAxes, project, findContactPoint } from './math.js';
export class PhysicsBody {
    constructor(x, y, w, h, isStatic) {
        console.debug(`Creating PhysicsBody at (${x},${y}) static: ${isStatic}`);
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 0;
        this.h = h || 0;
        this.vx = 0;
        this.vy = 0;
        this.isStatic = isStatic;
        this.grounded = false;
        this.box = { x: 0, y: 0, w: this.w, h: this.h };
        this.localVertices = null;
        this.angle = 0;
        this.angularVelocity = 0;
        this.isHeld = false;
        this.fixedRotation = isStatic;
        this.mass = isStatic ? 0 : CONFIG.propMass;
        this.invMass = isStatic ? 0 : 1 / this.mass;
        this.inertia = isStatic ? 0 : (this.mass * (this.w * this.w + this.h * this.h)) / 12;
        this.invInertia = isStatic ? 0 : 1 / this.inertia;
    }
    update() {
        if (!this.isStatic) {
            if (!this.isHeld) {
                this.vy += CONFIG.gravity;
            }
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > CONFIG.maxPropSpeed) {
                this.vx = (this.vx / speed) * CONFIG.maxPropSpeed;
                this.vy = (this.vy / speed) * CONFIG.maxPropSpeed;
            }
            const friction = this.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
            this.vx *= friction;
            if (!this.fixedRotation) {
                this.angularVelocity *= CONFIG.angularDrag;
                if (Math.abs(this.angularVelocity) > CONFIG.maxAngularVelocity) {
                    this.angularVelocity = Math.sign(this.angularVelocity) * CONFIG.maxAngularVelocity;
                }
                this.angle += this.angularVelocity;
            } else {
                this.angle = 0;
                this.angularVelocity = 0;
            }
            this.x += this.vx;
            this.y += this.vy;
        }
    }
    setHitboxFromImage(img) {
        if (!img) {
            console.error("setHitboxFromImage called with null image");
            return;
        }
        console.debug("Setting hitbox from image", img.id);
        this.box = calculateTightHitbox(img);
        const hull = calculateConvexHullFromImage(img);
        if (hull) {
            const cx = this.box.x + this.box.w / 2;
            const cy = this.box.y + this.box.h / 2;
            this.localVertices = hull.map(p => ({ x: p.x - cx, y: p.y - cy }));
        } else {
            console.warn("Failed to generate convex hull for image", img.id);
        }
    }
    getVertices() {
        const cx = this.x + this.box.x + this.box.w / 2;
        const cy = this.y + this.box.y + this.box.h / 2;
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const rotate = (dx, dy) => ({ x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos });
        if (this.localVertices && this.localVertices.length > 2) {
            return this.localVertices.map(v => rotate(v.x, v.y));
        }
        const hw = this.box.w / 2;
        const hh = this.box.h / 2;
        return [ rotate(-hw, -hh), rotate(hw, -hh), rotate(hw, hh), rotate(-hw, hh) ];
    }
    resolveCollision(other) {
        if (!other || (this.isStatic && other.isStatic)) return false;
        const v1 = this.getVertices();
        const v2 = other.getVertices();
        if (!v1 || !v2) {
            console.warn("resolveCollision aborted: Missing vertices for collision detection");
            return false;
        }
        const axes = getAxes(v1).concat(getAxes(v2));
        let minOverlap = Infinity;
        let mtv = null;
        for (const axis of axes) {
            const p1 = project(v1, axis);
            const p2 = project(v2, axis);
            if (p1.max <= p2.min || p2.max <= p1.min) return false;
            const overlap = Math.min(p1.max - p2.min, p2.max - p1.min);
            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtv = { x: axis.x, y: axis.y };
            }
        }
        if (!mtv) return false;
        const cx1 = this.x + this.box.x + this.box.w / 2;
        const cy1 = this.y + this.box.y + this.box.h / 2;
        const cx2 = other.x + other.box.x + other.box.w / 2;
        const cy2 = other.y + other.box.y + other.box.h / 2;
        if ((cx2 - cx1) * mtv.x + (cy2 - cy1) * mtv.y < 0) {
            mtv.x = -mtv.x;
            mtv.y = -mtv.y;
        }
        const totalInvMass = this.invMass + other.invMass;
        if (totalInvMass === 0) return false;
        const percent = 0.4;
        const slop = 0.5;
        const correctionMagnitude = Math.max(minOverlap - slop, 0) / totalInvMass * percent;
        this.x -= mtv.x * this.invMass * correctionMagnitude;
        this.y -= mtv.y * this.invMass * correctionMagnitude;
        other.x += mtv.x * other.invMass * correctionMagnitude;
        other.y += mtv.y * other.invMass * correctionMagnitude;
        const contact = findContactPoint(v1, v2, this, other);
        const r1 = { x: contact.x - cx1, y: contact.y - cy1 };
        const r2 = { x: contact.x - cx2, y: contact.y - cy2 };
        const rv = {
            x: (other.vx - other.angularVelocity * r2.y) - (this.vx - this.angularVelocity * r1.y),
            y: (other.vy + other.angularVelocity * r2.x) - (this.vy + this.angularVelocity * r1.x)
        };
        const velAlongNormal = rv.x * mtv.x + rv.y * mtv.y;
        if (velAlongNormal > 0) return true;
        const restitution = Math.abs(velAlongNormal) < 2.0 ? 0.0 : 0.15;
        const r1CrossN = r1.x * mtv.y - r1.y * mtv.x;
        const r2CrossN = r2.x * mtv.y - r2.y * mtv.x;
        const invMassSum = this.invMass + other.invMass + (r1CrossN * r1CrossN) * this.invInertia + (r2CrossN * r2CrossN) * other.invInertia;
        let j = -(1 + restitution) * velAlongNormal / invMassSum;
        const impulse = { x: mtv.x * j, y: mtv.y * j };
        this.vx -= impulse.x * this.invMass;
        this.vy -= impulse.y * this.invMass;
        if (!this.fixedRotation) this.angularVelocity -= r1CrossN * j * this.invInertia;
        other.vx += impulse.x * other.invMass;
        other.vy += impulse.y * other.invMass;
        if (!other.fixedRotation) other.angularVelocity += r2CrossN * j * other.invInertia;
        const tangent = { x: rv.x - velAlongNormal * mtv.x, y: rv.y - velAlongNormal * mtv.y };
        const tangentLen = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
        if (tangentLen > 0.0001) {
            tangent.x /= tangentLen;
            tangent.y /= tangentLen;
            const r1CrossT = r1.x * tangent.y - r1.y * tangent.x;
            const r2CrossT = r2.x * tangent.y - r2.y * tangent.x;
            const invMassSumT = this.invMass + other.invMass + (r1CrossT * r1CrossT) * this.invInertia + (r2CrossT * r2CrossT) * other.invInertia;
            let jt = -(rv.x * tangent.x + rv.y * tangent.y) / invMassSumT;
            const mu = 0.4;
            let frictionImpulse = jt;
            if (Math.abs(jt) > j * mu) frictionImpulse = Math.sign(jt) * j * mu;
            this.vx -= tangent.x * frictionImpulse * this.invMass;
            this.vy -= tangent.y * frictionImpulse * this.invMass;
            if (!this.fixedRotation) this.angularVelocity -= r1CrossT * frictionImpulse * this.invInertia;
            other.vx += tangent.x * frictionImpulse * other.invMass;
            other.vy += tangent.y * frictionImpulse * other.invMass;
            if (!other.fixedRotation) other.angularVelocity += r2CrossT * frictionImpulse * other.invInertia;
        }
        if (mtv.y < -0.5) other.grounded = true;
        if (mtv.y > 0.5) this.grounded = true;
        return true;
    }
}