import { CONFIG } from './config.js';
import { checkAABB } from './math.js';
import { InputHandler } from './input.js';
import { Block, WorldProp } from './entities.js';
import { HunterPlayer } from './hunter.js';
import { PropPlayer } from './prop.js';
import { MenuController } from './menu.js';
import { PROP_TYPES } from './objects.js';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
if (!canvas || !ctx) console.error("Canvas or context not found!");
const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player = null;
let isHunter = true;
const camera = { x: 0, y: 0 };
let menu;
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.debug(`Canvas resized to ${canvas.width}x${canvas.height}`);
}
window.addEventListener('resize', resize);
resize();
function checkSafeSpawn(x, y, propsArr) {
    let img = document.getElementById('tex-player');
    let pb = img ? { x: x, y: y, w: img.width, h: img.height } : { x: x, y: y, w: 64, h: 64 };
    if (!propsArr) return true;
    for (let prop of propsArr) {
        if (!prop || !prop.box) continue;
        let pr = { x: prop.x + prop.box.x, y: prop.y + prop.box.y, w: prop.box.w, h: prop.box.h };
        if (checkAABB(pb, pr)) return false;
    }
    return true;
}
function spawnPlayer() {
    console.info("Spawning player. isHunter:", isHunter);
    let spawnX = 200;
    let spawnY = CONFIG.mapHeight - 400;
    for (let i = 0; i < 50; i++) {
        let tx = 200 + Math.random() * (CONFIG.mapWidth - 400);
        let ty = CONFIG.mapHeight - 400; 
        if (checkSafeSpawn(tx, ty, props)) {
            spawnX = tx;
            spawnY = ty;
            console.debug(`Found safe spawn location after ${i+1} attempts`);
            break;
        }
    }
    try {
        if (isHunter) {
            player = new HunterPlayer(spawnX, spawnY);
        } else {
            player = new PropPlayer(spawnX, spawnY);
        }
        console.info(`Player spawned successfully at (${spawnX}, ${spawnY})`);
    } catch (e) {
        console.error("Error spawning player:", e);
    }
}
function init() {
    console.info("Initializing game...");
    try {
        menu = new MenuController(input, () => { isHunter = !isHunter; }, spawnPlayer);
        const w = CONFIG.mapWidth;
        const h = CONFIG.mapHeight;
        const t = 64; 
        mapBlocks.push(new Block(0, 0, w, t, 'tex-brick')); 
        mapBlocks.push(new Block(0, h - t, w, t, 'tex-brick')); 
        mapBlocks.push(new Block(0, t, t, h - 2 * t, 'tex-brick')); 
        mapBlocks.push(new Block(w - t, t, t, h - 2 * t, 'tex-brick')); 
        mapBlocks.push(new Block(300, h - 300, 200, 50, 'tex-brick'));
        mapBlocks.push(new Block(600, h - 500, 400, 50, 'tex-brick'));
        mapBlocks.push(new Block(1200, h - 200, 100, 150, 'tex-brick'));
        mapBlocks.push(new Block(1500, h - 600, 300, 50, 'tex-brick'));
        console.info(`Created ${mapBlocks.length} map blocks`);
        const propKeys = Object.keys(PROP_TYPES);
        for(let i=0; i<40; i++) {
            const type = propKeys[Math.floor(Math.random() * propKeys.length)];
            const px = 100 + Math.random() * (w - 200);
            const py = h - 200 - Math.random() * 500;
            props.push(new WorldProp(px, py, type));
        }
        console.info(`Spawned ${props.length} dynamic props`);
        resolveInitialOverlaps();
        spawnPlayer();
        console.info("Starting main loop");
        loop();
    } catch (e) {
        console.error("Critical error during initialization", e);
    }
}
function resolveInitialOverlaps() {
    console.info("Resolving initial prop overlaps...");
    for (let k = 0; k < 10; k++) {
        for (let i = 0; i < props.length; i++) {
            for (let j = i + 1; j < props.length; j++) {
                if (props[i] && props[j]) {
                    props[i].resolveCollision(props[j]);
                }
            }
        }
    }
}
function updateCamera() {
    if (!player) return;
    const scale = CONFIG.worldScale;
    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h / 4; 
    camera.x += (targetX - (canvas.width / 2) / scale - camera.x) * 0.1;
    camera.y += (targetY - (canvas.height / 2) / scale - camera.y) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.y < 0) camera.y = 0;
    if (camera.x > CONFIG.mapWidth - canvas.width / scale) camera.x = CONFIG.mapWidth - canvas.width / scale;
    if (camera.y > CONFIG.mapHeight - canvas.height / scale) camera.y = CONFIG.mapHeight - canvas.height / scale;
}
function loop() {
    try {
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
                }
            }
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
            ctx.save();
            ctx.scale(CONFIG.worldScale, CONFIG.worldScale);
            ctx.translate(-camera.x, -camera.y);
            for (let block of mapBlocks) block.draw(ctx);
            for (let prop of props) if (prop) prop.draw(ctx);
            player.draw(ctx);
            ctx.restore();
        }
        input.resetPressed();
        requestAnimationFrame(loop);
    } catch (e) {
        console.error("Error in main loop:", e);
        requestAnimationFrame(loop);
    }
}
window.onload = () => {
    console.info("Window loaded, waiting for assets...");
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const checkInit = () => {
        loadedCount++;
        if (loadedCount === images.length) {
            console.info("All images loaded, calling init");
            init();
        }
    };
    if (images.length === 0) {
        console.warn("No images found to load");
        init();
    } else {
        images.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                checkInit();
            } else {
                img.addEventListener('load', checkInit);
                img.addEventListener('error', (e) => {
                    console.error("Failed to load image:", img.id, e);
                    checkInit(); 
                });
            }
        });
    }
};