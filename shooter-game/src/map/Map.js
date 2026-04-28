/**
 * Map - map renderer and tile management
 */
import Tile from "./Tile.js";
import MapData from "./MapData.js";

export default class Map {
  constructor(width = 1280, height = 960, preset = "default") {
    this.width = width;
    this.height = height;
    this.tileSize = 40;
    this.preset = preset;

    // Generate map
    const tilesX = Math.ceil(width / this.tileSize);
    const tilesY = Math.ceil(height / this.tileSize);
    this.mapData = new MapData(tilesX, tilesY, preset);

    // Create tiles
    this.tiles = [];
    for (let y = 0; y < tilesY; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < tilesX; x++) {
        const type = this.mapData.getTile(x, y);
        this.tiles[y][x] = new Tile(x, y, type);
      }
    }
  }

  draw(ctx) {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        this.tiles[y][x].draw(ctx);
      }
    }
  }

  update(dt) {
    // Map updates (animations, etc)
  }

  isWalkable(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    return this.mapData.isWalkable(tileX, tileY);
  }

  getWalkableTileCenters() {
    const centers = [];

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.mapData.isWalkable(x, y)) {
          centers.push({
            x: x * this.tileSize + this.tileSize / 2,
            y: y * this.tileSize + this.tileSize / 2,
          });
        }
      }
    }

    return centers;
  }
}
