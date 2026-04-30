import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";
import Bullet from "../entities/Bullet.js";
import Particle from "../entities/Particle.js";
import PowerUp from "../entities/PowerUp.js";

import Input from "./Input.js";
import Time from "./Time.js";

import CollisionSystem from "../systems/CollisionSystem.js";
import ShootingSystem from "../systems/ShootingSystem.js";
import WaveSystem from "../systems/WaveSystem.js";
import DamageSystem from "../systems/DamageSystem.js";

import Map from "../map/Map.js";
import MAP_PRESETS from "../map/MapPresets.js";
import HUD from "../ui/HUD.js";
import Overlay from "../ui/Overlay.js";
import Menu from "../ui/Menu.js";

import NetworkManager from "../network/NetworkManager.js";

export default class Game {
  constructor() {
    // Canvas
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.width = 800;
    this.height = 600;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.resizeCanvas();

    // Core
    this.input = new Input();
    this.time = new Time();

    // MODE SYSTEM
    this.mode = "single"; // "single" | "multi"
    this.network = null;
    this.remotePlayers = {};
    this.roomId = null;
    this.isHost = false;
    this.playerId = null;
    this.pauseChangeHandler = null;
    this.roomSettings = {
      roomName: "",
      mapPreset: "default",
      durationMinutes: 10,
    };
    this.matchTimerRemaining = 0;
    this.matchActive = false;
    this.matchResult = null;
    this.playerStats = { kills: 0, deaths: 0 };

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
    this.superBulletTimer = 0;
    this.shieldTimer = 0;
    this.deathFlashTimer = 0;
    this.deathFlashDuration = 0.9;

    // Systems
    this.collisionSystem = new CollisionSystem(this);
    this.shootingSystem = new ShootingSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.damageSystem = new DamageSystem(this);

    // Map + UI
    this.selectedMapPreset = MAP_PRESETS[0];
    this.map = new Map(this.width, this.height, this.selectedMapPreset);
    this.hud = new HUD(this);
    this.overlay = new Overlay(this);
    this.menu = new Menu(this);

    // Multiplayer sync handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  /* =========================
     MULTIPLAYER START
  ========================= */
  startMultiplayer(network, roomId) {
    this.mode = "multi";
    this.network = network;
    this.roomId = roomId;
    this.isHost = Boolean(network?.isHost);

    this.enemies = [];
    if (!this.waveSystem) {
      this.waveSystem = new WaveSystem(this);
    }

    console.log("Multiplayer mode started");
  }

  setMultiplayerSettings(settings = {}) {
    this.roomSettings = {
      ...this.roomSettings,
      ...settings,
      durationMinutes: Math.max(1, Math.min(10, Number(settings.durationMinutes) || 10)),
    };

    if (this.roomSettings.mapPreset) {
      this.selectedMapPreset = this.roomSettings.mapPreset;
      this.map = new Map(this.width, this.height, this.selectedMapPreset);
    }
  }

  getMatchDurationSeconds() {
    return Math.max(60, Math.min(600, (this.roomSettings.durationMinutes || 10) * 60));
  }

  getRoomDisplayName() {
    return this.roomSettings.roomName?.trim() || this.roomId || "Multiplayer Room";
  }

  setRemotePlayers(players) {
    this.remotePlayers = players;
  }

  syncLocalPlayerStats(stats = {}) {
    this.playerStats = {
      kills: stats.kills ?? this.playerStats.kills,
      deaths: stats.deaths ?? this.playerStats.deaths,
    };
  }

  setPauseChangeHandler(handler) {
    this.pauseChangeHandler = handler;
  }

  setPlayerColor(color) {
    this.player?.setColor(color);
  }

  isSuperBulletsActive() {
    return this.superBulletTimer > 0;
  }

  isShieldActive() {
    return this.shieldTimer > 0;
  }

  beginGame() {
    this.hasStarted = true;
    this.isGameOver = false;
    this.isPaused = false;
    this.matchResult = null;
    this.overlay.hide();
    this.menu.close();

    if (!this.waveSystem) {
      this.waveSystem = new WaveSystem(this);
    }

    if (this.mode === "multi") {
      this.setMultiplayerSettings(this.network?.settings || this.roomSettings);
      this.matchTimerRemaining = this.getMatchDurationSeconds();
      this.matchActive = true;
      this.matchResult = null;
    }

    if (this.waveSystem.currentWave === 0) {
      this.waveSystem.startWave();
    }
  }

  togglePause() {
    if (!this.hasStarted || this.isGameOver) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.overlay.show(this.isPaused ? "pause" : null);

    if (typeof this.pauseChangeHandler === "function") {
      this.pauseChangeHandler(this.isPaused);
    }
  }

  goToMainMenu() {
    const wasMultiplayer = this.mode === "multi";
    this.hasStarted = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.mode = "single";
    this.isHost = false;
    this.roomId = null;
    this.overlay.hide();
    this.menu.close();

    if (wasMultiplayer) {
      this.remotePlayers = {};
    }
  }

  addParticles(x, y, count = 8) {
    this.particles.push(...Particle.createExplosion(x, y, count));
  }

  getSafeSpawnPoint(minDistanceFromPlayers = 140) {
    const candidates = this.map.getWalkableTileCenters();
    const players = this.getAllPlayers().filter(Boolean);
    const enemies = this.enemies || [];

    const safeCandidates = candidates.filter((point) => {
      const playerClear = players.every((player) => {
        const dx = player.x - point.x;
        const dy = player.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) >= minDistanceFromPlayers;
      });

      const enemyClear = enemies.every((enemy) => {
        const dx = enemy.x - point.x;
        const dy = enemy.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) >= minDistanceFromPlayers * 0.8;
      });

      return playerClear && enemyClear;
    });

