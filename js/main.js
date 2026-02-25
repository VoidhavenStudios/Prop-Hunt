import { CONFIG } from './config.js';
import { checkAABB } from './math.js';
import { InputHandler } from './input.js';
import { Block, WorldProp } from './entities.js';
import { HunterPlayer } from './hunter.js';
import { PropPlayer } from './prop.js';
import { MenuController } from './menu.js';
import { PROP_TYPES } from './objects.js';
console.info("main.js module dependencies imported successfully");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
if (!canvas || !ctx) console.error("main.js canvas or 2d context initialization failed");
const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player = null;
let isHunter = true;
const camera = { x: 0, y: 0 };
let menu;
function resize() {
    console.debug("main.js resize triggered. Viewport:", window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
function checkSafeSpawn(x, y, propsArr) {
    console.trace("checkSafeSpawn evaluating coords", x, y);
    let img = document.getElementById('tex-player');
    let pb = img ? { x: x, y: y, w: img.width, h: img.height } : { x: x, y: y, w: 64, h: 64 };
    if (!propsArr) { console.warn("checkSafeSpawn propsArr null"); return true; }
    for (let prop of propsArr) {
        if (!prop || !prop.box) { console.warn("checkSafeSpawn invalid prop bypassed"); continue; }
        let pr = { x: prop.x + prop.box.x, y: prop.y + prop.box.y, w: prop.box.w, h: prop.box.h };
        if (checkAABB(pb, pr)) {
            console.trace("checkSafeSpawn collision detected with prop at", pr.x, pr.y);
            return false;
        }
    }
    console.debug("checkSafeSpawn confirmed safe spawn location");
    return true;
}
function spawnPlayer() {
    console.info("spawnPlayer execution started. Hunter mode:", isHunter);
    let spawnX = 200;
    let spawnY = CONFIG.mapHeight - 400;
    for (let i = 0; i < 50; i++) {
        let tx = 200 + Math.random() * (CONFIG.mapWidth - 400);
        let ty = CONFIG.mapHeight - 400; 
        if (checkSafeSpawn(tx, ty, props)) {
            spawnX = tx;
            spawnY = ty;
            console.debug("spawnPlayer safe location found after iterations", i);
            break;
        }
    }
    if (isHunter) {
        player = new HunterPlayer(spawnX, spawnY);
        console.info("spawnPlayer instantiated HunterPlayer");
    } else {
        player = new PropPlayer(spawnX, spawnY);
        console.info("spawnPlayer instantiated PropPlayer");
    }
}
function init() {
    console.time("main.js init()");
    console.info("main.js initialization started");
    menu = new MenuController(
        input, 
        () => { isHunter = !isHunter; console.info("main.js team toggled via menu callback"); }, 
        spawnPlayer
    );
    const w = CONFIG.mapWidth;
    const h = CONFIG.mapHeight;
    const t = 64; 
    console.debug("main.js constructing map boundary blocks");
    mapBlocks.push(new Block(0, 0, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, h - t, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, t, t, h - 2 * t, 'tex-brick')); 
    mapBlocks.push(new Block(w - t, t, t, h - 2 * t, 'tex-brick')); 
    console.debug("main.js constructing interior map platforms");
    mapBlocks.push(new Block(300, h - 300, 200, 50, 'tex-brick'));
    mapBlocks.push(new Block(600, h - 500, 400, 50, 'tex-brick'));
    mapBlocks.push(new Block(1200, h - 200, 100, 150, 'tex-brick'));
    mapBlocks.push(new Block(1500, h - 600, 300, 50, 'tex-brick'));
    const propKeys = Object.keys(PROP_TYPES);
    console.debug("main.js spawning random props across map", propKeys);
    for(let i=0; i<40; i++) {
        const type = propKeys[Math.floor(Math.random() * propKeys.length)];
        const px = 100 + Math.random() * (w - 200);
        const py = h - 200 - Math.random() * 500;
        props.push(new WorldProp(px, py, type));
    }
    console.info("main.js map and props constructed successfully");
    resolveInitialOverlaps();
    spawnPlayer();
    console.timeEnd("main.js init()");
    console.info("main.js starting animation loop");
    loop();
}
function resolveInitialOverlaps() {
    console.time("resolveInitialOverlaps");
    console.info("resolveInitialOverlaps settling prop physics");
    for (let k = 0; k < 10; k++) {
        for (let i = 0; i < props.length; i++) {
            for (let j = i + 1; j < props.length; j++) {
                if (props[i] && props[j]) {
                    props[i].resolveCollision(props[j]);
                } else {
                    console.warn("resolveInitialOverlaps invalid prop index", i, j);
                }
            }
        }
    }
    console.timeEnd("resolveInitialOverlaps");
}
function updateCamera() {
    console.trace("updateCamera executing");
    if (!player) { console.error("updateCamera failed: player is null"); return; }
    const scale = CONFIG.worldScale;
    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h / 4; 
    camera.x += (targetX - (canvas.width / 2) / scale - camera.x) * 0.1;
    camera.y += (targetY - (canvas.height / 2) / scale - camera.y) * 0.1;
    if (camera.x < 0) { camera.x = 0; console.trace("updateCamera clamped X left border"); }
    if (camera.y < 0) { camera.y = 0; console.trace("updateCamera clamped Y top border"); }
    if (camera.x > CONFIG.mapWidth - canvas.width / scale) { camera.x = CONFIG.mapWidth - canvas.width / scale; console.trace("updateCamera clamped X right border"); }
    if (camera.y > CONFIG.mapHeight - canvas.height / scale) { camera.y = CONFIG.mapHeight - canvas.height / scale; console.trace("updateCamera clamped Y bottom border"); }
}
function loop() {
    console.trace("Main game loop tick");
    if (!menu.isPaused && player) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateCamera();
        player.commonInput(input, camera, props);
        player.handleSpecificInput(input, props);
        player.update();
        player.grounded = false;
        for (let i = 0; i < props.length; i++) {
            if (props[i]) {
                props[i].update();
                props[i].grounded = false;
            } else {
                console.warn("loop processing: prop index undefined", i);
            }
        }
        console.trace("Main game loop resolving collisions iteration phase");
        for (let iter = 0; iter < 4; iter++) {
            for (let block of mapBlocks) player.resolveCollision(block);
            if (player instanceof PropPlayer && player.isDisguised) {
                 for (let prop of props) {
                     if (prop && prop !== player.heldProp) {
                         player.resolveCollision(prop);
                     }
                 }
            }
            for (let i = 0; i < props.length; i++) {
                if (!props[i]) continue;
                for (let block of mapBlocks) props[i].resolveCollision(block);
                for (let j = i + 1; j < props.length; j++) {
                    if (props[j]) {
                        props[i].resolveCollision(props[j]);
                    }
                }
                if (player.heldProp === props[i]) {
                    console.trace("Main game loop ensuring heldProp ignores physics overlap momentarily");
                    for (let other of props) {
                        if (other && other !== props[i]) {
                            props[i].resolveCollision(other);
                        }
                    }
                    for (let block of mapBlocks) {
                        props[i].resolveCollision(block);
                    }
                }
            }
        }
        console.trace("Main game loop rendering graphics context");
        ctx.save();
        ctx.scale(CONFIG.worldScale, CONFIG.worldScale);
        ctx.translate(-camera.x, -camera.y);
        for (let block of mapBlocks) block.draw(ctx);
        for (let prop of props) if (prop) prop.draw(ctx);
        player.draw(ctx);
        ctx.restore();
    } else if (menu.isPaused) {
        console.trace("Main game loop bypassed rendering/updating due to pause state");
    } else {
        console.warn("Main game loop running without valid player instance");
    }
    input.resetPressed();
    requestAnimationFrame(loop);
}
window.onload = () => {
    console.time("Window Load Resources");
    console.info("window.onload triggered, discovering img elements");
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const checkInit = () => {
        loadedCount++;
        console.debug("window.onload image loaded check", loadedCount, "/", images.length);
        if (loadedCount === images.length) {
            console.info("window.onload all images resolved, proceeding to init");
            console.timeEnd("Window Load Resources");
            init();
        }
    };
    if (images.length === 0) {
        console.warn("window.onload zero images found in DOM. Initializing immediately.");
        console.timeEnd("Window Load Resources");
        init();
    } else {
        images.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                console.debug("window.onload image immediately complete", img.id || img.src);
                checkInit();
            } else {
                console.debug("window.onload attaching event listeners to image", img.id || img.src);
                img.addEventListener('load', checkInit);
                img.addEventListener('error', (e) => {
                    console.error("window.onload image load error", e, img.id || img.src);
                    checkInit();
                }); 
            }
        });
    }
};