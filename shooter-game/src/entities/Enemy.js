import { distance, normalize } from "../utils/math.js";
import Bullet from "./Bullet.js";

/**
 * Enemy entity - pursues and attacks the player
 */
export default class Enemy {
  constructor(x, y, type = "basic", game = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.game = game;
    this.width = 20;
    this.height = 20;
    this.dead = false;
    this.age = 0;
    this.facingAngle = 0; // Direction the enemy is facing

    // Type-based stats
    this.setTypeStats(type);
  }

  setTypeStats(type) {
    this.baseShootRate = 1.2;
    this.baseHp = 3;
    switch (type) {
      case "fast":
        this.speed = 200;
        this.hp = 1;
        this.maxHp = 1;
        this.radius = 8;
        this.color = "orange";
        this.points = 15;
        this.baseShootRate = 1.5; // seconds between shots
        this.shootRate = this.baseShootRate;
        this.shootRange = 300; // pixels
        this.stoppingDistance = 200; // hold position at this range
        this.baseHp = 1;
        break;
      case "tank":
        this.speed = 80;
        this.hp = 5;
        this.maxHp = 5;
        this.radius = 15;
        this.color = "darkred";
        this.points = 25;
        this.baseShootRate = 0.8; // shoots more often
        this.shootRate = this.baseShootRate;
        this.shootRange = 350;
        this.stoppingDistance = 250; // tanks hold further back
        this.baseHp = 5;
        break;
      default: // basic
        this.speed = 120;
        this.hp = 3;
        this.maxHp = 3;
        this.radius = 10;
        this.color = "red";
        this.points = 10;
        this.baseShootRate = 1.2; // seconds between shots
        this.shootRate = this.baseShootRate;
        this.shootRange = 300; // pixels
        this.stoppingDistance = 180; // hold at medium range
        this.baseHp = 3;
    }
    this.shootCooldown = Math.random() * this.shootRate; // random initial cooldown
  }

  applyDifficultyScaling(difficultyScale) {
    const bonusHp = difficultyScale.enemyHpBonus || 0;
    const shootRateMultiplier = difficultyScale.enemyShootRateMultiplier || 1;

    this.maxHp = this.baseHp + bonusHp;
    this.hp = Math.min(this.hp + bonusHp, this.maxHp);
    this.shootRate = Math.max(0.35, this.baseShootRate * shootRateMultiplier);
    this.shootCooldown = Math.min(this.shootCooldown, this.shootRate);
  }

  update(player, dt) {
    // Calculate direction to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      // Chase until reaching stopping distance, then hold position
      if (dist > this.stoppingDistance) {
        const nextX = this.x + nx * this.speed * dt;
        const nextY = this.y + ny * this.speed * dt;

        if (this.canMoveTo(nextX, this.y)) {
          this.x = nextX;
        }

        if (this.canMoveTo(this.x, nextY)) {
          this.y = nextY;
        }
      }

      // Always face the player
      this.facingAngle = Math.atan2(dy, dx);
    }

    // Handle shooting
    this.shootCooldown -= dt;

    this.age += dt;
  }

  canMoveTo(x, y) {
    const halfWidth = this.width / 2 - 1;
    const halfHeight = this.height / 2 - 1;
    const points = [
      [x - halfWidth, y - halfHeight],
      [x + halfWidth, y - halfHeight],
      [x - halfWidth, y + halfHeight],
      [x + halfWidth, y + halfHeight],
    ];

    return points.every(([pointX, pointY]) => {
      if (
        pointX < 0 ||
        pointY < 0 ||
        pointX > this.game.width ||
        pointY > this.game.height
      ) {
        return true;
      }

      return this.game.map.isWalkable(pointX, pointY);
    });
  }

  draw(ctx) {
    // Health bar
    if (this.hp < this.maxHp) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        this.x - this.radius,
        this.y - this.radius - 8,
        this.radius * 2,
        4,
      );
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.x - this.radius,
        this.y - this.radius - 8,
        (this.radius * 2 * this.hp) / this.maxHp,
        4,
      );
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle + Math.PI / 2);

    // Draw body - triangular ship shape in red (enemy color)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(0, this.height / 4);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    // Draw barrel/indicator - yellow for enemy
    ctx.fillStyle = "yellow";
    ctx.fillRect(-2, -this.height / 2 - 6, 4, 6);

    ctx.restore();
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  canShoot(playerDistance) {
    return this.shootCooldown <= 0 && playerDistance <= this.shootRange;
  }

  shoot(player) {
    // Calculate angle to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);

    // Create bullet from enemy position
    const offsetX = Math.cos(angle) * this.radius;
    const offsetY = Math.sin(angle) * this.radius;

    const bullet = new Bullet(
      this.x + offsetX,
      this.y + offsetY,
      angle,
      "enemy",
      this.game,
    );

    this.shootCooldown = this.shootRate;
    return bullet;
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
