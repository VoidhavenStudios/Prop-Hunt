class MenuController {
    constructor(inputHandler, toggleTeamCallback, spawnPlayerCallback) {
        this.menuEl = document.getElementById('pause-menu');
        this.btnResume = document.getElementById('btn-resume');
        this.btnTeam = document.getElementById('btn-team');
        this.btnExit = document.getElementById('btn-exit');
        
        this.input = inputHandler;
        this.isPaused = false;

        this.input.onPauseToggle = () => this.togglePause();

        this.btnResume.onclick = () => this.togglePause();
        this.btnExit.onclick = () => window.location.reload();
        this.btnTeam.onclick = () => {
            toggleTeamCallback();
            spawnPlayerCallback();
            this.togglePause();
        };
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.menuEl.classList.remove('hidden');
        } else {
            this.menuEl.classList.add('hidden');
        }
    }
}