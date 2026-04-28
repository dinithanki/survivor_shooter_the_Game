/**
 * Collision system - handles all collision detection
 */
import { circleCollision, rectCollision } from "../utils/collision.js";

export default class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  update() {
    this.checkBulletEnemyCollision();
    this.checkEnemyBulletPlayerCollision();
    this.checkEnemyPlayerCollision();
  }

  checkBulletEnemyCollision() {
    for (let i = this.game.bullets.length - 1; i >= 0; i--) {
      const bullet = this.game.bullets[i];
      for (let j = this.game.enemies.length - 1; j >= 0; j--) {
        const enemy = this.game.enemies[j];
        if (this.circleCollides(bullet, enemy)) {
          enemy.takeDamage(1);
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
          this.game.player.takeDamage(5);
          this.game.addParticles(bullet.x, bullet.y, 3);
          bullet.dead = true;
        }
      }
    }

    // Remove dead bullets
    this.game.bullets = this.game.bullets.filter((b) => !b.dead);
  }

  checkEnemyPlayerCollision() {
    const playerBounds = this.game.player.getBounds();
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
        this.game.player.takeDamage(10);
        this.game.addParticles(enemy.x, enemy.y, 5);
        this.game.enemies.splice(i, 1);
      }
    }
  }

  circleCollides(obj1, obj2) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius || 4) + (obj2.radius || 10);
  }
}
