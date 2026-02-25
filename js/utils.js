const CONFIG = {
    gravity: 1.5,
    friction: 0.90,
    groundFriction: 0.80,
    airFriction: 0.98,
    speed: 5,
    baseJumpForce: 24.0,
    reachDistance: 800,
    worldScale: 0.5,
    mapWidth: 4000,
    mapHeight: 3000,
    angularDrag: 0.85,
    maxAngularVelocity: 0.15
};

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

function getAxes(vertices) {
    const axes = [];
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const normal = { x: -edge.y, y: edge.x };
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        axes.push({ x: normal.x / len, y: normal.y / len });
    }
    return axes;
}

function project(vertices, axis) {
    let min = Infinity, max = -Infinity;
    for (const v of vertices) {
        const proj = v.x * axis.x + v.y * axis.y;
        if (proj < min) min = proj;
        if (proj > max) max = proj;
    }
    return { min, max };
}

function pointInPolygon(point, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}