export function getHitbox(entity) {
    console.trace("getHitbox called for entity", entity);
    if (!entity || !entity.box) {
        console.warn("getHitbox: Invalid entity or entity.box", entity);
        return { x: 0, y: 0, w: 0, h: 0 };
    }
    const hb = { x: entity.x + entity.box.x, y: entity.y + entity.box.y, w: entity.box.w, h: entity.box.h };
    console.debug("getHitbox resolved", hb);
    return hb;
}
export function calculateTightHitbox(img) {
    console.time("calculateTightHitbox");
    console.info("calculateTightHitbox processing image", img);
    if (!img) {
        console.error("calculateTightHitbox: img is null/undefined");
        return { x: 0, y: 0, w: 64, h: 64 };
    }
    const c = document.createElement('canvas');
    c.width = img.width || 64;
    c.height = img.height || 64;
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
        const res = found ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : { x: 0, y: 0, w: c.width, h: c.height };
        console.debug("calculateTightHitbox found bounds:", res);
        console.timeEnd("calculateTightHitbox");
        return res;
    } catch (e) {
        console.error("calculateTightHitbox threw an exception", e);
        console.timeEnd("calculateTightHitbox");
        return { x: 0, y: 0, w: c.width, h: c.height };
    }
}
export function crossProduct(o, a, b) {
    console.trace("crossProduct called with", o, a, b);
    if (!o || !a || !b) {
        console.warn("crossProduct: Missing arguments", {o, a, b});
        return 0;
    }
    const cp = (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    console.debug("crossProduct result", cp);
    return cp;
}
export function convexHull(points) {
    console.time("convexHull");
    console.info("convexHull processing points count:", points ? points.length : 0);
    if (!points || points.length === 0) {
        console.warn("convexHull: empty or invalid points array");
        console.timeEnd("convexHull");
        return null;
    }
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
            console.debug("convexHull: popped from lower hull");
        }
        lower.push(points[i]);
    }
    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
            console.debug("convexHull: popped from upper hull");
        }
        upper.push(points[i]);
    }
    upper.pop();
    lower.pop();
    const step = Math.max(1, Math.floor(upper.concat(lower).length / 16));
    console.info("convexHull simplification step calculated:", step);
    const simplified = [];
    const fullHull = lower.concat(upper);
    for (let i = 0; i < fullHull.length; i += step) {
        simplified.push(fullHull[i]);
    }
    const result = simplified.length >= 3 ? simplified : fullHull;
    console.debug("convexHull resulting vertices count:", result.length);
    console.timeEnd("convexHull");
    return result;
}
export function calculateConvexHullFromImage(img) {
    console.time("calculateConvexHullFromImage");
    console.info("calculateConvexHullFromImage processing image", img);
    if (!img) {
        console.error("calculateConvexHullFromImage: img is null/undefined");
        console.timeEnd("calculateConvexHullFromImage");
        return null;
    }
    const c = document.createElement('canvas');
    c.width = img.width || 64;
    c.height = img.height || 64;
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
        if (points.length === 0) {
            console.warn("calculateConvexHullFromImage: no opaque pixels found");
            console.timeEnd("calculateConvexHullFromImage");
            return null;
        }
        const hull = convexHull(points);
        console.timeEnd("calculateConvexHullFromImage");
        return hull;
    } catch (e) {
        console.error("calculateConvexHullFromImage threw an exception", e);
        console.timeEnd("calculateConvexHullFromImage");
        return null;
    }
}
export function getAxes(vertices) {
    console.trace("getAxes called with vertices", vertices);
    if (!vertices) {
        console.warn("getAxes: missing vertices");
        return [];
    }
    const axes = [];
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        if (!p1 || !p2) {
            console.warn("getAxes: invalid vertex pair", p1, p2);
            continue;
        }
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const len = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
        if (len > 0) axes.push({ x: -edge.y / len, y: edge.x / len });
        else console.debug("getAxes: zero length edge skipped");
    }
    console.debug("getAxes returning axes count:", axes.length);
    return axes;
}
export function project(vertices, axis) {
    console.trace("project called", vertices, axis);
    let min = Infinity, max = -Infinity;
    if (!vertices || !axis) {
        console.error("project: missing vertices or axis", {vertices, axis});
        return { min, max };
    }
    for (const v of vertices) {
        if (!v) {
            console.warn("project: null vertex encountered");
            continue;
        }
        const proj = v.x * axis.x + v.y * axis.y;
        if (proj < min) min = proj;
        if (proj > max) max = proj;
    }
    console.trace("project resulting min/max", min, max);
    return { min, max };
}
export function pointInPolygon(point, vertices) {
    console.trace("pointInPolygon check for point", point);
    if (!point || !vertices) {
        console.warn("pointInPolygon: invalid point or vertices", point, vertices);
        return false;
    }
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const vi = vertices[i];
        const vj = vertices[j];
        if (!vi || !vj) {
            console.warn("pointInPolygon: null vertex", vi, vj);
            continue;
        }
        const xi = vi.x, yi = vi.y;
        const xj = vj.x, yj = vj.y;
        const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
            console.debug("pointInPolygon intersection found, inside toggled to", inside);
        }
    }
    console.debug("pointInPolygon result:", inside);
    return inside;
}
export function checkAABB(rect1, rect2) {
    console.trace("checkAABB called", rect1, rect2);
    if (!rect1 || !rect2) {
        console.warn("checkAABB: missing rect", rect1, rect2);
        return false;
    }
    const result = (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y);
    console.trace("checkAABB returning", result);
    return result;
}
export function findContactPoint(v1, v2, body1, body2) {
    console.trace("findContactPoint called", v1, v2, body1, body2);
    let cx = 0, cy = 0, count = 0;
    if (v1 && v2) {
        for (let p of v1) {
            if (p && pointInPolygon(p, v2)) { cx += p.x; cy += p.y; count++; console.debug("findContactPoint: v1 inside v2", p); }
        }
        for (let p of v2) {
            if (p && pointInPolygon(p, v1)) { cx += p.x; cy += p.y; count++; console.debug("findContactPoint: v2 inside v1", p); }
        }
    } else {
        console.warn("findContactPoint: v1 or v2 is null", v1, v2);
    }
    if (count > 0) {
        console.debug("findContactPoint resolved via vertices average", cx/count, cy/count);
        return { x: cx / count, y: cy / count };
    }
    const r1 = getHitbox(body1);
    const r2 = getHitbox(body2);
    const fallback = { x: (Math.max(r1.x, r2.x) + Math.min(r1.x + r1.w, r2.x + r2.w)) / 2, y: (Math.max(r1.y, r2.y) + Math.min(r1.y + r1.h, r2.y + r2.h)) / 2 };
    console.info("findContactPoint fallback to hitbox center", fallback);
    return fallback;
}