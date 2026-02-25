class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, leftDown: false, rightDown: false, middleDown: false };
        this.canvas = canvas;
        this.onPauseToggle = null;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Escape' && this.onPauseToggle) {
                this.onPauseToggle();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.leftDown = true;
            if (e.button === 1) { 
                this.mouse.middleDown = true; 
                e.preventDefault(); 
            }
            if (e.button === 2) this.mouse.rightDown = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.leftDown = false;
            if (e.button === 1) this.mouse.middleDown = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });

        canvas.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('wheel', e => { if(e.ctrlKey) e.preventDefault(); }, {passive: false});
    }
}