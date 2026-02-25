export class InputHandler {
    constructor(canvas) {
        console.info("Initializing InputHandler");
        this.keys = {};
        this.mouse = { x: 0, y: 0, leftDown: false, rightDown: false, middleDown: false, rightPressed: false, leftPressed: false };
        this.canvas = canvas;
        this.onPauseToggle = null;
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            console.debug("Key down:", e.code);
            if (e.code === 'Escape' && this.onPauseToggle) {
                console.info("Escape key pressed, toggling pause");
                this.onPauseToggle();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            console.debug("Key up:", e.code);
        });
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        window.addEventListener('mousedown', (e) => {
            console.debug("Mouse down, button:", e.button);
            if (e.button === 0) {
                this.mouse.leftDown = true;
                this.mouse.leftPressed = true;
            }
            if (e.button === 1) { 
                this.mouse.middleDown = true; 
                e.preventDefault(); 
            }
            if (e.button === 2) {
                this.mouse.rightDown = true;
                this.mouse.rightPressed = true;
            }
        });
        window.addEventListener('mouseup', (e) => {
            console.debug("Mouse up, button:", e.button);
            if (e.button === 0) this.mouse.leftDown = false;
            if (e.button === 1) this.mouse.middleDown = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });
        canvas.addEventListener('contextmenu', e => {
            console.debug("Context menu prevented");
            e.preventDefault();
        });
        window.addEventListener('wheel', e => {
            if(e.ctrlKey) {
                console.debug("Wheel zoom prevented");
                e.preventDefault();
            }
        }, {passive: false});
    }
    resetPressed() {
        this.mouse.rightPressed = false;
        this.mouse.leftPressed = false;
    }
}