    const pool = safeCandidates.length > 0 ? safeCandidates : candidates;
    if (pool.length === 0) {
      return { x: this.width / 2, y: this.height / 2 };
    }

    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  respawnLocalPlayer() {
    const spawnPoint = this.getSafeSpawnPoint();
    this.player.x = spawnPoint.x;
    this.player.y = spawnPoint.y;
    this.player.hp = this.player.maxHp;
    this.player.invulnerableTime = this.player.invulnerableDuration;
    this.player.shootCooldown = 0;
  }

  handleMultiplayerDeath() {
    this.playerStats.deaths += 1;
    this.respawnLocalPlayer();

    if (this.network) {
      this.network.updatePlayerStats(this.network.socket.id, {
        kills: this.playerStats.kills,
        deaths: this.playerStats.deaths,
      });
    }
  }

  registerKill(playerId) {
    if (!playerId) {
      return;
    }

    const targetPlayer = this.network?.players?.[playerId];
    if (!targetPlayer) {
      return;
    }

    targetPlayer.kills = (targetPlayer.kills || 0) + 1;
    if (this.network) {
      this.network.updatePlayerStats(playerId, {
        kills: targetPlayer.kills,
        deaths: targetPlayer.deaths || 0,
      });
    }
  }

  getWinnerSummary() {
    const entries = Object.values(this.network?.players || {}).filter(Boolean);
    if (entries.length === 0) {
      return null;
    }

    const ranking = [...entries].sort((a, b) => {
      const killsDiff = (b.kills || 0) - (a.kills || 0);
      if (killsDiff !== 0) return killsDiff;
      return (a.deaths || 0) - (b.deaths || 0);
    });

    const winner = ranking[0];
    return {
      roomName: this.getRoomDisplayName(),
      winnerId: winner.id,
      winnerName: winner.id === this.playerId ? "You" : winner.id,
      ranking,
      reason: "Highest kills, lowest deaths",
      timerExpired: true,
    };
  }

  endMultiplayerMatch(result = null) {
    this.matchActive = false;
    this.hasStarted = false;
    this.isGameOver = true;
    this.matchResult = result || this.getWinnerSummary();
    this.overlay.show("matchEnd");

    if (this.network?.isHost) {
      this.network.endMatch(this.matchResult);
    }
  }

