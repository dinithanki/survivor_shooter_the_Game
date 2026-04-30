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
      const bullets = player.shoot(this.game);

      if (this.game.mode === "multi" && this.game.network) {
        this.game.network.sendPlayerShoot({
          x: player.x,
          y: player.y,
          angle: player.facingAngle,
          shotCount: player.shotCount,
          spreadAngle: player.spreadAngle,
          isSuper: this.game.isSuperBulletsActive(),
          ownerId: this.game.playerId,
        });
      }

      return bullets;
    }
  }

  updateEnemyShooting(dt) {
    const targets = this.game.getAllPlayers();

    for (const enemy of this.game.enemies) {
      const target = this.game.getNearestPlayer(enemy.x, enemy.y, targets);
      if (!target) {
        continue;
      }

      // Calculate distance to the nearest player
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if enemy can shoot and is in range
      if (enemy.canShoot(dist)) {
        const bullet = enemy.shoot(target);
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
