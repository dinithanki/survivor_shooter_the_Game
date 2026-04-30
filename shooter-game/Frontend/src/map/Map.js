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

  isRectWalkable(centerX, centerY, width, height) {
    const left = centerX - width / 2;
    const right = centerX + width / 2;
    const top = centerY - height / 2;
    const bottom = centerY + height / 2;

    const minTileX = Math.floor(left / this.tileSize);
    const maxTileX = Math.floor((right - 1) / this.tileSize);
    const minTileY = Math.floor(top / this.tileSize);
    const maxTileY = Math.floor((bottom - 1) / this.tileSize);

    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        if (!this.mapData.isWalkable(tileX, tileY)) {
          return false;
        }
      }
    }

    return true;
  }

  isCircleWalkable(centerX, centerY, radius) {
    const minTileX = Math.floor((centerX - radius) / this.tileSize);
    const maxTileX = Math.floor((centerX + radius) / this.tileSize);
    const minTileY = Math.floor((centerY - radius) / this.tileSize);
    const maxTileY = Math.floor((centerY + radius) / this.tileSize);

    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        if (!this.mapData.isWalkable(tileX, tileY)) {
          return false;
        }
      }
    }

    return true;
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
