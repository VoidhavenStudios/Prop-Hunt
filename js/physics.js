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
    }

    update() {
        if (!this.isStatic) {
            this.vy += CONFIG.gravity;
            this.vx *= CONFIG.friction;

            this.x += this.vx;
            this.y += this.vy;
        }
    }

    resolveMapCollision(mapBlocks) {
        this.grounded = false;
        for (let block of mapBlocks) {
            if (checkAABB(this, block)) {
                let overlapX = (this.w / 2 + block.w / 2) - Math.abs((this.x + this.w / 2) - (block.x + block.w / 2));
                let overlapY = (this.h / 2 + block.h / 2) - Math.abs((this.y + this.h / 2) - (block.y + block.h / 2));

                if (overlapX < overlapY) {
                    if (this.x < block.x) this.x -= overlapX;
                    else this.x += overlapX;
                    this.vx = 0;
                } else {
                    if (this.y < block.y) {
                        this.y -= overlapY;
                        this.grounded = true;
                    } else {
                        this.y += overlapY;
                    }
                    this.vy = 0;
                }
            }
        }
    }
}