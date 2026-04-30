# Shooter Game File Structure

This document maps the project folders and explains what each main file does.

## Project Tree

```text
shooter-game/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── QUICK_START.md
├── GAME_DEVELOPMENT_SUMMARY.md
├── FILE_STRUCTURE.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.js
    ├── style.css
    ├── counter.js
    ├── assets/
    │   ├── gaming.mp3
    │   ├── menu.mp3
    │   ├── hero.png
    │   ├── javascript.svg
    │   └── vite.svg
    ├── core/
    │   ├── AudioManager.js
    │   ├── Game.js
    │   ├── Input.js
    │   └── Time.js
    ├── entities/
    │   ├── Bullet.js
    │   ├── Enemy.js
    │   ├── Particle.js
    │   ├── Player.js
    │   └── PowerUp.js
    ├── map/
    │   ├── Map.js
    │   ├── MapData.js
    │   ├── MapPresets.js
    │   └── Tile.js
    ├── systems/
    │   ├── CollisionSystem.js
    │   ├── DamageSystem.js
    │   ├── ShootingSystem.js
    │   └── WaveSystem.js
    ├── styles/
    │   └── game.css
    ├── ui/
    │   ├── HUD.js
    │   ├── Menu.js
    │   └── Overlay.js
    └── utils/
        ├── collision.js
        ├── math.js
        └── random.js
```

## Root Files

### `index.html`

- Main browser entry point.
- Defines the game page, canvas, HUD containers, menu elements, controls, and audio unlock UI.
- Loads the Vite module entry at `src/main.js`.

### `package.json`

- Project metadata and npm scripts.
- Uses Vite for local development and production builds.

### `vite.config.js`

- Vite configuration.
- Sets the dev server port to `3000`.
- Enables source maps for builds.

### Documentation

- `README.md`: Full game overview, install steps, controls, and feature notes.
- `QUICK_START.md`: Short setup and play guide.
- `GAME_DEVELOPMENT_SUMMARY.md`: Development summary and feature checklist.
- `FILE_STRUCTURE.md`: This project map.

## Source Files

### `src/main.js`

- App bootstrap file.
- Connects DOM elements to the game.
- Handles loading screen, start flow, pause/restart buttons, and audio unlock behavior.

### `src/style.css`

- Base Vite/demo styling.
- Not the main game theme.

### `src/styles/game.css`

- Main game UI styling.
- Covers layout, canvas presentation, menus, HUD, overlays, controls, responsive states, and loading screen.

### `src/assets/`

- Game images and audio files.
- Includes background/menu music and hero artwork.

## Core Engine: `src/core/`

### `Game.js`

- Main game orchestrator.
- Owns canvas rendering, game state, entities, systems, update loop, draw loop, pause/resume, restart, and cleanup.

### `Input.js`

- Tracks keyboard and mouse state.
- Supports held keys and one-frame key press detection.

### `Time.js`

- Tracks delta time, elapsed time, and FPS.
- Keeps motion frame-rate independent.

### `AudioManager.js`

- Manages game audio.
- Handles menu music, gameplay music, sound effects, mute state, volume, and browser audio unlock.

## Entities: `src/entities/`

### `Player.js`

- Player movement, health, shooting state, aiming, drawing, and invulnerability feedback.

### `Enemy.js`

- Enemy AI, movement, health, drawing, enemy type stats, and score values.

### `Bullet.js`

- Projectile movement, lifespan, damage, trail effects, and rendering.

### `Particle.js`

- Short-lived visual effects for impacts, explosions, and feedback.

### `PowerUp.js`

- Collectible power-up entity.
- Stores type, position, radius, lifetime, and visual pulse state.

## Systems: `src/systems/`

### `CollisionSystem.js`

- Handles bullet/enemy, player/enemy, player/power-up, and player/map collisions.
- Applies scoring, particles, knockback, damage, and pickups.

### `ShootingSystem.js`

- Creates bullets from player input.
- Handles cooldowns and burst-style firing support.

### `WaveSystem.js`

- Controls enemy waves.
- Spawns enemies, scales difficulty, and advances wave progression.

### `DamageSystem.js`

- Shared health and damage helpers.
- Applies damage, healing, death checks, and game-over checks.

## Map System: `src/map/`

### `Map.js`

- Tile map renderer and collision helper.
- Uses map data to create and draw tiles.
- Provides walkability checks for entities.

### `MapData.js`

- Main map data and procedural layout source.
- Defines tile types, visual colors, gameplay rules, named maps, and random generation helpers.

### `MapPresets.js`

- Exports a list of named map presets available to the game.

### `Tile.js`

- Represents one map tile.
- Draws tile visuals based on type, position, and size.

## UI: `src/ui/`

### `HUD.js`

- Draws live player stats and game stats.
- Shows score, health, wave, enemy count, FPS, weapon, and power-up status.

### `Menu.js`

- Menu navigation and rendering.
- Supports keyboard-driven menu selection.

### `Overlay.js`

- Pause and game-over overlays.
- Draws summary stats and restart prompts.

## Utilities: `src/utils/`

### `math.js`

- Distance, angle, clamp, lerp, normalization, and dot product helpers.

### `collision.js`

- Circle, rectangle, and point collision helpers.

### `random.js`

- Random number, random integer, random array item, random boolean, and random vector helpers.

## Generated / Installed Folders

### `dist/`

- Production build output generated by Vite.
- Can be regenerated with `npm run build`.

### `node_modules/`

- Installed npm dependencies.
- Can be recreated with `npm install`.

## Current File Counts

- JavaScript source files: 25
- CSS source files: 2
- HTML files: 1
- Public assets: 2
- Game assets: 5
- Documentation files: 4
- Config/package files: 3

## Architecture Overview

```text
src/main.js
└── core/Game.js
    ├── core/Input.js
    ├── core/Time.js
    ├── core/AudioManager.js
    ├── entities/
    │   ├── Player.js
    │   ├── Enemy.js
    │   ├── Bullet.js
    │   ├── Particle.js
    │   └── PowerUp.js
    ├── systems/
    │   ├── CollisionSystem.js
    │   ├── DamageSystem.js
    │   ├── ShootingSystem.js
    │   └── WaveSystem.js
    ├── map/
    │   ├── Map.js
    │   ├── MapData.js
    │   ├── MapPresets.js
    │   └── Tile.js
    ├── ui/
    │   ├── HUD.js
    │   ├── Menu.js
    │   └── Overlay.js
    └── utils/
        ├── collision.js
        ├── math.js
        └── random.js
```

## Game Loop Flow

```text
Browser loads index.html
    ↓
src/main.js initializes DOM, canvas, audio, and Game
    ↓
Game.start() begins the loop
    ↓
Update phase
    ├── Time update
    ├── Input handling
    ├── Player update
    ├── Shooting update
    ├── Wave/enemy update
    ├── Bullet and particle update
    ├── Collision checks
    ├── Damage and pickup handling
    └── Entity cleanup
    ↓
Draw phase
    ├── Clear canvas
    ├── Draw map/background
    ├── Draw entities
    ├── Draw HUD
    └── Draw overlays/menus
```
