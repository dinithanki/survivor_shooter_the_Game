/**
 * MapData - procedural map generation
 */
import { randomChoice, random } from "../utils/random.js";

export default class MapData {
  constructor(width, height, preset = "default") {
    this.width = width;
    this.height = height;
    this.preset = preset;
    this.tileMap = this.generateMap(preset);
  }

  generateMap(preset = "default") {
    // Preset: Cross pattern
    if (preset === "cross") {
      const map = [];
      for (let y = 0; y < this.height; y++) {
        map[y] = [];
        for (let x = 0; x < this.width; x++) {
          if (
            x === 0 ||
            y === 0 ||
            x === this.width - 1 ||
            y === this.height - 1
          ) {
            map[y][x] = "stone";
          } else if (
            x === Math.floor(this.width / 2) ||
            y === Math.floor(this.height / 2)
          ) {
            map[y][x] = "stone";
          } else {
            map[y][x] = "grass";
          }
        }
      }
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            map[y][x] = "grass";
          }
        }
      }
      return map;
    }

    // Preset: Maze pattern
    if (preset === "maze") {
      const map = [];
      for (let y = 0; y < this.height; y++) {
        map[y] = [];
        for (let x = 0; x < this.width; x++) {
          if ((x % 4 === 0 && y % 2 === 0) || (y % 4 === 0 && x % 2 === 0)) {
            map[y][x] = "stone";
          } else {
            map[y][x] = "grass";
          }
        }
      }
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = cy - 3; y <= cy + 3; y++) {
        for (let x = cx - 3; x <= cx + 3; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            map[y][x] = "grass";
          }
        }
      }
      return map;
    }

    // Preset: Diamond pattern
    if (preset === "diamond") {
      const map = [];
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = 0; y < this.height; y++) {
        map[y] = [];
        for (let x = 0; x < this.width; x++) {
          if (
            x === 0 ||
            y === 0 ||
            x === this.width - 1 ||
            y === this.height - 1
          ) {
            map[y][x] = "stone";
          } else {
            const dist = Math.abs(x - cx) + Math.abs(y - cy);
            if (dist % 5 === 0 && dist > 0 && dist < Math.max(cx, cy) * 0.7) {
              map[y][x] = "stone";
            } else {
              map[y][x] = "grass";
            }
          }
        }
      }
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            map[y][x] = "grass";
          }
        }
      }
      return map;
    }

    // Preset: Grid pattern
    if (preset === "grid") {
      const map = [];
      for (let y = 0; y < this.height; y++) {
        map[y] = [];
        for (let x = 0; x < this.width; x++) {
          if (
            x === 0 ||
            y === 0 ||
            x === this.width - 1 ||
            y === this.height - 1
          ) {
            map[y][x] = "stone";
          } else if (
            (x % 6 === 3 && y % 3 === 0) ||
            (y % 6 === 3 && x % 3 === 0)
          ) {
            map[y][x] = "stone";
          } else {
            map[y][x] = "grass";
          }
        }
      }
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            map[y][x] = "grass";
          }
        }
      }
      return map;
    }

    // Preset: Spiral pattern
    if (preset === "spiral") {
      const map = [];
      const cx = Math.floor(this.width / 2);
      const cy = Math.floor(this.height / 2);
      for (let y = 0; y < this.height; y++) {
        map[y] = [];
        for (let x = 0; x < this.width; x++) {
          if (
            x === 0 ||
            y === 0 ||
            x === this.width - 1 ||
            y === this.height - 1
          ) {
            map[y][x] = "stone";
          } else {
            const dx = x - cx;
            const dy = y - cy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(((angle * 3 + dist * 0.3) % 6) - 3) < 0.8) {
              map[y][x] = "stone";
            } else {
              map[y][x] = "grass";
            }
          }
        }
      }
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            map[y][x] = "grass";
          }
        }
      }
      return map;
    }

    // default: random generation
    const map = [];
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        const rand = Math.random();
        let type = "grass";

        if (rand < 0.15) {
          type = "water";
        } else if (rand < 0.3) {
          type = "stone";
        } else if (rand < 0.05) {
          type = "forest";
        }

        map[y][x] = type;
      }
    }

    // Ensure center area is clear
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    for (let y = centerY - 3; y < centerY + 3; y++) {
      for (let x = centerX - 3; x < centerX + 3; x++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          map[y][x] = "grass";
        }
      }
    }

    return map;
  }

  getTile(x, y) {
    if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
      return this.tileMap[y][x];
    }
    return null;
  }

  isWalkable(x, y) {
    const tile = this.getTile(x, y);
    return tile && tile !== "water" && tile !== "lava" && tile !== "stone";
  }
}
