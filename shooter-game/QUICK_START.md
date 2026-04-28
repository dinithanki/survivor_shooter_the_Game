# 🚀 Quick Start Guide

## Installation & Running

### 1. Install Dependencies

```bash
cd /Users/dinithankitha/Desktop/Game/shooter-game
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Opens automatically at `http://localhost:3000`

### 3. Or Build & Preview for Production

```bash
npm run build
npm run preview
```

## How to Play

### Objective

Survive as many waves as possible by defeating enemies. Each wave gets harder!

### Controls

| Input       | Action                |
| ----------- | --------------------- |
| **W/A/S/D** | Move around the arena |
| **SPACE**   | Shoot (continuous)    |
| **P**       | Pause/Resume          |
| **R**       | Restart game          |
| **M**       | Open menu             |

### Game Mechanics

**Health System**

- Start with 100 HP
- Health bar turns red when critical (<30%)
- Get hit by enemies to take damage
- Become invulnerable for 2 seconds after being hit (flash effect)

**Shooting**

- Hold SPACE to shoot continuously
- Bullets travel upward
- Each bullet kills one enemy or damages it

**Enemies**
| Type | Color | Speed | HP | Points |
|------|-------|-------|----|----|
| Basic | Red | Medium | 3 | 10 |
| Fast | Orange | Fast | 1 | 15 |
| Tank | Dark Red | Slow | 5 | 25 |

**Waves**

- New enemy types appear each wave
- Spawn rate increases each wave
- Health bars appear on damaged enemies
- Enemies explode into particles when defeated

### Difficulty Progression

**Early Waves (1-2)**

- Only basic red enemies
- Manageable spawn rate
- Perfect for learning

**Mid Waves (3-6)**

- Fast orange enemies appear
- Increased spawn rate
- Need to aim carefully

**Late Waves (7+)**

- Tank enemies appear
- Very fast spawning
- Requires skill and strategy

## Strategy Tips

1. **Keep Moving** - Don't stay in one place
2. **Manage Corners** - Enemies spawn from edges, patrol corners
3. **Watch Your Health** - The red health bar warns you of danger
4. **Multi-target** - Enemies move in groups, aim carefully
5. **Use Invulnerability** - After taking damage, you have 2 seconds to escape
6. **Stay Centered** - More space to dodge near the middle

## Game States

### Playing

- Actively fighting enemies
- Health bar shows real-time damage
- Score accumulates with each kill

### Paused

- Press P to pause
- Game freezes
- Can resume with P

### Game Over

- Player HP reaches 0
- Shows final score and wave reached
- Press R to restart
- Can immediately try again

## Display Information

### Top HUD (Left to Right)

- **HP Bar**: Current health (green→yellow→red)
- **Health Numbers**: Current/Max HP
- **Wave Counter**: Current wave and enemy count
- **Score**: Total points earned

### Bottom Display

- **FPS**: Frames per second (60+ is smooth)
- **Controls**: Reference for key bindings

## Files & Code Structure

All game code is in `/src/` organized by responsibility:

- **core/** - Game engine (loop, input, timing)
- **entities/** - Game objects (player, enemies, bullets, particles)
- **systems/** - Game logic (collision, shooting, waves, damage)
- **map/** - Map system (tiles, procedural generation)
- **ui/** - User interface (HUD, overlays, menu)
- **utils/** - Helper functions (math, collision detection)

## Performance Tips

- Game targets 60+ FPS
- Works best on Chrome, Firefox, Safari
- No lag or stuttering expected
- Smooth delta-time based movement

## Troubleshooting

**Game won't start?**

- Check that `npm install` completed
- Ensure port 3000 is not in use
- Clear browser cache with Ctrl+Shift+R

**Enemies not appearing?**

- Wait a moment, they spawn from edges
- Check that enemies count > 0 in HUD
- They take time to reach center

**Shooting not working?**

- Hold SPACE bar longer
- Check that cursor is in game window
- Try refreshing the page

**Performance lag?**

- Check FPS counter (bottom left)
- Close other browser tabs
- Try full-screen mode

## Advanced Control Techniques

**Rapid Movement**

- Hold two direction keys for diagonal movement
- Movement normalized so diagonals aren't faster

**Efficient Shooting**

- Hold SPACE continuously
- Gun has built-in cooldown (0.1 seconds)
- Ammo is unlimited

**Defensive Positioning**

- Stay away from edges where enemies spawn
- Use the center area for maneuvering
- Watch all four directions

## Game Over Results

After death, you'll see:

- **Final Score** - Total points earned
- **Wave Reached** - Highest wave survived
- **Restart Prompt** - Press R to try again

## Next Steps

1. Play the game!
2. Try to beat your high score
3. Reach Wave 10
4. Defeat 100 enemies
5. Explore the code and customize

## Customization Ideas

Want to modify the game? Here are easy changes:

**Change Player Speed:**
Edit `src/entities/Player.js`, line 13:

```javascript
this.speed = 300; // Change this number
```

**Change Enemy Speed:**
Edit `src/entities/Enemy.js`, line 30-35:

```javascript
case "basic":
  this.speed = 120; // Change this
```

**Change Shoot Rate:**
Edit `src/entities/Player.js`, line 15:

```javascript
this.shootRate = 0.1; // Lower = faster shooting
```

**Change Colors:**
Edit the `draw()` methods in entity files:

```javascript
ctx.fillStyle = "cyan"; // Change to any color
```

## Have Fun! 🎮

The game is complete and playable. Enjoy the challenge!
