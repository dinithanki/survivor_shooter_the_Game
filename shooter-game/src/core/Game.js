import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";

export default class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = 640;
    this.canvas.height = 480;

    this.keys = {};

    this.player = new Player(300, 220, this);
    this.enemies = [];
    this.bullets = [];

    this.score = 0;
    this.spawnTimer = 0;

    window.addEventListener(
      "keydown",
      (e) => (this.keys[e.key.toLowerCase()] = true),
    );
    window.addEventListener(
      "keyup",
      (e) => (this.keys[e.key.toLowerCase()] = false),
    );
  }

  start() {
    this.loop();
  }

  loop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  };

  update() {
    this.player.update(this.keys);

    // bullets
    this.bullets.forEach((b) => b.update());
    this.bullets = this.bullets.filter((b) => !b.dead);

    // enemies spawn
    this.spawnTimer++;
    if (this.spawnTimer > 100) {
      this.enemies.push(new Enemy(Math.random() * 640, Math.random() * 480));
      this.spawnTimer = 0;
    }

    // enemies update
    this.enemies.forEach((e) => e.update(this.player));

    // COLLISION (bullet -> enemy)
    this.bullets.forEach((b) => {
      this.enemies.forEach((e, ei) => {
        let dx = b.x - e.x;
        let dy = b.y - e.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          e.hp--;
          b.dead = true;

          if (e.hp <= 0) {
            this.enemies.splice(ei, 1);
            this.score += 10;
          }
        }
      });
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, 640, 480);

    // player
    this.player.draw(this.ctx);

    // bullets
    this.bullets.forEach((b) => b.draw(this.ctx));

    // enemies
    this.enemies.forEach((e) => e.draw(this.ctx));

    // score
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Score: " + this.score, 10, 20);
  }
}
