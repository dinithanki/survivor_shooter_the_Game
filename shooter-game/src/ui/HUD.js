/**
 * HUD — Premium in-canvas Heads-Up Display
 */
export default class HUD {
  constructor(game) {
    this.game = game;

    // Wave banner
    this.levelUpMessage = null;
    this.levelUpTimer   = 0;
    this.levelUpDuration = 2.2;
    this.lastWave       = 0;

    // FPS smoothing
    this._fpsHistory = [];
    this._fpsSmooth  = 60;
  }

  /* ── Main draw entry ──────────────────────────────────── */
  draw(ctx) {
    this._updateLevelUp();
    this._drawHealthBar(ctx);
    this._drawWaveInfo(ctx);
    this._drawScoreBox(ctx);
    this._drawPowerUps(ctx);
    this._drawWaveBanner(ctx);
    this._drawFPS(ctx);
  }

  /* ── Wave tracking ────────────────────────────────────── */
  _updateLevelUp() {
    const wave = this.game.waveSystem.currentWave;
    if (wave > this.lastWave && wave > 1) {
      this.levelUpMessage = `WAVE ${wave}`;
      this.levelUpTimer   = 0;
      this.lastWave       = wave;
    }
    if (this.levelUpMessage) {
      this.levelUpTimer += this.game.time.deltaTime;
      if (this.levelUpTimer > this.levelUpDuration) this.levelUpMessage = null;
    }
  }

  /* ── Health Bar ───────────────────────────────────────── */
  _drawHealthBar(ctx) {
    const player  = this.game.player;
    const pct     = Math.max(0, Math.min(1, player.hp / player.maxHp));
    const BAR_W   = 180;
    const BAR_H   = 14;
    const x       = 16;
    const y       = 18;

    ctx.save();

    // Label
    ctx.font         = "bold 11px 'Rajdhani', Arial";
    ctx.fillStyle    = "rgba(100,200,255,0.75)";
    ctx.textAlign    = "left";
    ctx.letterSpacing = "2px";
    ctx.fillText("HP", x, y + 11);

    const bx = x + 30;

    // Track
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    _roundRect(ctx, bx, y, BAR_W, BAR_H, 7, true, false);

    // Fill — colour shifts with health
    const fillColor = pct > 0.55
      ? `hsl(${140 + (1 - pct) * 30}, 90%, 52%)`
      : pct > 0.25
      ? `hsl(${30 + pct * 60}, 95%, 55%)`
      : "#ff3d5a";
    ctx.fillStyle = fillColor;
    _roundRect(ctx, bx, y, BAR_W * pct, BAR_H, 7, true, false);

    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    _roundRect(ctx, bx, y, BAR_W * pct, BAR_H / 2, 5, true, false);

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth   = 1;
    _roundRect(ctx, bx, y, BAR_W, BAR_H, 7, false, true);

    // Text %
    const label = Math.ceil(pct * 100) + "%";
    ctx.font      = "bold 11px 'Orbitron', Arial";
    ctx.fillStyle = pct > 0.3 ? "#e8ffee" : "#ffb0b0";
    ctx.textAlign = "left";
    ctx.fillText(label, bx + BAR_W + 8, y + 11);

    ctx.restore();
  }

  /* ── Wave Info (centre-top) ───────────────────────────── */
  _drawWaveInfo(ctx) {
    const info = this.game.waveSystem.getWaveInfo();
    const cx   = this.game.width / 2;
    const y    = 18;

    ctx.save();
    ctx.textAlign = "center";

    // Pill background
    const text   = `WAVE ${info.wave}   ·   ${info.enemyCount} ENEMIES`;
    ctx.font     = "bold 11px 'Rajdhani', Arial";
    const tw     = ctx.measureText(text).width;
    const pw     = tw + 32;
    const ph     = 24;
    const px     = cx - pw / 2;
    const py     = y - 2;

    ctx.fillStyle = "rgba(0,0,0,0.52)";
    _roundRect(ctx, px, py, pw, ph, 12, true, false);
    ctx.strokeStyle = "rgba(0,212,255,0.28)";
    ctx.lineWidth   = 1;
    _roundRect(ctx, px, py, pw, ph, 12, false, true);

    ctx.fillStyle = "rgba(190,240,255,0.9)";
    ctx.fillText(text, cx, y + 14);

    ctx.restore();
  }

  /* ── Score Box (top-right) ────────────────────────────── */
  _drawScoreBox(ctx) {
    const score = this.game.score;
    const rx    = this.game.width - 16;
    const y     = 18;

    ctx.save();
    ctx.textAlign = "right";

    // Box
    const label  = String(score).padStart(6, "0");
    ctx.font     = "bold 13px 'Orbitron', Arial";
    const tw     = ctx.measureText(label).width;
    const bw     = tw + 60;
    const bh     = 28;

    ctx.fillStyle = "rgba(0,0,0,0.50)";
    _roundRect(ctx, rx - bw, y - 4, bw, bh, 10, true, false);
    ctx.strokeStyle = "rgba(0,212,255,0.22)";
    ctx.lineWidth   = 1;
    _roundRect(ctx, rx - bw, y - 4, bw, bh, 10, false, true);

    // "SCORE" label
    ctx.font      = "600 9px 'Rajdhani', Arial";
    ctx.fillStyle = "rgba(100,200,255,0.65)";
    ctx.textAlign = "left";
    ctx.fillText("SCORE", rx - bw + 10, y + 10);

    // Value
    ctx.font      = "bold 13px 'Orbitron', Arial";
    ctx.fillStyle = "#00d4ff";
    ctx.textAlign = "right";
    ctx.fillText(label, rx - 10, y + 18);

    ctx.restore();
  }

