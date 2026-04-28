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
      this.game.isGameOver = true;
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
