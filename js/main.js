const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player;

const camera = { x: 0, y: 0 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function resolveSpawnOverlaps() {
    const iterations = 15;
    
    for (let k = 0; k < iterations; k++) {
        for (let prop of props) {
            prop.resolveMapCollision(mapBlocks);
            
            for (let other of props) {
                if (prop !== other) {
                    prop.resolvePropCollision(other);
                }
            }
        }
    }
}

function init() {
    const roomW = 1200;
    const roomH = 800;
    const wallThick = 64;

    mapBlocks.push(new Block(0, 0, roomW, wallThick, 'tex-brick')); 
    mapBlocks.push(new Block(0, roomH - wallThick, roomW, wallThick, 'tex-brick')); 
    mapBlocks.push(new Block(0, wallThick, wallThick, roomH - (wallThick*2), 'tex-brick')); 
    mapBlocks.push(new Block(roomW - wallThick, wallThick, wallThick, roomH - (wallThick*2), 'tex-brick')); 

    mapBlocks.push(new Block(200, 600, 200, 32, 'tex-brick'));
    mapBlocks.push(new Block(600, 500, 300, 32, 'tex-brick'));
    mapBlocks.push(new Block(100, 350, 150, 32, 'tex-brick'));
    mapBlocks.push(new Block(800, 300, 100, 32, 'tex-brick'));
    
    props.push(new Prop(300, 500, 0));
    props.push(new Prop(350, 500, 1));
    props.push(new Prop(650, 400, 2));
    props.push(new Prop(750, 400, 3));
    props.push(new Prop(150, 250, 4));
    props.push(new Prop(850, 200, 5));
    props.push(new Prop(500, 700, 0)); 
    props.push(new Prop(520, 700, 1)); 

    resolveSpawnOverlaps();

    player = new Player(150, 600);

    loop();
}

function updateCamera() {
    const scale = CONFIG.worldScale;
    
    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h / 4; 

    camera.x = targetX - (canvas.width / 2) / scale;
    camera.y = targetY - (canvas.height / 2) / scale;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateCamera();

    const worldMouse = {
        x: (input.mouse.x / CONFIG.worldScale) + camera.x,
        y: (input.mouse.y / CONFIG.worldScale) + camera.y
    };

    player.handleInput(input, worldMouse, props);
    player.update();
    player.resolveMapCollision(mapBlocks);

    if (player.isDisguised) {
        for (let prop of props) {
            player.resolvePropCollision(prop);
        }
    }

    for (let prop of props) {
        prop.update();
        prop.resolveMapCollision(mapBlocks);
        
        for (let other of props) {
            if (prop !== other) {
                prop.resolvePropCollision(other);
            }
        }
    }

    ctx.save();
    ctx.scale(CONFIG.worldScale, CONFIG.worldScale);
    ctx.translate(-camera.x, -camera.y);

    for (let block of mapBlocks) block.draw(ctx);
    
    for (let prop of props) prop.draw(ctx);
    
    player.draw(ctx);

    ctx.restore();

    requestAnimationFrame(loop);
}

window.onload = () => {
    setTimeout(init, 200); 
};