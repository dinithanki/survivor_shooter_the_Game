/**
 * Shooting system - handles weapon mechanics
 */
import Bullet from "../entities/Bullet.js";

export default class ShootingSystem {
  constructor(game) {
    this.game = game;
  }

  update(input, dt) {
    this.game.player.updateShootCooldown(dt);

    if (input.isKeyDown(" ")) {
      this.playerShoot(dt);
    }

    // Update enemy shooting
    this.updateEnemyShooting(dt);
  }

  playerShoot(dt) {
    const player = this.game.player;
    if (player.canShoot()) {
      player.shoot(this.game);
    }
  }

  updateEnemyShooting(dt) {
    for (const enemy of this.game.enemies) {
      // Calculate distance to player
      const dx = this.game.player.x - enemy.x;
      const dy = this.game.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if enemy can shoot and is in range
      if (enemy.canShoot(dist)) {
        const bullet = enemy.shoot(this.game.player);
        this.game.bullets.push(bullet);
      }
    }
  }

  createBurst(x, y, bulletCount = 8) {
    const bullets = [];
    for (let i = 0; i < bulletCount; i++) {
      const angle = (Math.PI * 2 * i) / bulletCount;
      bullets.push(new Bullet(x, y, angle));
    }
    return bullets;
  }
}
