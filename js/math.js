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

function crossProduct(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points) {
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }
    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }
    upper.pop();
    lower.pop();
    
    const step = Math.max(1, Math.floor(upper.concat(lower).length / 16));
    const simplified = [];
    const fullHull = lower.concat(upper);
    for (let i = 0; i < fullHull.length; i += step) {
        simplified.push(fullHull[i]);
    }
    return simplified.length >= 3 ? simplified : fullHull;
}

function calculateConvexHullFromImage(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    const points = [];
    try {
        const data = cx.getImageData(0, 0, c.width, c.height).data;
        for (let y = 0; y < c.height; y += 2) {
            for (let x = 0; x < c.width; x += 2) {
                if (data[(y * c.width + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }
        if (points.length === 0) return null;
        return convexHull(points);
    } catch (e) {
        return null;
    }
}

function getAxes(vertices) {
    const axes = [];
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const len = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
        if (len > 0) axes.push({ x: -edge.y / len, y: edge.x / len });
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

function checkAABB(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

function findContactPoint(v1, v2, body1, body2) {
    let cx = 0, cy = 0, count = 0;
    for (let p of v1) {
        if (pointInPolygon(p, v2)) { cx += p.x; cy += p.y; count++; }
    }
    for (let p of v2) {
        if (pointInPolygon(p, v1)) { cx += p.x; cy += p.y; count++; }
    }
    if (count > 0) return { x: cx / count, y: cy / count };
    
    const r1 = getHitbox(body1);
    const r2 = getHitbox(body2);
    return {
        x: (Math.max(r1.x, r2.x) + Math.min(r1.x + r1.w, r2.x + r2.w)) / 2,
        y: (Math.max(r1.y, r2.y) + Math.min(r1.y + r1.h, r2.y + r2.h)) / 2
    };
}