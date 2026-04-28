import { distance, normalize } from "../utils/math.js";
import Bullet from "./Bullet.js";

/**
 * Enemy entity - pursues and attacks the player
 */
export default class Enemy {
  constructor(x, y, type = "basic") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
    this.dead = false;
    this.age = 0;
    this.facingAngle = 0; // Direction the enemy is facing

    // Type-based stats
    this.setTypeStats(type);
  }

  setTypeStats(type) {
    switch (type) {
      case "fast":
        this.speed = 200;
        this.hp = 1;
        this.maxHp = 1;
        this.radius = 8;
        this.color = "orange";
        this.points = 15;
        this.shootRate = 1.5; // seconds between shots
        this.shootRange = 300; // pixels
        break;
      case "tank":
        this.speed = 80;
        this.hp = 5;
        this.maxHp = 5;
        this.radius = 15;
        this.color = "darkred";
        this.points = 25;
        this.shootRate = 0.8; // shoots more often
        this.shootRange = 350;
        break;
      default: // basic
        this.speed = 120;
        this.hp = 3;
        this.maxHp = 3;
        this.radius = 10;
        this.color = "red";
        this.points = 10;
        this.shootRate = 1.2; // seconds between shots
        this.shootRange = 300; // pixels
    }
    this.shootCooldown = Math.random() * this.shootRate; // random initial cooldown
  }

  update(player, dt) {
    // Calculate direction to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      this.x += nx * this.speed * dt;
      this.y += ny * this.speed * dt;
      // Update facing angle to point toward player
      this.facingAngle = Math.atan2(dy, dx);
    }

    // Handle shooting
    this.shootCooldown -= dt;

    this.age += dt;
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
