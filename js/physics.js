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
    }

    update() {
        if (!this.isStatic) {
            this.vy += CONFIG.gravity;
            this.vx *= CONFIG.friction;

            this.x += this.vx;
            this.y += this.vy;
        }
    }

    calculateTightHitbox(img) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cx = c.getContext('2d');
        cx.drawImage(img, 0, 0);

        try {
            const data = cx.getImageData(0, 0, c.width, c.height).data;
            let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
            let found = false;

            for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                    const alpha = data[(y * c.width + x) * 4 + 3];
                    if (alpha > 0) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        found = true;
                    }
                }
            }

            if (found) {
                this.box = {
                    x: minX,
                    y: minY,
                    w: maxX - minX + 1,
                    h: maxY - minY + 1
                };
            }
        } catch (e) {
            this.box = { x: 0, y: 0, w: this.w, h: this.h };
        }
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
                this.vx = 0;
            } else {
                if (r1.y < r2.y) {
                    this.y -= overlapY;
                    this.grounded = true;
                } else {
                    this.y += overlapY;
                }
                this.vy = 0;
            }
            return true;
        }
        return false;
    }
}