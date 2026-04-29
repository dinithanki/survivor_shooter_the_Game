/**
 * Bullet entity - projectile fired by player or enemy
 */
export default class Bullet {
  constructor(x, y, angle, shooter = "player", game = null) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 500;
    this.radius = 4;
    this.dead = false;
    this.lifetime = 5; // seconds
    this.age = 0;
    this.shooter = shooter; // "player" or "enemy"
    this.game = game;
  }

  update(dt) {
    const nextX = this.x + Math.cos(this.angle) * this.speed * dt;
    const nextY = this.y + Math.sin(this.angle) * this.speed * dt;

    // Check the whole bullet path so fast shots cannot skip through walls.
    if (this.game && !this.canTravelTo(nextX, nextY)) {
      this.dead = true;
      return;
    }

    this.x = nextX;
    this.y = nextY;
    this.age += dt;

    // Remove if out of bounds or lifetime exceeded
    if (this.age > this.lifetime) {
      this.dead = true;
    }
  }

  canTravelTo(nextX, nextY) {
    const dx = nextX - this.x;
    const dy = nextY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(distance / Math.max(1, this.radius)));

    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const x = this.x + dx * t;
      const y = this.y + dy * t;

      if (!this.game.map.isCircleWalkable(x, y, this.radius)) {
        return false;
      }
    }

    return true;
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
