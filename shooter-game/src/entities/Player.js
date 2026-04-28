export default class Player {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 3;
    this.game = game;

    this.shootCooldown = 0;
  }

  update(keys) {
    if (keys["w"]) this.y -= this.speed;
    if (keys["s"]) this.y += this.speed;
    if (keys["a"]) this.x -= this.speed;
    if (keys["d"]) this.x += this.speed;

    if (this.shootCooldown > 0) this.shootCooldown--;

    if (keys[" "] && this.shootCooldown === 0) {
      this.game.bullets.push({
        x: this.x,
        y: this.y,
        speed: 6,
        dead: false,
        update() {
          this.y -= this.speed;
        },
        draw(ctx) {
          ctx.fillStyle = "yellow";
          ctx.fillRect(this.x, this.y, 4, 8);
        },
      });

      this.shootCooldown = 15;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "dodgerblue";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
