/**
 * Time system for delta time and frame timing
 */
export default class Time {
  constructor() {
    this.deltaTime = 0;
    this.lastTime = Date.now();
    this.fps = 60;
    this.frameCount = 0;
    this.elapsedTime = 0;
  }

  update() {
    const now = Date.now();
    this.deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;
    this.frameCount++;
    this.elapsedTime += this.deltaTime;

    // Cap deltaTime to prevent large jumps
    if (this.deltaTime > 0.05) {
      this.deltaTime = 0.05;
    }
  }

  getDelta() {
    return this.deltaTime;
  }

  getElapsed() {
    return this.elapsedTime;
  }

  getFPS() {
    return this.frameCount;
  }
}
