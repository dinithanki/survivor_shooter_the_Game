/**
 * Particle entity - visual effects (explosions, hits)
 */
export default class Particle {
  constructor(x, y, vx, vy, color = "white", lifetime = 0.5) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.age = 0;
    this.radius = 3;
    this.dead = false;
    this.friction = 0.95;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.age += dt;

    if (this.age > this.lifetime) {
      this.dead = true;
    }
  }

  draw(ctx) {
    // Fade out particles
    const alpha = 1 - this.age / this.lifetime;
    ctx.fillStyle = this.color.replace(")", `, ${alpha})`);
    if (!this.color.includes("rgba")) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  static createExplosion(x, y, count = 12) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 200 + Math.random() * 100;
      particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          `rgba(255, ${Math.random() * 100 + 155}, 0)`,
          0.8,
        ),
      );
    }
    return particles;
  }
}
