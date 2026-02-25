export function getHitbox(entity) {
    if (!entity || !entity.box) {
        return { x: 0, y: 0, w: 0, h: 0 };
    }
    return {
        x: entity.x + entity.box.x,
        y: entity.y + entity.box.y,
        w: entity.box.w,
        h: entity.box.h
    };
}
export function calculateTightHitbox(img) {
    if (!img) {
        console.warn("calculateTightHitbox called with invalid image");
        return { x: 0, y: 0, w: 64, h: 64 };
    }
    try {
        const c = document.createElement('canvas');
        if (!c) throw new Error("Failed to create canvas element");
        c.width = img.width || 64;
        c.height = img.height || 64;
        const cx = c.getContext('2d');
        if (!cx) throw new Error("Failed to get 2d context");
        cx.drawImage(img, 0, 0);
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
        return found ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : { x: 0, y: 0, w: c.width, h: c.height };
    } catch (e) {
        console.error("Error calculating tight hitbox", e);
        return { x: 0, y: 0, w: 64, h: 64 };
    }
}
export function crossProduct(o, a, b) {
    if (!o || !a || !b) return 0;
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
export function convexHull(points) {
    if (!points || points.length === 0) return null;
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
export function calculateConvexHullFromImage(img) {
    if (!img) return null;
    try {
        const c = document.createElement('canvas');
        if (!c) throw new Error("Failed to create canvas");
        c.width = img.width || 64;
        c.height = img.height || 64;
        const cx = c.getContext('2d');
        if (!cx) throw new Error("Failed to get context");
        cx.drawImage(img, 0, 0);
        const points = [];
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
        console.error("Error calculating convex hull", e);
        return null;
    }
}
export function getAxes(vertices) {
    if (!vertices) return [];
    const axes = [];
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        if (!p1 || !p2) continue;
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const len = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
        if (len > 0) axes.push({ x: -edge.y / len, y: edge.x / len });
    }
    return axes;
}
export function project(vertices, axis) {
    let min = Infinity, max = -Infinity;
    if (!vertices || !axis) return { min, max };
    for (const v of vertices) {
        if (!v) continue;
        const proj = v.x * axis.x + v.y * axis.y;
        if (proj < min) min = proj;
        if (proj > max) max = proj;
    }
    return { min, max };
}
export function pointInPolygon(point, vertices) {
    if (!point || !vertices) return false;
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const vi = vertices[i];
        const vj = vertices[j];
        if (!vi || !vj) continue;
        const xi = vi.x, yi = vi.y;
        const xj = vj.x, yj = vj.y;
        const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
export function checkAABB(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y);
}
export function findContactPoint(v1, v2, body1, body2) {
    let cx = 0, cy = 0, count = 0;
    if (v1 && v2) {
        for (let p of v1) {
            if (p && pointInPolygon(p, v2)) { cx += p.x; cy += p.y; count++; }
        }
        for (let p of v2) {
            if (p && pointInPolygon(p, v1)) { cx += p.x; cy += p.y; count++; }
        }
    }
    if (count > 0) return { x: cx / count, y: cy / count };
    const r1 = getHitbox(body1);
    const r2 = getHitbox(body2);
    return { x: (Math.max(r1.x, r2.x) + Math.min(r1.x + r1.w, r2.x + r2.w)) / 2, y: (Math.max(r1.y, r2.y) + Math.min(r1.y + r1.h, r2.y + r2.h)) / 2 };
}