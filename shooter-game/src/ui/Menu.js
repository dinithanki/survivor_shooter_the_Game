/**
 * Menu - main menu and settings
 */
import MapData from "../map/MapData.js";
import MAP_PRESETS from "../map/MapPresets.js";

export default class Menu {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.view = "main";
    this.selectedOption = 0;
    this.mapPresets = MAP_PRESETS;
    this.options = ["Resume Session", "View Maps", "Deploy Run", "Abort Mission"];
    this.previewWidth = 24;
    this.previewHeight = 14;
    this.previewMaps = this.mapPresets.map((preset) => ({
      preset,
      data: new MapData(this.previewWidth, this.previewHeight, preset),
    }));
    this.tileColors = {
      grass: "#2a5a2a",
      water: "#1a3a5a",
      stone: "#5a5a5a",
      lava: "#d94820",
      forest: "#1a3a1a",
    };
  }

  draw(ctx) {
    if (!this.isOpen) return;

    const width = this.game.width;
    const height = this.game.height;

    ctx.save();

    ctx.fillStyle = "rgba(2, 4, 10, 0.82)";
    ctx.fillRect(0, 0, width, height);

    const panelWidth =
      this.view === "maps" ? Math.min(760, width * 0.92) : Math.min(520, width * 0.84);
    const panelHeight =
      this.view === "maps" ? Math.min(560, height * 0.86) : Math.min(420, height * 0.72);
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
    ctx.fillText(
      this.view === "maps"
        ? "Preview only. Enter or Escape returns to the command menu."
        : "Use arrows to navigate, Enter to confirm, M to reopen.",
      panelX + 28,
      panelY + 122,
    );

    if (this.view === "maps") {
      this.drawMapPreview(ctx, panelX, panelY, panelWidth, panelHeight);
      ctx.restore();
      return;
    }

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
      `Current wave route: ${this.game.selectedMapPreset}. Maps rotate automatically.`,
      optionX,
      panelY + panelHeight - 28,
    );

    ctx.restore();
  }

  open() {
    this.isOpen = true;
    this.view = "main";
    this.selectedOption = 0;
  }

  close() {
    this.isOpen = false;
  }

  handleInput(input) {
    if (this.view === "maps") {
      if (input.isKeyPressed("enter") || input.isKeyPressed("escape")) {
        this.view = "main";
        this.selectedOption = 1;
      }
      return;
    }

    if (input.isKeyPressed("arrowup")) {
      this.selectedOption =
        (this.selectedOption - 1 + this.options.length) % this.options.length;
    }
    if (input.isKeyPressed("arrowdown")) {
      this.selectedOption = (this.selectedOption + 1) % this.options.length;
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
        this.view = "maps";
        break;
      case 2:
        this.game.restart();
        this.close();
        break;
      case 3:
        location.reload();
        break;
    }
  }

  drawMapPreview(ctx, panelX, panelY, panelWidth, panelHeight) {
    const galleryX = panelX + 28;
    const galleryY = panelY + 158;
    const gap = 10;
    const columns = panelWidth > 650 ? 4 : 3;
    const cardWidth = (panelWidth - 56 - gap * (columns - 1)) / columns;
    const cardHeight = 92;

    ctx.font = "bold 13px Arial";

    for (let i = 0; i < this.previewMaps.length; i++) {
      const column = i % columns;
      const row = Math.floor(i / columns);
      const x = galleryX + column * (cardWidth + gap);
      const y = galleryY + row * (cardHeight + gap);
      const preview = this.previewMaps[i];

      ctx.fillStyle = "rgba(255, 255, 255, 0.055)";
      this.roundRect(ctx, x, y, cardWidth, cardHeight, 12, true, false);

      ctx.fillStyle = "#7ef0b1";
      ctx.fillText(`LEVEL ${i + 1}`, x + 10, y + 20);
      ctx.fillStyle = "#f5f8ff";
      ctx.textAlign = "right";
      ctx.fillText(preview.preset.toUpperCase(), x + cardWidth - 10, y + 20);
      ctx.textAlign = "left";

      const mapX = x + 10;
      const mapY = y + 30;
      const tileSize = Math.min(
        (cardWidth - 20) / this.previewWidth,
        48 / this.previewHeight,
      );

      for (let tileY = 0; tileY < this.previewHeight; tileY++) {
        for (let tileX = 0; tileX < this.previewWidth; tileX++) {
          const type = preview.data.getTile(tileX, tileY) || "grass";
          ctx.fillStyle = this.tileColors[type] || this.tileColors.grass;
          ctx.fillRect(
            mapX + tileX * tileSize,
            mapY + tileY * tileSize,
            Math.ceil(tileSize),
            Math.ceil(tileSize),
          );
        }
      }
    }

    ctx.fillStyle = "#8ea4c8";
    ctx.font = "14px Arial";
    ctx.fillText("Locked preview: waves choose these arenas automatically.", panelX + 28, panelY + panelHeight - 28);
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
