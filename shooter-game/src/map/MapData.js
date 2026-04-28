/**
 * MapData - procedural map generation
 */
import { randomChoice, random } from "../utils/random.js";

export default class MapData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tileMap = this.generateMap();
  }

  generateMap() {
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
    return tile && tile !== "water" && tile !== "lava";
  }
}
