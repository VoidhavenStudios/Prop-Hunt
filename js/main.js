const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player;

const camera = {
    x: 0,
    y: 0
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function init() {
    mapBlocks.push(new Block(-500, 600, 3000, 200, 'tex-brick')); 
    mapBlocks.push(new Block(200, 450, 200, 50, 'tex-brick'));
    mapBlocks.push(new Block(600, 350, 300, 50, 'tex-brick'));
    mapBlocks.push(new Block(-200, 300, 150, 50, 'tex-brick'));
    mapBlocks.push(new Block(1000, 200, 100, 400, 'tex-brick')); 
    mapBlocks.push(new Block(1100, 500, 500, 50, 'tex-brick'));

    props.push(new Prop(300, 400, 0));
    props.push(new Prop(350, 400, 1));
    props.push(new Prop(650, 200, 2));
    props.push(new Prop(750, 200, 3));
    props.push(new Prop(-150, 200, 4));
    props.push(new Prop(1200, 400, 5));

    player = new Player(100, 100);

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

    for (let prop of props) {
        prop.update();
        prop.resolveMapCollision(mapBlocks);
        
        if (checkAABB(player, prop)) {
             let overlapX = (player.w / 2 + prop.w / 2) - Math.abs((player.x + player.w / 2) - (prop.x + prop.w / 2));
             if (overlapX > 0) {
                 if (player.x < prop.x) prop.vx += 1;
                 else prop.vx -= 1;
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
    setTimeout(init, 100); 
};