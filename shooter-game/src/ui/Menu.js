/**
 * Menu - main menu and settings
 */
export default class Menu {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.selectedOption = 0;
    this.options = ["Resume", "Settings", "Quit"];
  }

  draw(ctx) {
    if (!this.isOpen) return;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MENU", this.game.width / 2, 100);

    // Options
    ctx.font = "24px Arial";
    for (let i = 0; i < this.options.length; i++) {
      if (i === this.selectedOption) {
        ctx.fillStyle = "yellow";
        ctx.fillText(
          "> " + this.options[i] + " <",
          this.game.width / 2,
          200 + i * 60,
        );
      } else {
        ctx.fillStyle = "white";
        ctx.fillText(this.options[i], this.game.width / 2, 200 + i * 60);
      }
    }

    ctx.textAlign = "left";
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
    if (input.isKeyPressed("enter")) {
      this.selectOption();
    }
  }

  selectOption() {
    switch (this.selectedOption) {
      case 0: // Resume
        this.close();
        break;
      case 1: // Settings
        console.log("Settings");
        break;
      case 2: // Quit
        location.reload();
        break;
    }
  }
}
