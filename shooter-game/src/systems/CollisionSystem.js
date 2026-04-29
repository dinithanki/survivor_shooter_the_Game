/**
 * Collision system - handles all collision detection
 */
import {
  circleCollision,
  getCircleCollisionData,
  rectCollision,
} from "../utils/collision.js";

export default class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  update() {
    this.checkBulletEnemyCollision();
    this.checkEnemyBulletPlayerCollision();
    this.checkEnemyPlayerCollision();
    this.checkPlayerPowerUpCollision();
    this.resolveTankCollisions();
  }

  checkBulletEnemyCollision() {
    for (let i = this.game.bullets.length - 1; i >= 0; i--) {
      const bullet = this.game.bullets[i];

      // Enemy bullets should never damage enemies.
      if (bullet.shooter !== "player") {
        continue;
      }

      for (let j = this.game.enemies.length - 1; j >= 0; j--) {
        const enemy = this.game.enemies[j];
        if (this.circleCollides(bullet, enemy)) {
          enemy.takeDamage(bullet.damage || 1);
          bullet.dead = true;

          if (enemy.dead) {
            this.game.score += enemy.points;
            // Create particles
            this.game.addParticles(enemy.x, enemy.y, 8);
            this.game.enemies.splice(j, 1);
          }
          break;
        }
      }
    }

    // Remove dead bullets
    this.game.bullets = this.game.bullets.filter((b) => !b.dead);
  }

  checkEnemyBulletPlayerCollision() {
    for (let i = this.game.bullets.length - 1; i >= 0; i--) {
      const bullet = this.game.bullets[i];
      // Only check enemy bullets hitting the player
      if (bullet.shooter === "enemy") {
        if (
          circleCollision(
            bullet.x,
            bullet.y,
            bullet.radius,
            this.game.player.x,
            this.game.player.y,
            10,
          )
        ) {
          if (!this.game.isShieldActive()) {
            this.game.player.takeDamage(5);
          }
          this.game.addParticles(bullet.x, bullet.y, 3);
          bullet.dead = true;
        }
      }
    }

    // Remove dead bullets
    this.game.bullets = this.game.bullets.filter((b) => !b.dead);
  }

  checkEnemyPlayerCollision() {
    for (let i = this.game.enemies.length - 1; i >= 0; i--) {
      const enemy = this.game.enemies[i];
      if (
        circleCollision(
          enemy.x,
          enemy.y,
          enemy.radius,
          this.game.player.x,
          this.game.player.y,
          10,
        )
      ) {
        // Apply contact damage once per player invulnerability window.
        if (this.game.player.invulnerableTime <= 0) {
          this.game.player.takeDamage(10);
          enemy.takeDamage(1);
          this.game.addParticles(enemy.x, enemy.y, 5);

          if (enemy.dead) {
            this.game.score += enemy.points;
            this.game.addParticles(enemy.x, enemy.y, 8);
            this.game.enemies.splice(i, 1);
          }
        }
      }
    }
  }

  checkPlayerPowerUpCollision() {
    for (let i = this.game.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.game.powerUps[i];
      if (
        circleCollision(
          powerUp.x,
          powerUp.y,
          powerUp.radius,
          this.game.player.x,
          this.game.player.y,
          10,
        )
      ) {
        this.game.collectPowerUp(powerUp);
      }
    }
  }

  resolveTankCollisions() {
    const tanks = [this.game.player, ...this.game.enemies].filter(Boolean);

    // A couple of passes keeps the separation smooth when several tanks stack up.
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < tanks.length; i++) {
        for (let j = i + 1; j < tanks.length; j++) {
          const tankA = tanks[i];
          const tankB = tanks[j];
          const radiusA = this.getTankRadius(tankA);
          const radiusB = this.getTankRadius(tankB);

          const collision = getCircleCollisionData(
            tankA.x,
            tankA.y,
            radiusA,
            tankB.x,
            tankB.y,
            radiusB,
          );

          if (!collision) {
            continue;
          }

          const pushX = (collision.normalX * collision.overlap) / 2;
          const pushY = (collision.normalY * collision.overlap) / 2;

          this.moveTank(tankA, tankA.x - pushX, tankA.y - pushY);
          this.moveTank(tankB, tankB.x + pushX, tankB.y + pushY);
        }
      }
    }
  }

  getTankRadius(tank) {
    if (tank && typeof tank.getCollisionRadius === "function") {
      return tank.getCollisionRadius();
    }

    return tank.radius || 10;
  }

  moveTank(tank, x, y) {
    const halfWidth = tank.width / 2;
    const halfHeight = tank.height / 2;

    const nextX = Math.max(halfWidth, Math.min(x, this.game.width - halfWidth));
    const nextY = Math.max(
      halfHeight,
      Math.min(y, this.game.height - halfHeight),
    );

    if (this.canTankMoveTo(tank, nextX, tank.y)) {
      tank.x = nextX;
    }

    if (this.canTankMoveTo(tank, tank.x, nextY)) {
      tank.y = nextY;
    }
  }

  canTankMoveTo(tank, x, y) {
    if (typeof tank.canMoveTo === "function") {
      return tank.canMoveTo(x, y);
    }

    return this.game.map.isRectWalkable(x, y, tank.width - 2, tank.height - 2);
  }

  circleCollides(obj1, obj2) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius || 4) + (obj2.radius || 10);
  }
}
