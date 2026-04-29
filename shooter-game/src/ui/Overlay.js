/**
 * Overlay - fullscreen overlays (game over, pause, etc)
 */
export default class Overlay {
  constructor(game) {
    this.game = game;
    this.currentOverlay = null;
  }

  draw(ctx) {
    if (this.currentOverlay === "gameOver") {
      this.drawGameOver(ctx);
    } else if (this.currentOverlay === "pause") {
      this.drawPause(ctx);
    }
  }

  drawGameOver(ctx) {
    // Semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", this.game.width / 2, this.game.height / 2 - 50);

    ctx.font = "24px Arial";
    ctx.fillText(
      "Final Score: " + this.game.score,
      this.game.width / 2,
      this.game.height / 2 + 20,
    );
    ctx.fillText(
      "Wave: " + this.game.waveSystem.currentWave,
      this.game.width / 2,
      this.game.height / 2 + 60,
    );

    ctx.font = "16px Arial";
    ctx.fillText(
      "Press R to Restart",
      this.game.width / 2,
      this.game.height / 2 + 120,
    );

    ctx.textAlign = "left";
  }

  drawPause(ctx) {
    // Semi-transparent background
    ctx.fillStyle = "rgba(2, 4, 10, 0.72)";
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // Text
    ctx.fillStyle = "#7fe8ff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TACTICAL PAUSE", this.game.width / 2, this.game.height / 2 - 28);

    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.fillText("Mission Frozen", this.game.width / 2, this.game.height / 2 + 10);

    ctx.font = "16px Arial";
    ctx.fillText(
      "Press P to resume the fight",
      this.game.width / 2,
      this.game.height / 2 + 52,
    );

    ctx.textAlign = "left";
  }

  show(overlay) {
    this.currentOverlay = overlay;
  }

  hide() {
    this.currentOverlay = null;
  }
}
