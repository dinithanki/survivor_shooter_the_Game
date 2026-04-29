/**
 * Menu - main menu and settings
 */
export default class Menu {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.selectedOption = 0;
    this.mapPresets = ["cross", "maze", "diamond", "grid", "spiral", "default"];
    this.selectedMapIndex = 0;
    this.options = [
      "Resume Session",
      `Route: ${this.mapPresets[this.selectedMapIndex]}`,
      "Deploy Run",
      "Abort Mission",
    ];
  }

  draw(ctx) {
    if (!this.isOpen) return;

    const width = this.game.width;
    const height = this.game.height;

    ctx.save();

    ctx.fillStyle = "rgba(2, 4, 10, 0.82)";
    ctx.fillRect(0, 0, width, height);

    const panelWidth = Math.min(520, width * 0.84);
    const panelHeight = Math.min(420, height * 0.72);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    ctx.fillStyle = "rgba(9, 15, 31, 0.96)";
    ctx.strokeStyle = "rgba(63, 224, 255, 0.3)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 22, true, true);

    ctx.fillStyle = "rgba(63, 224, 255, 0.12)";
    this.roundRect(ctx, panelX + 18, panelY + 18, 124, 28, 14, true, false);

    ctx.textAlign = "left";
    ctx.fillStyle = "#7fe8ff";
    ctx.font = "bold 12px Arial";
    ctx.fillText("TACTICAL INTERFACE", panelX + 32, panelY + 37);

    ctx.fillStyle = "#f5f8ff";
    ctx.font = "bold 38px Arial";
    ctx.fillText("COMMAND MENU", panelX + 28, panelY + 92);

    ctx.fillStyle = "#bfd0ef";
    ctx.font = "16px Arial";
    ctx.fillText("Use arrows to navigate, Enter to confirm, M to reopen.", panelX + 28, panelY + 122);

    const optionStartY = panelY + 176;
    const optionGap = 56;
    const optionX = panelX + 28;
    const optionWidth = panelWidth - 56;

    ctx.font = "bold 22px Arial";
    for (let i = 0; i < this.options.length; i++) {
      const optionY = optionStartY + i * optionGap;
      if (i === this.selectedOption) {
        ctx.fillStyle = "rgba(63, 224, 255, 0.16)";
        this.roundRect(ctx, optionX - 10, optionY - 24, optionWidth, 40, 14, true, false);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`> ${this.options[i]} <`, optionX, optionY);
      } else {
        ctx.fillStyle = "#d5e4ff";
        ctx.fillText(this.options[i], optionX, optionY);
      }
    }

    ctx.fillStyle = "#8ea4c8";
    ctx.font = "14px Arial";
    ctx.fillText(
      "Route changes only when the tactical route option is selected.",
      optionX,
      panelY + panelHeight - 28,
    );

    ctx.restore();
  }

  open() {
    this.isOpen = true;
    this.selectedOption = 0;
  }

  close() {
    this.isOpen = false;
  }

  handleInput(input) {
    if (input.isKeyPressed("arrowup")) {
      this.selectedOption =
        (this.selectedOption - 1 + this.options.length) % this.options.length;
    }
    if (input.isKeyPressed("arrowdown")) {
      this.selectedOption = (this.selectedOption + 1) % this.options.length;
    }

    // Left/right to change map when map option selected
    if (this.selectedOption === 1) {
      if (input.isKeyPressed("arrowleft")) {
        this.selectedMapIndex =
          (this.selectedMapIndex - 1 + this.mapPresets.length) %
          this.mapPresets.length;
        this.options[1] = `Map: ${this.mapPresets[this.selectedMapIndex]}`;
      }
      if (input.isKeyPressed("arrowright")) {
        this.selectedMapIndex =
          (this.selectedMapIndex + 1) % this.mapPresets.length;
        this.options[1] = `Map: ${this.mapPresets[this.selectedMapIndex]}`;
      }
    }

    if (input.isKeyPressed("enter")) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0:
        this.close();
        break;
      case 1:
        break;
      case 2:
        this.game.selectedMapPreset = this.mapPresets[this.selectedMapIndex];
        this.game.restart();
        this.close();
        break;
      case 3:
        location.reload();
        break;
    }
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
      return;
    }

    const corner = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + corner, y);
    ctx.arcTo(x + width, y, x + width, y + height, corner);
    ctx.arcTo(x + width, y + height, x, y + height, corner);
    ctx.arcTo(x, y + height, x, y, corner);
    ctx.arcTo(x, y, x + width, y, corner);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}
