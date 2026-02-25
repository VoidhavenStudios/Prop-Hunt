const CONFIG = {
    gravity: 0.5,
    friction: 0.8,
    speed: 5,
    baseJumpForce: 14,
    reachDistance: 450,
    worldScale: 0.5,
    mapWidth: 3000,
    mapHeight: 2000
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