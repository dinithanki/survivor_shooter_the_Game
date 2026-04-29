/**
 * Audio manager - handles menu/game music playback states.
 */
export default class AudioManager {
  constructor() {
    this.gameMusic = null;
    this.menuMusic = null;
    this.gameRestartTimeout = null;

    this.musicEnabled = true;
    this.volume = 0.4;
    this.initialized = false;
    this.mode = "menu";
    this.loopDelayMs = 3000;

    this.gameMusicSrc = new URL("../assets/gaming.mp3", import.meta.url).href;
    this.menuMusicSrc = new URL("../assets/menu.mp3", import.meta.url).href;
  }

  async initFromUserGesture() {
    if (this.initialized) {
      return;
    }

    this.gameMusic = new Audio(this.gameMusicSrc);
    this.gameMusic.preload = "auto";
    this.gameMusic.loop = false;
    this.gameMusic.volume = this.volume;

    this.menuMusic = new Audio(this.menuMusicSrc);
    this.menuMusic.preload = "auto";
    this.menuMusic.loop = false;
    this.menuMusic.volume = this.volume;

    this.gameMusic.addEventListener("ended", () => {
      if (!this.musicEnabled || this.mode !== "game") {
        return;
      }

      this.clearGameRestartTimeout();
      this.gameRestartTimeout = window.setTimeout(() => {
        if (this.musicEnabled && this.mode === "game") {
          this.playGameTrackFromStart();
        }
      }, this.loopDelayMs);
    });

    this.initialized = true;
  }

  async setMusicEnabled(enabled) {
    this.musicEnabled = Boolean(enabled);

    if (this.musicEnabled) {
      await this.initFromUserGesture();
      this.syncWithCurrentMode();
      return;
    }

    this.clearGameRestartTimeout();
    this.stopAudio(this.gameMusic, true);
    this.stopAudio(this.menuMusic, true);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (!this.initialized) {
      return;
    }

    if (this.gameMusic) {
      this.gameMusic.volume = this.volume;
    }

    if (this.menuMusic) {
      this.menuMusic.volume = this.volume;
    }
  }

  async enterGameMode() {
    this.mode = "game";
    await this.initFromUserGesture();

    if (!this.musicEnabled) {
      return;
    }

    this.clearGameRestartTimeout();
    this.stopAudio(this.menuMusic, true);

    if (this.gameMusic?.paused) {
      this.playGameTrackFromStart();
    }
  }

  async enterMenuMode() {
    this.mode = "menu";
    await this.initFromUserGesture();

    this.clearGameRestartTimeout();
    this.stopAudio(this.gameMusic, true);

    if (!this.musicEnabled) {
      return;
    }

    // One-shot menu/pause music (no loop).
    this.stopAudio(this.menuMusic, true);
    this.playAudio(this.menuMusic);
  }

  syncWithCurrentMode() {
    if (!this.initialized || !this.musicEnabled) {
      return;
    }

    if (this.mode === "game") {
      this.clearGameRestartTimeout();
      this.stopAudio(this.menuMusic, true);
      if (this.gameMusic?.paused) {
        this.playGameTrackFromStart();
      }
      return;
    }

    this.stopAudio(this.gameMusic, true);
    this.stopAudio(this.menuMusic, true);
    this.playAudio(this.menuMusic);
  }

  playGameTrackFromStart() {
    if (!this.gameMusic) {
      return;
    }

    this.gameMusic.currentTime = 0;
    this.playAudio(this.gameMusic);
  }

  playAudio(audio) {
    if (!audio) {
      return;
    }

    audio.play().catch(() => {
      // Ignore autoplay interruptions; next user gesture will retry.
    });
  }

  stopAudio(audio, resetTime = false) {
    if (!audio) {
      return;
    }

    audio.pause();
    if (resetTime) {
      audio.currentTime = 0;
    }
  }

  clearGameRestartTimeout() {
    if (!this.gameRestartTimeout) {
      return;
    }

    window.clearTimeout(this.gameRestartTimeout);
    this.gameRestartTimeout = null;
  }
}
