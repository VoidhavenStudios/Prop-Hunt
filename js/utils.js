const CONFIG = {
    gravity: 0.6,
    friction: 0.85,
    speed: 5,
    baseJumpForce: 14,
    reachDistance: 450, 
    worldScale: 0.6
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

function getTightHitbox(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    let left = img.width, right = 0, top = img.height, bottom = 0;
    let found = false;

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const alpha = data[(y * img.width + x) * 4 + 3];
            if (alpha > 20) {
                if (x < left) left = x;
                if (x > right) right = x;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
                found = true;
            }
        }
    }

    if (!found) return { x: 0, y: 0, w: img.width, h: img.height };

    return {
        x: left,
        y: top,
        w: right - left + 1,
        h: bottom - top + 1
    };
}