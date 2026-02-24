const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const input = new InputHandler(canvas);
const mapBlocks = [];
const props = [];
let player;

function init() {
    const brickImg = document.getElementById('tex-brick');
    const bw = brickImg.width;
    const bh = brickImg.height;

    for (let i = 0; i < canvas.width / bw; i++) {
        mapBlocks.push(new Block(i * bw, canvas.height - bh, 'tex-brick'));
    }
    
    mapBlocks.push(new Block(200, 450, 'tex-brick'));
    mapBlocks.push(new Block(200 + bw, 450, 'tex-brick'));
    mapBlocks.push(new Block(500, 350, 'tex-brick'));
    mapBlocks.push(new Block(500 + bw, 350, 'tex-brick'));
    mapBlocks.push(new Block(500 + bw * 2, 350, 'tex-brick'));

    props.push(new Prop(300, 400, 0));
    props.push(new Prop(350, 400, 1));
    props.push(new Prop(550, 200, 2));
    props.push(new Prop(600, 200, 3));
    props.push(new Prop(100, 400, 4));
    props.push(new Prop(150, 400, 5));

    player = new Player(100, 100);

    loop();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.handleInput(input, props);
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

    for (let block of mapBlocks) block.draw(ctx);
    for (let prop of props) prop.draw(ctx);
    player.draw(ctx);

    requestAnimationFrame(loop);
}

window.onload = () => {
    setTimeout(init, 100); 
};