  collectPowerUp(powerUp) {
    if (powerUp.type === "super") {
      this.superBulletTimer = powerUp.duration;
    } else {
      this.shieldTimer = powerUp.duration;
    }

    powerUp.dead = true;
  }

  setMapForWave(waveNumber) {
    const presetIndex = (waveNumber - 1) % MAP_PRESETS.length;
    this.selectedMapPreset = MAP_PRESETS[presetIndex];
    this.map = new Map(this.width, this.height, this.selectedMapPreset);
  }

  getAllPlayers() {
    return [this.player, ...Object.values(this.remotePlayers || {})].filter(
      Boolean,
    );
  }

  getNearestPlayer(x, y, players = this.getAllPlayers()) {
    let closestPlayer = null;
    let closestDistance = Infinity;

    for (const player of players) {
      const dx = player.x - x;
      const dy = player.y - y;
      const squaredDistance = dx * dx + dy * dy;

      if (squaredDistance < closestDistance) {
        closestDistance = squaredDistance;
        closestPlayer = player;
      }
    }

    return closestPlayer;
  }

  spawnPlayerBullets({
    x,
    y,
    angle,
    shotCount = 1,
    spreadAngle = 0.2,
    isSuper = false,
    ownerId = null,
  }) {
    const totalShots = Math.max(1, shotCount);
    const mid = (totalShots - 1) / 2;

    for (let i = 0; i < totalShots; i++) {
      const spreadOffset = (i - mid) * spreadAngle;
      const offsetX = Math.cos(angle) * 18;
      const offsetY = Math.sin(angle) * 18;
      const bullet = new Bullet(
        x + offsetX,
        y + offsetY,
        angle + spreadOffset,
        "player",
        this,
      );
      bullet.ownerId = ownerId || this.playerId;
      bullet.damage = isSuper ? 3 : 1;
      bullet.radius = isSuper ? 5 : 4;
      this.bullets.push(bullet);
    }
  }

  applyRemoteShot(payload) {
    this.spawnPlayerBullets(payload);
  }

  updateTimers(dt) {
    this.superBulletTimer = Math.max(0, this.superBulletTimer - dt);
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
  }

  /* =========================
     GAME LOOP
  ========================= */

  start() {
    this.loop();
  }

