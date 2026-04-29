/**
 * Audio manager - lightweight background music control.
 */
export default class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.oscA = null;
    this.oscB = null;

    this.musicEnabled = true;
    this.volume = 0.4;
    this.initialized = false;
  }

  async initFromUserGesture() {
    if (this.initialized) {
      if (this.audioContext?.state === "suspended") {
        await this.audioContext.resume();
      }
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    this.audioContext = new AudioCtx();

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.9;

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = this.musicEnabled ? this.volume : 0;

    this.oscA = this.audioContext.createOscillator();
    this.oscA.type = "triangle";
    this.oscA.frequency.value = 110;

    this.oscB = this.audioContext.createOscillator();
    this.oscB.type = "sine";
    this.oscB.frequency.value = 164.81;

    const oscAGain = this.audioContext.createGain();
    oscAGain.gain.value = 0.12;

    const oscBGain = this.audioContext.createGain();
    oscBGain.gain.value = 0.08;

    this.oscA.connect(oscAGain);
    this.oscB.connect(oscBGain);
    oscAGain.connect(this.musicGain);
    oscBGain.connect(this.musicGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    this.oscA.start();
    this.oscB.start();

    this.initialized = true;
  }

  async setMusicEnabled(enabled) {
    this.musicEnabled = Boolean(enabled);

    if (this.musicEnabled) {
      await this.initFromUserGesture();
    }

    if (!this.musicGain || !this.audioContext) {
      return;
    }

    const target = this.musicEnabled ? this.volume : 0;
    this.musicGain.gain.setTargetAtTime(
      target,
      this.audioContext.currentTime,
      0.05,
    );
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    if (!this.musicGain || !this.audioContext || !this.musicEnabled) {
      return;
    }

    this.musicGain.gain.setTargetAtTime(
      this.volume,
      this.audioContext.currentTime,
      0.05,
    );
  }
}
