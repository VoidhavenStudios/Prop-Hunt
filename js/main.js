const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const pauseMenu = document.getElementById('pause-menu');

const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player;
let isPaused = false;
let isHunter = true; // Toggle for testing

const camera = { x: 0, y: 0 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Pause Logic
input.onPauseToggle = () => {
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
        uiLayer.style.display = 'none';
    } else {
        pauseMenu.classList.add('hidden');
        uiLayer.style.display = 'block';
    }
};

document.getElementById('btn-resume').onclick = input.onPauseToggle;
document.getElementById('btn-exit').onclick = () => window.location.reload();
document.getElementById('btn-team').onclick = () => {
    isHunter = !isHunter;
    spawnPlayer();
    input.onPauseToggle();
};

function spawnPlayer() {
    const startX = 200;
    const startY = CONFIG.mapHeight - 400;
    if (isHunter) {
        player = new HunterPlayer(startX, startY);
    } else {
        player = new PropPlayer(startX, startY);
    }
}

function init() {
    const w = CONFIG.mapWidth;
    const h = CONFIG.mapHeight;
    const t = 64; 

    // Bounds
    mapBlocks.push(new Block(0, 0, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, h - t, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, t, t, h - 2 * t, 'tex-brick')); 
    mapBlocks.push(new Block(w - t, t, t, h - 2 * t, 'tex-brick')); 

    // Structures
    mapBlocks.push(new Block(300, h - 300, 200, 50, 'tex-brick'));
    mapBlocks.push(new Block(600, h - 500, 400, 50, 'tex-brick'));
    mapBlocks.push(new Block(1200, h - 200, 100, 150, 'tex-brick'));
    mapBlocks.push(new Block(1500, h - 600, 300, 50, 'tex-brick'));

    for(let i=0; i<40; i++) {
        const type = Math.floor(Math.random() * 6);
        const px = 100 + Math.random() * (w - 200);
        const py = h - 200 - Math.random() * 500;
        props.push(new WorldProp(px, py, type));
    }

    resolvePropOverlaps();
    spawnPlayer();
    loop();
}

function resolvePropOverlaps() {
    const iterations = 10;
    for (let k = 0; k < iterations; k++) {
        for (let i = 0; i < props.length; i++) {
            for (let j = i + 1; j < props.length; j++) {
                const p1 = props[i];
                const p2 = props[j];
                const r1 = getHitbox(p1);
                const r2 = getHitbox(p2);

                if (checkAABB(r1, r2)) {
                    const overlapX = (r1.w / 2 + r2.w / 2) - Math.abs((r1.x + r1.w / 2) - (r2.x + r2.w / 2));
                    const overlapY = (r1.h / 2 + r2.h / 2) - Math.abs((r1.y + r1.h / 2) - (r2.y + r2.h / 2));

                    if (overlapX < overlapY) {
                        const shift = overlapX / 2 + 1;
                        if (r1.x < r2.x) { p1.x -= shift; p2.x += shift; }
                        else { p1.x += shift; p2.x -= shift; }
                    } else {
                        const shift = overlapY / 2 + 1;
                        if (r1.y < r2.y) { p1.y -= shift; p2.y += shift; }
                        else { p1.y += shift; p2.y -= shift; }
                    }
                }
            }
        }
    }
}

function updateCamera() {
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
    if (!isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateCamera();

        player.commonInput(input, camera);
        player.handleSpecificInput(input, props);
        
        player.update();
        player.grounded = false;
        for (let block of mapBlocks) player.resolveCollision(block);
        
        // Prop player physics against props
        if (player instanceof PropPlayer && player.isDisguised) {
             for (let prop of props) player.resolveCollision(prop);
        }

        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            prop.update();
            prop.grounded = false;
            
            for (let block of mapBlocks) prop.resolveCollision(block);
            
            for (let j = i + 1; j < props.length; j++) {
                prop.resolveCollision(props[j]);
            }
        }

        ctx.save();
        ctx.scale(CONFIG.worldScale, CONFIG.worldScale);
        ctx.translate(-camera.x, -camera.y);

        for (let block of mapBlocks) block.draw(ctx);
        for (let prop of props) prop.draw(ctx);
        player.draw(ctx);

        ctx.restore();
    }
    requestAnimationFrame(loop);
}

window.onload = () => {
    setTimeout(init, 200); 
};