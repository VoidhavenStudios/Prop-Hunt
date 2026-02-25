const CONFIG = {
    gravity: 0.5,
    friction: 0.95, 
    groundFriction: 0.9,
    airFriction: 0.98,
    speed: 5,
    baseJumpForce: 14,
    reachDistance: 700, 
    worldScale: 0.5,
    mapWidth: 4000,
    mapHeight: 3000,
    angularDrag: 0.95
};

function checkAABB(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

function getDistance(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function getHitbox(entity) {
    return {
        x: entity.x + entity.box.x,
        y: entity.y + entity.box.y,
        w: entity.box.w,
        h: entity.box.h
    };
}

function calculateTightHitbox(img) {
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
                if (data[(y * c.width + x) * 4 + 3] > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }
        return found ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : { x: 0, y: 0, w: img.width, h: img.height };
    } catch (e) {
        return { x: 0, y: 0, w: img.width, h: img.height };
    }
}