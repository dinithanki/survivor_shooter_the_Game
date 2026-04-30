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
    this.shotCount = 1;
    this.spreadAngle = 0.2;
    this.facingAngle = -Math.PI / 2;
    this.hp = 100;
    this.maxHp = 100;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 2; // seconds
    this.color =
      (this.game && this.game.settings && this.game.settings.playerColor) ||
      "dodgerblue";
    this.accentColor = "#bff6ff";
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

    const nextX = this.x + dx * this.speed * dt;
    const nextY = this.y + dy * this.speed * dt;

    if (this.canMoveTo(nextX, this.y)) {
      this.x = nextX;
    }

    if (this.canMoveTo(this.x, nextY)) {
      this.y = nextY;
    }

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

  applyDifficultyScaling(difficultyScale) {
    this.maxHp = difficultyScale.playerMaxHp;
    this.hp = Math.min(this.hp, this.maxHp);
    this.shootRate = difficultyScale.playerShootRate;
  }

  canShoot() {
    return this.shootCooldown <= 0;
  }

  canMoveTo(x, y) {
    return this.game.map.isRectWalkable(x, y, this.width - 2, this.height - 2);
  }

  getCollisionRadius() {
    return Math.min(this.width, this.height) / 2 - 1;
  }

  updateShootCooldown(dt) {
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
  }

  shoot(game = null) {
    const targetGame = game || this.game;
    const offsetX = Math.cos(this.facingAngle) * 18;
    const offsetY = Math.sin(this.facingAngle) * 18;

    const totalShots = Math.max(1, this.shotCount);
    const mid = (totalShots - 1) / 2;
    const bullets = [];
    for (let i = 0; i < totalShots; i++) {
      const spreadOffset = (i - mid) * this.spreadAngle;
      const bullet = new Bullet(
        this.x + offsetX,
        this.y + offsetY,
        this.facingAngle + spreadOffset,
        "player",
        targetGame,
      );
      bullet.ownerId = targetGame.playerId;
      bullet.damage = targetGame.isSuperBulletsActive() ? 3 : 1;
      bullet.radius = targetGame.isSuperBulletsActive() ? 5 : 4;
      this.game.bullets.push(bullet);
      bullets.push(bullet);
    }

    this.shootCooldown = this.shootRate;
    return bullets;
  }

  takeDamage(amount) {
    if (this.invulnerableTime > 0) return;
    this.hp -= amount;
    this.invulnerableTime = this.invulnerableDuration;
  }

  setColor(color) {
    this.color = color;
  }

  draw(ctx) {
    // Flash when invulnerable
    if (this.invulnerableTime > 0 && Math.sin(this.invulnerableTime * 10) > 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle + Math.PI / 2);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(0, this.height / 4);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.accentColor;
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
