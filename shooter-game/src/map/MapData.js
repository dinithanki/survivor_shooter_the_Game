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
    const addBorder = (map) => {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (
            x === 0 ||
            y === 0 ||
            x === this.width - 1 ||
            y === this.height - 1
          ) {
            map[y][x] = "stone";
          }
        }
      }
    };

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
      addBorder(map);
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
      addBorder(map);
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

      const carveArea = (centerX, centerY, radius) => {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          for (let x = centerX - radius; x <= centerX + radius; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
              map[y][x] = "grass";
            }
          }
        }
      };

      const carveLine = (x1, y1, x2, y2, thickness = 1) => {
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let step = 0; step <= steps; step++) {
          const t = steps === 0 ? 0 : step / steps;
          const x = Math.round(x1 + (x2 - x1) * t);
          const y = Math.round(y1 + (y2 - y1) * t);
          carveArea(x, y, thickness);
        }
      };

      const isWalkable = (x, y) => {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
          return false;
        }
        return (
          map[y][x] !== "water" && map[y][x] !== "lava" && map[y][x] !== "stone"
        );
      };

      const getReachableTiles = () => {
        const queue = [[cx, cy]];
        const visited = new Set([`${cx},${cy}`]);

        while (queue.length > 0) {
          const [x, y] = queue.shift();
          const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
          ];

          for (const [nextX, nextY] of neighbors) {
            const key = `${nextX},${nextY}`;
            if (!visited.has(key) && isWalkable(nextX, nextY)) {
              visited.add(key);
              queue.push([nextX, nextY]);
            }
          }
        }

        return visited;
      };

      const connectToMainArea = () => {
        let reachable = getReachableTiles();

        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            if (!isWalkable(x, y) || reachable.has(`${x},${y}`)) {
              continue;
            }

            let nearestX = cx;
            let nearestY = cy;
            let nearestDistance = Infinity;

            for (const entry of reachable) {
              const [reachableX, reachableY] = entry.split(",").map(Number);
              const distance =
                Math.abs(reachableX - x) + Math.abs(reachableY - y);
              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestX = reachableX;
                nearestY = reachableY;
              }
            }

            carveLine(x, y, nearestX, nearestY, 1);
            reachable = getReachableTiles();
          }
        }
      };

      carveArea(cx, cy, 3);
      carveLine(1, cy, this.width - 2, cy, 1);
      carveLine(cx, 1, cx, this.height - 2, 1);
      carveLine(1, 1, this.width - 2, this.height - 2, 1);
      carveLine(this.width - 2, 1, 1, this.height - 2, 1);
      connectToMainArea();
      addBorder(map);
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
      addBorder(map);
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
      addBorder(map);
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

    addBorder(map);

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
