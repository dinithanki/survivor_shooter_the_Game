/**
 * Power-up collectible ball
 */
export default class PowerUp {
  constructor(x, y, type = "super", duration = 8) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.duration = duration;
    this.radius = 8;
    this.dead = false;
    this.age = 0;
    this.lifetime = 15;
  }

  update(dt) {
    this.age += dt;
    if (this.age >= this.lifetime) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const isSuper = this.type === "super";
    ctx.save();

    ctx.fillStyle = isSuper
      ? "rgba(255, 215, 0, 0.9)"
      : "rgba(80, 200, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isSuper
      ? "rgba(255, 255, 120, 0.9)"
      : "rgba(180, 245, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isSuper ? "B" : "S", this.x, this.y + 0.5);

    ctx.restore();
  }
}
