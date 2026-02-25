export class MenuController {
    constructor(inputHandler, toggleTeamCallback, spawnPlayerCallback) {
        console.info("Initializing MenuController");
        this.menuEl = document.getElementById('pause-menu');
        this.btnResume = document.getElementById('btn-resume');
        this.btnTeam = document.getElementById('btn-team');
        this.btnExit = document.getElementById('btn-exit');
        if (!this.menuEl || !this.btnResume || !this.btnTeam || !this.btnExit) {
            console.error("MenuController missing required DOM elements");
        }
        this.input = inputHandler;
        this.isPaused = false;
        this.input.onPauseToggle = () => this.togglePause();
        this.btnResume.onclick = () => {
            console.debug("Resume button clicked");
            this.togglePause();
        };
        this.btnExit.onclick = () => {
            console.info("Exit/Restart button clicked, reloading page");
            window.location.reload();
        };
        this.btnTeam.onclick = () => {
            console.info("Change Team button clicked");
            toggleTeamCallback();
            spawnPlayerCallback();
            this.togglePause();
        };
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        console.info(`Game paused state changed to: ${this.isPaused}`);
        if (this.isPaused) {
            this.menuEl.classList.remove('hidden');
        } else {
            this.menuEl.classList.add('hidden');
        }
    }
}