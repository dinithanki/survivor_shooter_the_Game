import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import Particle from "../entities/Particle.js";

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
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Core systems
    this.input = new Input();
    this.time = new Time();

    // Entities
    this.player = new Player(this.width / 2, this.height / 2, this);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];

    // Game state
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;

    // Game systems
    this.collisionSystem = new CollisionSystem(this);
    this.shootingSystem = new ShootingSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.damageSystem = new DamageSystem(this);

    // Map and UI
    this.map = null; // Disabled for now (performance)
    this.hud = new HUD(this);
    this.overlay = new Overlay(this);
    this.menu = new Menu(this);

    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "p") {
        this.togglePause();
      }
      if (e.key.toLowerCase() === "r" && this.isGameOver) {
        this.restart();
      }
      if (e.key.toLowerCase() === "m") {
        this.menu.open();
      }
    });
  }

  start() {
    this.waveSystem.startWave();
    this.gameLoop();
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

    if (this.isGameOver) {
      return;
    }

    if (!this.isPaused) {
      // Update systems
      this.input.clearPressed();
      this.player.update(this.input, dt);
      this.shootingSystem.update(this.input, dt);
      this.waveSystem.update(dt);

      // Update entities
      this.bullets.forEach((b) => b.update(dt));
      this.enemies.forEach((e) => e.update(this.player, dt));
      this.particles.forEach((p) => p.update(dt));

      // Remove dead entities
      this.bullets = this.bullets.filter((b) => !b.dead);
      this.enemies = this.enemies.filter((e) => !e.dead);
      this.particles = this.particles.filter((p) => !p.dead);

      // Check collisions and damage
      this.collisionSystem.update();
      this.damageSystem.update(dt);
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw map (optional)
    // if (this.map) this.map.draw(this.ctx);

    // Draw game entities
    this.enemies.forEach((e) => e.draw(this.ctx));
    this.bullets.forEach((b) => b.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
    this.player.draw(this.ctx);

    // Draw UI
    this.hud.draw(this.ctx);

    // Draw overlays
    if (this.isGameOver) {
      this.overlay.show("gameOver");
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
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
  }

  restart() {
    // Reset game state
    this.player = new Player(this.width / 2, this.height / 2, this);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.score = 0;
    this.isPaused = false;
    this.isGameOver = false;

    // Reset systems
    this.waveSystem = new WaveSystem(this);
    this.waveSystem.startWave();
  }

  addParticles(x, y, count = 8) {
    const particles = Particle.createExplosion(x, y, count);
    this.particles.push(...particles);
  }
}
