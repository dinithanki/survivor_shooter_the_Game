# Survivor Shooter Game

A fast-paced 2D shooter game built with vanilla JavaScript and Canvas API, featuring wave-based enemy spawning, particle effects, and progressive difficulty.

## Features

- **Wave System**: Progressive waves with increasing difficulty
- **Enemy Types**: Multiple enemy types with different stats (basic, fast, tank)
- **Particle Effects**: Explosions and hit effects
- **Health System**: Player health with invulnerability frames
- **Score Tracking**: Earn points by defeating enemies
- **HUD**: Real-time display of health, score, wave count, and FPS
- **Game States**: Pause, Game Over, and Menu
- **Collision Detection**: Accurate bullet-enemy and enemy-player collision

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Navigate to the project directory:

```bash
cd shooter-game
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The game will open automatically in your default browser at `http://localhost:3000`.

## Controls

| Key               | Action          |
| ----------------- | --------------- |
| **W / A / S / D** | Move character  |
| **SPACE**         | Shoot           |
| **P**             | Pause/Resume    |
| **R**             | Restart Game    |
| **M**             | Open Menu       |
| **↑ / ↓**         | Menu Navigation |
| **ENTER**         | Menu Selection  |

## Game Mechanics

### Waves

- Each wave spawns progressively more challenging enemies
- Wave ends when all enemies are defeated
- Difficulty increases: new enemy types appear in later waves

### Enemy Types

1. **Basic** (Red circles)
   - Speed: Medium
   - Health: 3 HP
   - Points: 10

2. **Fast** (Orange circles)
   - Speed: High
   - Health: 1 HP
   - Points: 15

3. **Tank** (Dark Red circles)
   - Speed: Slow
   - Health: 5 HP
   - Points: 25

### Player Mechanics

- **Health**: 100 HP
- **Shoot Cooldown**: 0.1 seconds between shots
- **Invulnerability**: 2 seconds after taking damage
- **Speed**: 300 pixels/second

## Project Structure

```
shooter-game/
├── index.html              # Main HTML file
├── package.json            # Project dependencies
├── vite.config.js          # Vite configuration
│
├── public/                 # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
│
└── src/
    ├── main.js             # Entry point
    │
    ├── core/               # Game engine
    │   ├── Game.js         # Main game loop
    │   ├── Input.js        # Input handling
    │   └── Time.js         # Delta time management
    │
    ├── entities/           # Game objects
    │   ├── Player.js
    │   ├── Enemy.js
    │   ├── Bullet.js
    │   └── Particle.js
    │
    ├── systems/            # Game logic
    │   ├── CollisionSystem.js
    │   ├── ShootingSystem.js
    │   ├── WaveSystem.js
    │   └── DamageSystem.js
    │
    ├── map/                # Map system
    │   ├── Map.js
    │   ├── MapData.js
    │   └── Tile.js
    │
    ├── ui/                 # User interface
    │   ├── HUD.js          # Heads-up display
    │   ├── Overlay.js      # Game over/pause screens
    │   └── Menu.js         # Main menu
    │
    ├── utils/              # Helper functions
    │   ├── math.js         # Math utilities
    │   ├── collision.js    # Collision detection
    │   ├── random.js       # Random number generation
    │   └── assets.js       # Asset management
    │
    └── styles/
        └── game.css        # Game styling
```

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Development

### Preview Production Build

```bash
npm run preview
```

## Game Design

### Progressive Difficulty

- **Wave 1-2**: Basic enemies only
- **Wave 3-6**: Mix of basic and fast enemies
- **Wave 7+**: All enemy types appear

### Scoring

- Basic Enemy: 10 points
- Fast Enemy: 15 points
- Tank Enemy: 25 points
- Bonus: Extra points for consecutive kills

### Difficulty Scaling

- Enemy spawn rate increases each wave
- Health cap increases at wave 5, 10, 15
- New enemy types introduced progressively

## Detailed Game Mechanics & Implementation

This section explains how the main gameplay systems work and where to find the implementation in the codebase.

### Scoring (current behavior)

