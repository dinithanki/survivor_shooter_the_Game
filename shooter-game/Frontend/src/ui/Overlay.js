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
    } else if (this.currentOverlay === "matchEnd") {
      this.drawMatchEnd(ctx);
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
    ctx.fillText("Press Main Menu to exit", this.game.width / 2, this.game.height / 2 + 120);

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

  drawMatchEnd(ctx) {
    const result = this.game.matchResult;

    ctx.fillStyle = "rgba(2, 4, 10, 0.82)";
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#7fe8ff";
    ctx.font = "bold 16px Arial";
    ctx.fillText(result?.roomName || "Match Complete", this.game.width / 2, this.game.height / 2 - 130);

    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.fillText(
      `Winner: ${result?.winnerName || "Unknown"}`,
      this.game.width / 2,
      this.game.height / 2 - 70,
    );

    ctx.font = "18px Arial";
    ctx.fillText(
      result?.reason || "Highest kills, lowest deaths",
      this.game.width / 2,
      this.game.height / 2 - 30,
    );

    if (Array.isArray(result?.ranking)) {
      ctx.font = "16px Arial";
      result.ranking.slice(0, 5).forEach((player, index) => {
        const label = `${index + 1}. ${player.id === this.game.playerId ? "You" : player.id} | K:${player.kills || 0} D:${player.deaths || 0}`;
        ctx.fillText(label, this.game.width / 2, this.game.height / 2 + 20 + index * 24);
      });
    }

    ctx.font = "16px Arial";
    ctx.fillText("Main Menu returns to the lobby", this.game.width / 2, this.game.height / 2 + 170);
    ctx.textAlign = "left";
  }

  show(overlay) {
    this.currentOverlay = overlay;
  }

  hide() {
    this.currentOverlay = null;
  }
}
