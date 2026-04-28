/**
 * HUD - Heads Up Display showing game info
 */
export default class HUD {
  constructor(game) {
    this.game = game;
    this.fontSize = 16;
    this.padding = 10;
  }

  draw(ctx) {
    this.drawHealth(ctx);
    this.drawScore(ctx);
    this.drawWave(ctx);
    this.drawFPS(ctx);
  }

  drawHealth(ctx) {
    const player = this.game.player;
    const x = this.padding;
    const y = this.padding + 20;

    // Label
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText("HP:", x, y);

    // Health bar background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x + 40, y - 15, 100, 20);

    // Health bar
    const healthPercent = Math.max(0, player.hp / player.maxHp);
    ctx.fillStyle = healthPercent > 0.3 ? "lime" : "red";
    ctx.fillRect(x + 40, y - 15, 100 * healthPercent, 20);

    // Health text
    ctx.fillStyle = "white";
    ctx.fillText(Math.ceil(player.hp) + "/" + player.maxHp, x + 150, y);
  }

  drawScore(ctx) {
    const x = this.game.width - 200;
    const y = this.padding + 20;

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Score: " + this.game.score, x, y);
  }

  drawWave(ctx) {
    const x = this.game.width / 2;
    const y = this.padding + 20;

    const waveInfo = this.game.waveSystem.getWaveInfo();
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Wave: " + waveInfo.wave + " | Enemies: " + waveInfo.enemyCount,
      x,
      y,
    );
    ctx.textAlign = "left";
  }

  drawFPS(ctx) {
    const x = this.padding;
    const y = this.game.height - this.padding;

    ctx.fillStyle = "gray";
    ctx.font = "12px Arial";
    ctx.fillText("FPS: " + Math.round(1 / this.game.time.deltaTime), x, y);
  }
}
