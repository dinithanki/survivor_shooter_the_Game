/**
 * Bullet entity - projectile fired by player or enemy
 */
export default class Bullet {
  constructor(x, y, angle, shooter = "player") {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 500;
    this.radius = 4;
    this.dead = false;
    this.lifetime = 5; // seconds
    this.age = 0;
    this.shooter = shooter; // "player" or "enemy"
  }

  update(dt) {
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
    this.age += dt;

    // Remove if out of bounds or lifetime exceeded
    if (this.age > this.lifetime) {
      this.dead = true;
    }
  }

  draw(ctx) {
    // Player bullets are yellow, enemy bullets are red
    ctx.fillStyle =
      this.shooter === "player"
        ? "rgba(255, 255, 0, 0.8)"
        : "rgba(255, 100, 100, 0.8)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    };
  }
}