- Where: [src/systems/CollisionSystem.js](src/systems/CollisionSystem.js#L1)
- When an enemy dies its `points` value is added directly to `game.score`.
- Enemy `points` are set per type in [src/entities/Enemy.js](src/entities/Enemy.js#L1) (`basic`=10, `fast`=15, `tank`=25).

Notes and recommended extension:

- Currently scoring is static (base points). To add multipliers (combo, difficulty, wave bonuses) add a wrapper like `game.addScore(points, meta)` and call it from `checkBulletEnemyCollision()`.

Example (concept):

- finalPoints = basePoints _ (1 + combo _ 0.1) \* difficultyMultiplier

### Wave & Spawn Logic

- Where: [src/systems/WaveSystem.js](src/systems/WaveSystem.js#L1)
- Waves track `currentWave`, `waveTimer`, `spawnTimer`, and `waveDuration`.
- First wave starts immediately. After a wave ends there is a 5s break.
- Spawn rate formula: `spawnRate = Math.max(0.3, 1.5 - currentWave * 0.1)` (lower is faster spawns).
- Spawn location: randomly chosen edge (top/right/bottom/left) and just outside the canvas.
- Enemy type selection uses `currentWave` thresholds and random chance to pick `basic`, `fast`, or `tank`.

Tuning knobs:

- `waveDuration` — how long a wave runs before being eligible to end.
- Spawn formula — adjust to increase/decrease intensity per wave.
- Type probabilities — change thresholds for `fast`/`tank` appearance.

### Enemy Types & Stats

- Implementation: [src/entities/Enemy.js](src/entities/Enemy.js#L1)
- Stats per type (current):
  - `basic`: speed ~120, hp 3, radius 10, points 10, shoots every ~1.2s
  - `fast`: speed ~200, hp 1, radius 8, points 15, shoots every ~1.5s
  - `tank`: speed ~80, hp 5, radius 15, points 25, shoots every ~0.8s
- Behavior: enemies move toward the player each frame and update `facingAngle` so they point at the player.

### Shooting & Bullets

- Player: [src/entities/Player.js](src/entities/Player.js#L1)
  - `shootRate` controls firing cadence (default 0.1s).
  - `Player.shoot()` spawns a `Bullet` at the player's nose using `facingAngle`.
- Enemy: [src/entities/Enemy.js](src/entities/Enemy.js#L1) + [src/systems/ShootingSystem.js](src/systems/ShootingSystem.js#L1)
  - Enemies have `shootRate`, `shootRange`, and a randomized `shootCooldown` so they don't fire in lock-step.
  - `ShootingSystem.updateEnemyShooting()` checks distance to player and calls `enemy.shoot()` when able.
- Bullets: [src/entities/Bullet.js](src/entities/Bullet.js#L1)
  - Fields: `x,y,angle,speed(500),radius(4),lifetime(5s),shooter` ("player"|"enemy").
  - Update moves bullet by angle \* speed; bullet is marked `dead` after lifetime or on collisions.

### Collision & Damage

- File: [src/systems/CollisionSystem.js](src/systems/CollisionSystem.js#L1)
- Bullet → Enemy:
  - `checkBulletEnemyCollision()` detects circle collisions between bullets and enemies (uses `circleCollides`).
  - On hit: `enemy.takeDamage(1)` and `bullet.dead = true`.
  - If `enemy.dead`, currently `game.score += enemy.points` and enemy is removed.
- Enemy Bullet → Player:
  - `checkEnemyBulletPlayerCollision()` checks bullets where `shooter === "enemy"` and calls `player.takeDamage(5)`.
- Enemy → Player collision:
  - `checkEnemyPlayerCollision()` performs circle collision between enemy and player and deals 10 damage on contact.

Where to change damage values:

- Modify numeric literals in `CollisionSystem` or extend `Enemy`/`Player` to expose configurable damage fields.

### HUD & UI

- File: [src/ui/HUD.js](src/ui/HUD.js#L1)
- Shows: Health bar, Score, Wave info, FPS (and enhanced panels if present).
- UI draws directly to the canvas; to change visuals edit the HUD draw methods (`drawHealth`, `drawScore`, `drawWave`, etc.).

### Tuning Guide (quick)

- To increase difficulty: decrease `spawnRate` formula, increase `waveDuration`, raise `tank` and `fast` spawn probabilities.
- To reward the player: increase `points` in `Enemy.setTypeStats()` or implement combo/bonus scoring.
- To adjust feel: tweak `Player.speed`, `Player.shootRate`, `Bullet.speed`, `Enemy.speed` in their entity files.

### Suggested Improvements (implementation hints)

- Centralize scoring: add `game.addScore(points, {type})` in `Game.js` to handle multipliers and HUD animations.
- Combo system: track `game.combo`, `game.lastKillTime`, reset combo after a timeout in `Game.update()`; multiply score in `CollisionSystem`.
- Wave UI: show a transition and level summary (already present in enhanced HUD version — see `drawWaveTransition`).
- Persistent high scores: save to `localStorage` on game over and display leaderboard in the menu.
- Audio: add SFX for shoot/hit/explosion using HTML5 Audio or WebAudio API.

---

## Performance Notes

## Performance Notes

- Canvas rendering optimized for 60 FPS
- Object pooling for bullets and particles
- Efficient collision detection using spatial partitioning
- Map rendering disabled by default (can be enabled)

## Future Enhancements

- [ ] Sound effects and background music
- [ ] Power-ups (rapid fire, shields, etc.)
- [ ] Boss enemies
- [ ] Multiple weapons
- [ ] Leaderboard/High scores
- [ ] Mobile touch controls
- [ ] Different game modes
- [ ] Procedural map generation with obstacles

## Credits

Built with vanilla JavaScript, Canvas API, and Vite.

## License

MIT License - feel free to use this for learning purposes!