  loop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  };

  update() {
    this.time.update();
    const dt = this.time.deltaTime;

    if (!this.hasStarted || this.isGameOver) return;

    if (!this.isPaused) {
      if (this.mode === "multi") {
        this.updateMultiplayer(dt);
      } else {
        this.updateSingleplayer(dt);
      }
    }
  }

  /* =========================
     SINGLE PLAYER LOGIC
  ========================= */
  updateSingleplayer(dt) {
    this.input.clearPressed();

    this.player.update(this.input, dt);
    this.shootingSystem.update(this.input, dt);
    this.waveSystem.update(dt);

    this.bullets.forEach((b) => b.update(dt));
    this.enemies.forEach((e) => e.update(this.player, dt));
    this.particles.forEach((p) => p.update(dt));
    this.powerUps.forEach((p) => p.update(dt));

    this.collisionSystem.update();
    this.damageSystem.update(dt);

    this.updateTimers(dt);

    this.cleanup();
  }

  /* =========================
     MULTIPLAYER LOGIC
  ========================= */
  updateMultiplayer(dt) {
    this.input.clearPressed();

    // local player
    this.player.update(this.input, dt);
    this.shootingSystem.update(this.input, dt);

    // send to server
    if (this.network) {
      this.network.sendPlayerState({
        x: this.player.x,
        y: this.player.y,
        angle: this.player.facingAngle,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        color: this.player.color,
        kills: this.playerStats.kills,
        deaths: this.playerStats.deaths,
      });
    }

    this.bullets.forEach((b) => b.update(dt));
    this.particles.forEach((p) => p.update(dt));

    if (this.isHost) {
      this.enemies.forEach((enemy) => enemy.update(this.getAllPlayers(), dt));
      this.shootingSystem.updateEnemyShooting(dt);
      this.collisionSystem.update();
      this.damageSystem.update(dt);
    }

    if (!this.isHost) {
      this.collisionSystem.checkEnemyBulletPlayerCollision();
      this.collisionSystem.checkEnemyPlayerCollision();
      this.damageSystem.updatePlayerHealth();
    }

    this.updateTimers(dt);

    if (this.matchActive) {
      this.matchTimerRemaining = Math.max(0, this.matchTimerRemaining - dt);
      if (this.matchTimerRemaining <= 0 && this.isHost) {
        this.endMultiplayerMatch();
      }
    }

    this.cleanup();

    if (this.network && this.isHost) {
      this.network.sendWorldState({
        score: this.score,
        wave: this.waveSystem?.currentWave || 0,
        waveEnded: this.waveSystem?.waveEnded ?? true,
        selectedMapPreset: this.selectedMapPreset,
        matchTimerRemaining: this.matchTimerRemaining,
        roomName: this.getRoomDisplayName(),
        player: {
          x: this.player.x,
          y: this.player.y,
          angle: this.player.facingAngle,
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          color: this.player.color,
          kills: this.playerStats.kills,
          deaths: this.playerStats.deaths,
        },
        players: this.network?.players || this.remotePlayers,
        enemies: this.enemies.map((enemy) => ({
          x: enemy.x,
          y: enemy.y,
          type: enemy.type,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          facingAngle: enemy.facingAngle,
          shootCooldown: enemy.shootCooldown,
        })),
        bullets: this.bullets.map((bullet) => ({
          x: bullet.x,
          y: bullet.y,
          angle: bullet.angle,
          shooter: bullet.shooter,
          radius: bullet.radius,
          dead: bullet.dead,
          age: bullet.age,
          lifetime: bullet.lifetime,
          damage: bullet.damage,
        })),
        particles: this.particles.map((particle) => ({
          x: particle.x,
          y: particle.y,
          vx: particle.vx,
          vy: particle.vy,
          color: particle.color,
          lifetime: particle.lifetime,
          age: particle.age,
        })),
        powerUps: this.powerUps.map((powerUp) => ({
          x: powerUp.x,
          y: powerUp.y,
          type: powerUp.type,
          duration: powerUp.duration,
          radius: powerUp.radius,
          age: powerUp.age,
          lifetime: powerUp.lifetime,
        })),
      });
    }
  }

  applyWorldState(state) {
    if (!state) {
      return;
    }

    this.score = state.score ?? this.score;

    if (
      state.selectedMapPreset &&
      state.selectedMapPreset !== this.selectedMapPreset
    ) {
      this.selectedMapPreset = state.selectedMapPreset;
      this.map = new Map(this.width, this.height, this.selectedMapPreset);
    }

    if (state.player) {
      this.player.x = state.player.x;
      this.player.y = state.player.y;
      this.player.facingAngle = state.player.angle ?? this.player.facingAngle;
      this.player.hp = state.player.hp ?? this.player.hp;
      this.player.maxHp = state.player.maxHp ?? this.player.maxHp;
      this.playerStats.kills = state.player.kills ?? this.playerStats.kills;
      this.playerStats.deaths = state.player.deaths ?? this.playerStats.deaths;
      if (state.player.color) {
        this.player.color = state.player.color;
      }
    }

    const remotePlayers = state.players || {};
    this.remotePlayers = Object.fromEntries(
      Object.entries(remotePlayers).filter(([id]) => id !== this.playerId),
    );

    if (this.waveSystem) {
      this.waveSystem.currentWave = state.wave ?? this.waveSystem.currentWave;
      this.waveSystem.waveEnded = state.waveEnded ?? this.waveSystem.waveEnded;
    }

    if (state.matchTimerRemaining !== undefined) {
      this.matchTimerRemaining = state.matchTimerRemaining;
    }

    if (state.roomName) {
      this.roomSettings.roomName = state.roomName;
    }

    if (state.selectedMapPreset) {
      this.roomSettings.mapPreset = state.selectedMapPreset;
    }

    this.enemies = (state.enemies || []).map((enemyData) => {
      const enemy = new Enemy(enemyData.x, enemyData.y, enemyData.type, this);
      enemy.hp = enemyData.hp ?? enemy.hp;
      enemy.maxHp = enemyData.maxHp ?? enemy.maxHp;
      enemy.facingAngle = enemyData.facingAngle ?? enemy.facingAngle;
      enemy.shootCooldown = enemyData.shootCooldown ?? enemy.shootCooldown;
      return enemy;
    });

    this.bullets = (state.bullets || []).map((bulletData) => {
      const bullet = new Bullet(
        bulletData.x,
        bulletData.y,
        bulletData.angle,
        bulletData.shooter,
        this,
      );
      bullet.radius = bulletData.radius ?? bullet.radius;
      bullet.dead = Boolean(bulletData.dead);
      bullet.age = bulletData.age ?? bullet.age;
      bullet.lifetime = bulletData.lifetime ?? bullet.lifetime;
      bullet.damage = bulletData.damage ?? bullet.damage;
      return bullet;
    });

    this.particles = (state.particles || []).map((particleData) => {
      const particle = new Particle(
        particleData.x,
        particleData.y,
        particleData.vx,
        particleData.vy,
        particleData.color,
        particleData.lifetime,
      );
      particle.age = particleData.age ?? particle.age;
      return particle;
    });

    this.powerUps = (state.powerUps || []).map((powerUpData) => {
      const powerUp = new PowerUp(
        powerUpData.x,
        powerUpData.y,
        powerUpData.type,
        powerUpData.duration,
      );
      powerUp.radius = powerUpData.radius ?? powerUp.radius;
      powerUp.age = powerUpData.age ?? powerUp.age;
      powerUp.lifetime = powerUpData.lifetime ?? powerUp.lifetime;
      return powerUp;
    });
  }

  applyMatchResult(result) {
    this.matchResult = result;
    this.matchActive = false;
    this.hasStarted = false;
    this.isGameOver = true;
    this.overlay.show("matchEnd");
  }

  cleanup() {
    this.bullets = this.bullets.filter((b) => !b.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.particles = this.particles.filter((p) => !p.dead);
    this.powerUps = this.powerUps.filter((p) => !p.dead);
  }

  /* =========================
     DRAW
  ========================= */
  draw() {
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (this.map) this.map.draw(this.ctx);

    this.enemies.forEach((e) => e.draw(this.ctx));
    this.bullets.forEach((b) => b.draw(this.ctx));
    this.powerUps.forEach((p) => p.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
    this.player.draw(this.ctx);

    // DRAW REMOTE PLAYERS (MULTIPLAYER)
    if (this.mode === "multi") {
      for (const id in this.remotePlayers) {
        this.drawRemotePlayer(this.remotePlayers[id]);
      }
    }

    this.hud.draw(this.ctx);

    this.overlay.draw(this.ctx);

    if (this.menu.isOpen) {
      this.menu.draw(this.ctx);
    }
  }

  drawRemotePlayer(p) {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /* =========================
     HELPERS
  ========================= */

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  handleResize() {
    this.resizeCanvas();
  }

  restart() {
    const wasMultiplayer = this.mode === "multi";
    this.player = new Player(this.width / 2, this.height / 2, this);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerUps = [];
    this.score = 0;
    this.superBulletTimer = 0;
    this.shieldTimer = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.matchTimerRemaining = 0;
    this.matchActive = false;
    this.matchResult = null;
    this.playerStats = { kills: 0, deaths: 0 };
    this.overlay.hide();
    this.menu.close();

    if (this.waveSystem) {
      this.waveSystem.currentWave = 0;
      this.waveSystem.waveEnded = true;
    }

    if (this.mode === "single") {
      this.waveSystem = new WaveSystem(this);
      this.waveSystem.startWave();
      this.hasStarted = true;
      return;
    }

    if (wasMultiplayer && this.network?.isHost) {
      this.hasStarted = true;
    }
  }
}
