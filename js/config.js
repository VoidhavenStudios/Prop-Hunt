export const CONFIG = {
    gravity: 0.8,
    groundFriction: 0.85,
    airFriction: 0.98,
    groundAccel: 2.0,
    airAccel: 0.6,
    maxSpeed: 16.0,
    maxPropSpeed: 25.0,
    baseJumpForce: 24.0, 
    reachDistance: 800,
    worldScale: 0.5,
    mapWidth: 4000,
    mapHeight: 3000,
    angularDrag: 0.96,
    maxAngularVelocity: 0.25,
    defaultPropMass: 15
};
console.info("CONFIG loaded", CONFIG);