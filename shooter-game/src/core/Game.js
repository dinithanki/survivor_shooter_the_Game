import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import Particle from "../entities/Particle.js";
import PowerUp from "../entities/PowerUp.js";

// Core systems
import Input from "./Input.js";
import Time from "./Time.js";

// Game systems
import CollisionSystem from "../systems/CollisionSystem.js";
import ShootingSystem from "../systems/ShootingSystem.js";
import WaveSystem from "../systems/WaveSystem.js";
import DamageSystem from "../systems/DamageSystem.js";

// Map and UI
import Map from "../map/Map.js";
import MAP_PRESETS from "../map/MapPresets.js";
import HUD from "../ui/HUD.js";
import Overlay from "../ui/Overlay.js";
import Menu from "../ui/Menu.js";

/**
 * Main Game class - orchestrates all game systems
 */
export default class Game {
  constructor() {
    // Canvas setup
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.width = 800;
    this.height = 600;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.resizeCanvas();

    // Core systems
    this.input = new Input();
    this.time = new Time();

    // Entities
    this.player = new Player(this.width / 2, this.height / 2, this);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerUps = [];

    // Game state
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.hasStarted = false;
    this.difficultyTier = -1;
    this.difficultyScale = {
      playerMaxHp: 100,
      playerShootRate: 0.1,
      playerShotCount: 1,
      enemyHpBonus: 0,
      enemyShootRateMultiplier: 1,
    };
    this.superBulletTimer = 0;
    this.shieldTimer = 0;
    this.nextSuperPowerUpScore = 180;
    this.nextShieldPowerUpScore = 280;

    // Death flash effect (visible when player dies)
    this.deathFlashTimer = 0;
    this.deathFlashDuration = 0.9; // seconds

    this.settings = {
      playerColor: "dodgerblue",
    };
    this.onPauseChange   = null;
    this.onGameOver      = null;   // callback for HTML game over screen
    this.mapPresets      = MAP_PRESETS;
    this.mapPresetIndex  = 0;
    this.playTime        = 0;      // seconds elapsed since game started

    // Game systems
    this.collisionSystem = new CollisionSystem(this);
    this.shootingSystem = new ShootingSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.damageSystem = new DamageSystem(this);

    // Map and UI
    // selected map preset (used when creating map / restarting)
    this.selectedMapPreset = this.mapPresets[this.mapPresetIndex];
    this.map = new Map(this.width, this.height, this.selectedMapPreset);
    this.hud = new HUD(this);
    this.overlay = new Overlay(this);
    this.menu = new Menu(this);

    // callback used by DamageSystem to trigger death visual
    this.onPlayerDeath = () => {
      this.deathFlashTimer = this.deathFlashDuration;
    };

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);

    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      if (!this.hasStarted) return;
      if (e.key.toLowerCase() === "p") this.togglePause();
      if (e.key.toLowerCase() === "m") this.menu.open();
    });
  }

  start() {
    this.gameLoop();
  }

  beginGame() {
    this.hasStarted = true;
    this.restart();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = Math.max(1, Math.floor(rect.width || this.width));
    const displayHeight = Math.max(1, Math.floor(rect.height || this.height));

    this.width = displayWidth;
    this.height = displayHeight;

    this.pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(displayWidth * this.pixelRatio);
    this.canvas.height = Math.round(displayHeight * this.pixelRatio);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  handleResize() {
    const oldWidth = this.width;
    const oldHeight = this.height;

    this.resizeCanvas();

    if (!oldWidth || !oldHeight || !this.map) {
      return;
    }

    const scaleX = this.width / oldWidth;
    const scaleY = this.height / oldHeight;

    if (this.player) {
      this.player.x *= scaleX;
      this.player.y *= scaleY;
      this.player.x = Math.max(
        this.player.width / 2,
        Math.min(this.player.x, this.width - this.player.width / 2),
      );
      this.player.y = Math.max(
        this.player.height / 2,
        Math.min(this.player.y, this.height - this.player.height / 2),
      );
    }

    for (const enemy of this.enemies) {
      enemy.x *= scaleX;
      enemy.y *= scaleY;
    }

    for (const bullet of this.bullets) {
      bullet.x *= scaleX;
      bullet.y *= scaleY;
    }

    for (const particle of this.particles) {
      particle.x *= scaleX;
      particle.y *= scaleY;
    }

    for (const powerUp of this.powerUps) {
      powerUp.x *= scaleX;
      powerUp.y *= scaleY;
    }

    this.map = new Map(this.width, this.height, this.selectedMapPreset);
  }

  setPauseChangeHandler(handler) {
    this.onPauseChange = handler;
  }

  setGameOverHandler(handler) {
    this.onGameOver = handler;
  }

  /** Format seconds → "mm:ss" */
  getPlayTimeFormatted() {
    const total = Math.floor(this.playTime);
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  gameLoop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  };

  update() {
    // Update time first
    this.time.update();
    const dt = this.time.deltaTime;

    if (!this.isPaused && !this.isGameOver && this.hasStarted) {
      this.playTime += dt;
    }

    // Always update short-lived visual timers (like death flash)
    if (this.deathFlashTimer > 0) {
      this.deathFlashTimer = Math.max(0, this.deathFlashTimer - dt);
    }

    if (this.isGameOver) {
      return;
    }

    if (!this.hasStarted) {
      return;
    }

    if (!this.isPaused) {
      this.updateDifficultyScaling();

      // Update systems
      this.input.clearPressed();
      this.player.update(this.input, dt);
      this.shootingSystem.update(this.input, dt);
      this.waveSystem.update(dt);
      this.updatePowerUps(dt);
      this.updatePowerUpTimers(dt);
      this.trySpawnScorePowerUps();

      // Update entities
      this.bullets.forEach((b) => b.update(dt));
      this.enemies.forEach((e) => e.update(this.player, dt));
      this.particles.forEach((p) => p.update(dt));
      this.powerUps.forEach((powerUp) => powerUp.update(dt));

      // Remove dead entities
      this.bullets = this.bullets.filter((b) => !b.dead);
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.particles = this.particles.filter((p) => !p.dead);
      this.powerUps = this.powerUps.filter((powerUp) => !powerUp.dead);

      // Check collisions and damage
      this.collisionSystem.update();
      this.damageSystem.update(dt);
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw map
    if (this.map) this.map.draw(this.ctx);

    // Draw game entities
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.bullets.forEach((b) => b.draw(this.ctx));
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
    this.player.draw(this.ctx);

    // Draw UI
    this.hud.draw(this.ctx);

    // Draw overlays
    // Death flash effect (red blink) drawn under overlays so message remains readable
    if (this.deathFlashTimer > 0) {
      const progress = 1 - this.deathFlashTimer / this.deathFlashDuration; // 0 -> 1
      const flashes = 6; // number of pulses
      const alpha = Math.abs(Math.sin(progress * Math.PI * flashes)) * 0.7; // pulsing alpha
      this.ctx.save();
      this.ctx.fillStyle = `rgba(200,20,30,${alpha.toFixed(3)})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    if (this.isGameOver) {
      this.overlay.show("gameOver");
      if (this.onGameOver) this.onGameOver();   // notify HTML layer (once guard inside)
    } else if (this.isPaused) {
      this.overlay.show("pause");
    } else {
      this.overlay.hide();
    }

    this.overlay.draw(this.ctx);

    // Draw menu
    if (this.menu.isOpen) {
      this.menu.handleInput(this.input);
      this.menu.draw(this.ctx);
    }
  }

  togglePause() {
    if (this.isGameOver || !this.hasStarted) return;
    this.isPaused = !this.isPaused;
    if (this.onPauseChange) {
      this.onPauseChange(this.isPaused);
    }
  }

  goToMainMenu() {
    this.isPaused    = false;
    this.hasStarted  = false;
    this.isGameOver  = false;   // stop the draw loop from re-triggering onGameOver
    this.onGameOver  = null;    // clear the callback so it never fires again until next game
  }

  restart() {
    // Reset game state
    this.player = new Player(this.width / 2, this.height / 2, this);
    this.player.setColor(this.settings.playerColor);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerUps = [];
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.playTime = 0;
    this.difficultyTier = -1;
    this.difficultyScale = {
      playerMaxHp: 100,
      playerShootRate: 0.1,
      playerShotCount: 1,
      enemyHpBonus: 0,
      enemyShootRateMultiplier: 1,
    };
    this.superBulletTimer = 0;
    this.shieldTimer = 0;
    this.nextSuperPowerUpScore = 180;
    this.nextShieldPowerUpScore = 280;
    this.mapPresetIndex = 0;
    this.selectedMapPreset = this.mapPresets[this.mapPresetIndex];

    // Recreate map with selected preset
    this.map = new Map(this.width, this.height, this.selectedMapPreset);

    // Reset systems
    this.waveSystem = new WaveSystem(this);
    this.waveSystem.startWave();
  }

  setPlayerColor(color) {
    this.settings.playerColor = color;
    if (this.player && this.player.setColor) {
      this.player.setColor(color);
    }
  }

  setMapForWave(waveNumber) {
    if (!this.mapPresets.length) {
      return;
    }

    this.mapPresetIndex = (waveNumber - 1) % this.mapPresets.length;
    this.selectedMapPreset = this.mapPresets[this.mapPresetIndex];
    this.map = new Map(this.width, this.height, this.selectedMapPreset);

    if (this.player) {
      this.player.x = this.width / 2;
      this.player.y = this.height / 2;
    }
  }

  updateDifficultyScaling() {
    const tier = Math.floor(this.score / 100);
    if (tier === this.difficultyTier) {
      return;
    }

    this.difficultyTier = tier;

    const playerMaxHp = 100 + tier * 10;
    const playerShootRate = Math.max(0.045, 0.1 - tier * 0.006);
    const playerShotCount = Math.min(5, 1 + Math.floor(tier / 2));
    const enemyHpBonus = tier + Math.floor(tier / 2);
    const enemyShootRateMultiplier = Math.max(0.75, 1 - tier * 0.05);

    this.difficultyScale = {
      playerMaxHp,
      playerShootRate,
      playerShotCount,
      enemyHpBonus,
      enemyShootRateMultiplier,
    };

    this.player.maxHp = playerMaxHp;
    this.player.hp = Math.min(playerMaxHp, this.player.hp);
    this.player.shootRate = playerShootRate;
    this.player.shotCount = playerShotCount;

    for (const enemy of this.enemies) {
      enemy.applyDifficultyScaling(this.difficultyScale);
    }

    this.waveSystem.applyDifficultyScaling(this.difficultyScale);
  }

  addParticles(x, y, count = 8) {
    const particles = Particle.createExplosion(x, y, count);
    this.particles.push(...particles);
  }

  updatePowerUps(dt) {
    for (const powerUp of this.powerUps) {
      powerUp.update(dt);
    }
  }

  updatePowerUpTimers(dt) {
    if (this.superBulletTimer > 0) {
      this.superBulletTimer = Math.max(0, this.superBulletTimer - dt);
    }

    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    }
  }

  trySpawnScorePowerUps() {
    if (this.score >= this.nextSuperPowerUpScore) {
      this.spawnPowerUp("super", 8);
      this.nextSuperPowerUpScore += 180;
    }

    if (this.score >= this.nextShieldPowerUpScore) {
      this.spawnPowerUp("shield", 6);
      this.nextShieldPowerUpScore += 240;
    }
  }

  spawnPowerUp(type, duration) {
    const candidates = this.map.getWalkableTileCenters();
    if (!candidates.length) {
      return;
    }

    const spawnPoint =
      candidates[Math.floor(Math.random() * candidates.length)];
    this.powerUps.push(new PowerUp(spawnPoint.x, spawnPoint.y, type, duration));
  }

  collectPowerUp(powerUp) {
    if (powerUp.type === "super") {
      this.superBulletTimer = Math.max(this.superBulletTimer, powerUp.duration);
    } else if (powerUp.type === "shield") {
      this.shieldTimer = Math.max(this.shieldTimer, powerUp.duration);
    }

    powerUp.dead = true;
    this.addParticles(powerUp.x, powerUp.y, 6);
  }

  isSuperBulletsActive() {
    return this.superBulletTimer > 0;
  }

  isShieldActive() {
    return this.shieldTimer > 0;
  }
}
