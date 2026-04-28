/**
 * Wave system - handles enemy spawning in waves
 */
import Enemy from "../entities/Enemy.js";
import { randomInt, randomChoice } from "../utils/random.js";

export default class WaveSystem {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.enemiesSpawnedThisWave = 0;
    this.waveEnded = true;
    this.isFirstWave = true;
    this.waveDuration = 30; // seconds
  }

  update(dt) {
    // First wave starts immediately with no delay
    if (this.isFirstWave && this.waveEnded) {
      this.startWave();
      this.isFirstWave = false;
      return;
    }

    if (this.waveEnded) {
      this.waveTimer += dt;
      if (this.waveTimer > 5) {
        // 5 second break between waves
        this.startWave();
      }
      return;
    }

    this.waveTimer += dt;
    this.spawnTimer += dt;

    // End wave after duration or no enemies left
    if (this.waveTimer > this.waveDuration && this.game.enemies.length === 0) {
      this.endWave();
    }

    // Spawn enemies
    const spawnRate = Math.max(0.3, 1.5 - this.currentWave * 0.1);
    if (this.spawnTimer > spawnRate) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }
  }

  startWave() {
    this.currentWave++;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.enemiesSpawnedThisWave = 0;
    this.waveEnded = false;
  }

  endWave() {
    this.waveEnded = true;
    this.waveTimer = 0;
  }

  spawnEnemy() {
    const side = randomInt(0, 3);
    let x, y;

    // Spawn from edges
    switch (side) {
      case 0: // top
        x = randomInt(0, this.game.width);
        y = -20;
        break;
      case 1: // right
        x = this.game.width + 20;
        y = randomInt(0, this.game.height);
        break;
      case 2: // bottom
        x = randomInt(0, this.game.width);
        y = this.game.height + 20;
        break;
      case 3: // left
        x = -20;
        y = randomInt(0, this.game.height);
        break;
    }

    // Enemy type based on wave
    let type = "basic";
    if (this.currentWave > 3 && Math.random() < 0.3) {
      type = "fast";
    }
    if (this.currentWave > 6 && Math.random() < 0.2) {
      type = "tank";
    }

    const enemy = new Enemy(x, y, type);
    this.game.enemies.push(enemy);
    this.enemiesSpawnedThisWave++;
  }

  getWaveInfo() {
    return {
      wave: this.currentWave,
      enemyCount: this.game.enemies.length,
      waveEnded: this.waveEnded,
    };
  }
}
