export class MenuController {
    constructor(inputHandler, toggleTeamCallback, spawnPlayerCallback) {
        console.info("MenuController initialization started");
        this.menuEl = document.getElementById('pause-menu');
        this.btnResume = document.getElementById('btn-resume');
        this.btnTeam = document.getElementById('btn-team');
        this.btnExit = document.getElementById('btn-exit');
        if (!this.menuEl || !this.btnResume || !this.btnTeam || !this.btnExit) console.error("MenuController DOM elements missing");
        this.input = inputHandler;
        this.isPaused = false;
        this.input.onPauseToggle = () => {
            console.debug("MenuController onPauseToggle callback triggered via input");
            this.togglePause();
        };
        this.btnResume.onclick = () => {
            console.info("MenuController Resume button clicked");
            this.togglePause();
        };
        this.btnExit.onclick = () => {
            console.info("MenuController Exit button clicked, reloading window");
            window.location.reload();
        };
        this.btnTeam.onclick = () => {
            console.info("MenuController Change Team button clicked");
            toggleTeamCallback();
            spawnPlayerCallback();
            this.togglePause();
        };
        console.info("MenuController initialization complete");
    }
    togglePause() {
        console.info("MenuController togglePause executing. Current state:", this.isPaused);
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.menuEl.classList.remove('hidden');
            console.debug("MenuController unhid pause menu overlay");
        } else {
            this.menuEl.classList.add('hidden');
            console.debug("MenuController hid pause menu overlay");
        }
    }
}