const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const pauseMenu = document.getElementById('pause-menu');

const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player;
let isPaused = false;
let isHunter = true;

const camera = { x: 0, y: 0 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

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

    mapBlocks.push(new Block(0, 0, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, h - t, w, t, 'tex-brick')); 
    mapBlocks.push(new Block(0, t, t, h - 2 * t, 'tex-brick')); 
    mapBlocks.push(new Block(w - t, t, t, h - 2 * t, 'tex-brick')); 

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

    resolveInitialOverlaps();
    spawnPlayer();
    loop();
}

function resolveInitialOverlaps() {
    for (let k = 0; k < 10; k++) {
        for (let i = 0; i < props.length; i++) {
            for (let j = i + 1; j < props.length; j++) {
                props[i].resolveCollision(props[j]);
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

        player.commonInput(input, camera, props);
        player.handleSpecificInput(input, props);
        
        player.update();
        player.grounded = false;
        
        for (let block of mapBlocks) player.resolveCollision(block);
        
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
    
    input.resetPressed();
    requestAnimationFrame(loop);
}

window.onload = () => {
    setTimeout(init, 200); 
};