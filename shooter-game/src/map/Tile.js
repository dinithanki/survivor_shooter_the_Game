/**
 * Tile - individual map tile
 */
export default class Tile {
  constructor(x, y, type = "grass") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 40;
    this.color = this.getColor(type);
  }

  getColor(type) {
    const colors = {
      grass: "#2a5a2a",
      water: "#1a3a5a",
      stone: "#5a5a5a",
      lava: "#d94820",
      forest: "#1a3a1a",
    };
    return colors[type] || colors.grass;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);
  }
}