  /* ── Power-Up Indicators ──────────────────────────────── */
  _drawPowerUps(ctx) {
    const items = [];
    if (this.game.isSuperBulletsActive())
      items.push({ label: "SUPER BULLETS", timer: this.game.superBulletTimer, color: "#ffd86b" });
    if (this.game.isShieldActive())
      items.push({ label: "SHIELD", timer: this.game.shieldTimer, color: "#86e7ff" });
    if (!items.length) return;

    ctx.save();
    const x  = this.game.width - 16;
    let   oy = 60;

    for (const item of items) {
      const tag  = `${item.label}  ${item.timer.toFixed(1)}s`;
      ctx.font   = "bold 11px 'Rajdhani', Arial";
      const tw   = ctx.measureText(tag).width;
      const bw   = tw + 22;
      const bh   = 22;

      ctx.fillStyle = "rgba(0,0,0,0.50)";
      _roundRect(ctx, x - bw, oy, bw, bh, 8, true, false);
      ctx.strokeStyle = item.color + "55";
      ctx.lineWidth   = 1;
      _roundRect(ctx, x - bw, oy, bw, bh, 8, false, true);

      // Pulse dot
      ctx.beginPath();
      ctx.arc(x - bw + 10, oy + 11, 4, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.fillStyle = item.color;
      ctx.textAlign = "right";
      ctx.fillText(tag, x - 8, oy + 15);

      oy += 28;
    }
    ctx.restore();
  }

  /* ── Wave Advance Banner (centre screen) ──────────────── */
  _drawWaveBanner(ctx) {
    if (!this.levelUpMessage) return;

    const cx    = this.game.width  / 2;
    const cy    = this.game.height / 2;
    const alpha = Math.max(0, 1 - this.levelUpTimer / this.levelUpDuration);
    const scale = 1 + (1 - alpha) * 0.08;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // Background pill
    const bw = 320, bh = 76;
    const bx = cx - bw / 2, by = cy - bh / 2;

    ctx.fillStyle = "rgba(0,0,0,0.70)";
    _roundRect(ctx, bx, by, bw, bh, 20, true, false);
    ctx.strokeStyle = "rgba(0,212,255,0.60)";
    ctx.lineWidth   = 1.5;
    _roundRect(ctx, bx, by, bw, bh, 20, false, true);

    // Top glow line
    ctx.fillStyle = "rgba(0,212,255,0.30)";
    _roundRect(ctx, bx + 30, by, bw - 60, 1, 1, true, false);

    // Sub-label
    ctx.font      = "700 11px 'Rajdhani', Arial";
    ctx.fillStyle = "rgba(0,212,255,0.85)";
    ctx.textAlign = "center";
    ctx.fillText("WAVE CLEARED", cx, cy - 10);

    // Main text
    ctx.font      = "900 32px 'Orbitron', Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor  = "#00d4ff";
    ctx.shadowBlur   = 22;
    ctx.fillText(this.levelUpMessage, cx, cy + 24);

    ctx.restore();
  }

  /* ── FPS Counter (bottom-left) ────────────────────────── */
  _drawFPS(ctx) {
    const raw = 1 / this.game.time.deltaTime;
    this._fpsHistory.push(raw);
    if (this._fpsHistory.length > 30) this._fpsHistory.shift();
    this._fpsSmooth = this._fpsHistory.reduce((a, b) => a + b, 0) / this._fpsHistory.length;

    const fps = Math.round(this._fpsSmooth);
    const color = fps >= 55 ? "rgba(0,255,170,0.55)"
                : fps >= 30 ? "rgba(255,200,60,0.55)"
                :             "rgba(255,70,80,0.55)";

    ctx.save();
    ctx.font      = "600 10px 'Rajdhani', Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(`FPS ${fps}`, 14, this.game.height - 12);
    ctx.restore();
  }
}

/* ── Internal helper ──────────────────────────────────────── */
function _roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill)   ctx.fill();
    if (stroke) ctx.stroke();
    return;
  }
  const c = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.arcTo(x + w, y, x + w, y + h, c);
  ctx.arcTo(x + w, y + h, x, y + h, c);
  ctx.arcTo(x, y + h, x, y, c);
  ctx.arcTo(x, y, x + w, y, c);
  ctx.closePath();
  if (fill)   ctx.fill();
  if (stroke) ctx.stroke();
}
