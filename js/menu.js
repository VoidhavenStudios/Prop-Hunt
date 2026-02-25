export class MenuController {
    constructor(inputHandler, toggleTeamCallback, spawnPlayerCallback) {
        this.menuEl = document.getElementById('pause-menu');
        this.btnResume = document.getElementById('btn-resume');
        this.btnTeam = document.getElementById('btn-team');
        this.btnExit = document.getElementById('btn-exit');
        this.input = inputHandler;
        this.isPaused = false;
        if (this.input) {
            this.input.onPauseToggle = () => this.togglePause();
        }
        if (this.btnResume) this.btnResume.onclick = () => this.togglePause();
        if (this.btnExit) this.btnExit.onclick = () => window.location.reload();
        if (this.btnTeam) {
            this.btnTeam.onclick = () => {
                toggleTeamCallback();
                spawnPlayerCallback();
                this.togglePause();
            };
        }
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.menuEl) {
            if (this.isPaused) {
                this.menuEl.classList.remove('hidden');
            } else {
                this.menuEl.classList.add('hidden');
            }
        }
    }
}