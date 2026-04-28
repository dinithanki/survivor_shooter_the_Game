import { normalize, distance } from "../utils/math.js";
import Bullet from "./Bullet.js";

/**
 * Player entity - controlled by the player
 */
export default class Player {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 300; // pixels per second
    this.game = game;

    this.shootCooldown = 0;
    this.shootRate = 0.1; // seconds between shots
    this.facingAngle = -Math.PI / 2;
    this.hp = 100;
    this.maxHp = 100;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 2; // seconds
  }

  update(input, dt) {
    // Movement
    let dx = 0;
    let dy = 0;

    if (input.isKeyDown("w")) dy -= 1;
    if (input.isKeyDown("s")) dy += 1;
    if (input.isKeyDown("a")) dx -= 1;
    if (input.isKeyDown("d")) dx += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
      this.facingAngle = Math.atan2(dy, dx);
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Keep in bounds
    this.x = Math.max(
      this.width / 2,
      Math.min(this.x, this.game.width - this.width / 2),
    );
    this.y = Math.max(
      this.height / 2,
      Math.min(this.y, this.game.height - this.height / 2),
    );

    // Shooting
    // Invulnerability
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= dt;
    }
  }

  canShoot() {
    return this.shootCooldown <= 0;
  }

  updateShootCooldown(dt) {
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
  }

  shoot() {
    const offsetX = Math.cos(this.facingAngle) * 18;
    const offsetY = Math.sin(this.facingAngle) * 18;
    const bullet = new Bullet(
      this.x + offsetX,
      this.y + offsetY,
      this.facingAngle,
    );
    this.game.bullets.push(bullet);
    this.shootCooldown = this.shootRate;
  }

  takeDamage(amount) {
    if (this.invulnerableTime > 0) return;
    this.hp -= amount;
    this.invulnerableTime = this.invulnerableDuration;
  }

  draw(ctx) {
    // Flash when invulnerable
    if (this.invulnerableTime > 0 && Math.sin(this.invulnerableTime * 10) > 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle + Math.PI / 2);

    ctx.fillStyle = "dodgerblue";
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(0, this.height / 4);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "cyan";
    ctx.fillRect(-2, -this.height / 2 - 6, 4, 6);

    ctx.restore();

    ctx.globalAlpha = 1;
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height,
    };
  }
}
