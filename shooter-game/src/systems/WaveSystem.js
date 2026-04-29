/**
 * Wave system - handles enemy spawning in waves
 */
import Enemy from "../entities/Enemy.js";
import { randomInt } from "../utils/random.js";

export default class WaveSystem {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.waveEnded = true;
    this.initialEnemyCount = 12;
    this.maxEnemiesAtOnce = this.initialEnemyCount;
  }

  update(dt) {
    // Check if wave is complete (all enemies killed)
    if (!this.waveEnded && this.game.enemies.length === 0) {
      this.nextWave();
    }
  }

  startWave() {
    this.currentWave = 1;
    this.game.enemies = [];
    this.game.bullets = [];
    this.game.powerUps = [];
    this.game.setMapForWave(this.currentWave);

    // Restore player health to full at the start of a new wave
    this.game.player.hp = this.game.player.maxHp;

    const enemyCount = this.initialEnemyCount;
    for (let i = 0; i < enemyCount; i++) {
      this.spawnEnemy();
    }

    this.waveEnded = false;
  }

  nextWave() {
    this.currentWave++;
    this.game.enemies = [];
    this.game.bullets = [];
    this.game.powerUps = [];
    this.game.setMapForWave(this.currentWave);

    // Restore player health to full at the start of a new wave
    this.game.player.hp = this.game.player.maxHp;

    const enemyCount = Math.min(
      this.maxEnemiesAtOnce,
      this.initialEnemyCount + (this.currentWave - 1) * 2,
    );
    for (let i = 0; i < enemyCount; i++) {
      this.spawnEnemy();
    }

    this.waveEnded = false;
  }

  applyDifficultyScaling(difficultyScale) {
    const tier = Math.max(0, Math.floor((this.game.score || 0) / 100));
    this.maxEnemiesAtOnce = Math.min(
      48,
      this.initialEnemyCount + tier + Math.floor(this.currentWave / 2),
    );
  }

  endWave() {
    this.waveEnded = true;
  }

  spawnEnemy() {
    if (this.game.enemies.length >= this.maxEnemiesAtOnce) {
      return;
    }

    const spawnPoints = this.getEnemySpawnPoints();
    if (spawnPoints.length === 0) {
      return;
    }

    const spawnPoint = spawnPoints[randomInt(0, spawnPoints.length - 1)];
    const x = spawnPoint.x;
    const y = spawnPoint.y;

    let type = "basic";
    const tankChance = Math.min(0.22, 0.01 + (this.currentWave - 1) * 0.012);
    const fastChance = Math.min(0.45, 0.2 + this.currentWave * 0.02);
    const roll = Math.random();

    if (roll < tankChance) {
      type = "tank";
    } else if (roll < tankChance + fastChance) {
      type = "fast";
    }

    const enemy = new Enemy(x, y, type, this.game);
    if (this.game.difficultyScale) {
      enemy.applyDifficultyScaling(this.game.difficultyScale);
    }
    this.game.enemies.push(enemy);
  }

  getEnemySpawnPoints() {
    const tileCenters = this.game.map.getWalkableTileCenters();
    const centerX = this.game.width / 2;
    const centerY = this.game.height / 2;
    const minDistanceFromPlayer = 120;

    return tileCenters.filter((point) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      return Math.sqrt(dx * dx + dy * dy) >= minDistanceFromPlayer;
    });
  }

  getWaveInfo() {
    return {
      wave: this.currentWave,
      enemyCount: this.game.enemies.length,
      waveEnded: this.waveEnded,
    };
  }
}
