export class InputHandler {
    constructor(canvas) {
        console.info("InputHandler initializing on canvas", canvas);
        this.keys = {};
        this.mouse = { x: 0, y: 0, leftDown: false, rightDown: false, middleDown: false, rightPressed: false, leftPressed: false };
        this.canvas = canvas;
        this.onPauseToggle = null;
        window.addEventListener('keydown', (e) => {
            console.debug("InputHandler: keydown event", e.code);
            this.keys[e.code] = true;
            if (e.code === 'Escape' && this.onPauseToggle) {
                console.info("InputHandler: Escape key detected, toggling pause");
                this.onPauseToggle();
            }
        });
        window.addEventListener('keyup', (e) => {
            console.debug("InputHandler: keyup event", e.code);
            this.keys[e.code] = false;
        });
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            console.trace("InputHandler: mousemove updated coords", this.mouse.x, this.mouse.y);
        });
        window.addEventListener('mousedown', (e) => {
            console.info("InputHandler: mousedown event button", e.button);
            if (e.button === 0) { this.mouse.leftDown = true; this.mouse.leftPressed = true; }
            if (e.button === 1) { this.mouse.middleDown = true; e.preventDefault(); console.debug("InputHandler: middle mouse prevented default"); }
            if (e.button === 2) { this.mouse.rightDown = true; this.mouse.rightPressed = true; }
        });
        window.addEventListener('mouseup', (e) => {
            console.info("InputHandler: mouseup event button", e.button);
            if (e.button === 0) this.mouse.leftDown = false;
            if (e.button === 1) this.mouse.middleDown = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });
        canvas.addEventListener('contextmenu', e => {
            console.debug("InputHandler: contextmenu prevented");
            e.preventDefault();
        });
        window.addEventListener('wheel', e => {
            if(e.ctrlKey) {
                console.debug("InputHandler: wheel with ctrlKey prevented");
                e.preventDefault();
            }
        }, {passive: false});
        console.info("InputHandler initialization complete");
    }
    resetPressed() {
        console.trace("InputHandler: resetPressed called");
        this.mouse.rightPressed = false;
        this.mouse.leftPressed = false;
    }
}