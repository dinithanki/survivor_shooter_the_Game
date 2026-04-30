/**
 * Damage system - handles health and status effects
 */
export default class DamageSystem {
  constructor(game) {
    this.game = game;
  }

  update(dt) {
    this.updatePlayerHealth();
  }

  updatePlayerHealth() {
    const player = this.game.player;

    // Game over condition
    if (player.hp <= 0) {
      if (!this.game.isGameOver) {
        this.game.isGameOver = true;
        // trigger a short red flash effect on death
        if (typeof this.game.onPlayerDeath === "function") {
          this.game.onPlayerDeath();
        } else {
          // fallback: directly set flash timer
          this.game.deathFlashTimer = this.game.deathFlashDuration || 0.9;
        }
      }
    }
  }

  applyDamage(target, amount) {
    if (target.takeDamage) {
      target.takeDamage(amount);
    }
  }

  heal(target, amount) {
    if (target.hp !== undefined) {
      target.hp = Math.min(target.hp + amount, target.maxHp);
    }
  }
}
