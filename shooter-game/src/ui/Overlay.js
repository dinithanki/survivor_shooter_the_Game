/**
 * Overlay — premium game-over and pause screens drawn on canvas
 */
export default class Overlay {
  constructor(game) {
    this.game           = game;
    this.currentOverlay = null;
    this._t             = 0;      // animation timer
  }

  /* ── Public API ──────────────────────────────────────── */
  show(overlay) { this.currentOverlay = overlay; this._t = 0; }
  hide()        { this.currentOverlay = null; }

  draw(ctx) {
    this._t += this.game.time?.deltaTime ?? 0.016;
    if (this.currentOverlay === "gameOver") this._drawGameOver(ctx);
  }

  /* ── Shared helpers ───────────────────────────────────── */
  _bg(ctx, tint = "rgba(0,0,0,0.82)") {
    ctx.save();
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, this.game.width, this.game.height);
    ctx.restore();
  }

  _card(ctx, cx, cy, w, h, r = 22) {
    _roundRect(ctx, cx - w / 2, cy - h / 2, w, h, r, true, true);
  }

  _kicker(ctx, text, cx, y) {
    ctx.save();
    ctx.font      = "bold 11px Arial";
    ctx.fillStyle = "rgba(0,212,255,0.85)";
    ctx.textAlign = "center";
    ctx.fillText(text, cx, y);
    ctx.restore();
  }

  /* ── Game Over ────────────────────────────────────────── */
  _drawGameOver(ctx) {
    const W  = this.game.width;
    const H  = this.game.height;
    const cx = W / 2;
    const cy = H / 2;

    // Dimmed background with red tint
    this._bg(ctx, "rgba(12, 2, 4, 0.88)");

    // Animated pulsing red orb
    const pulse = 0.7 + 0.3 * Math.sin(this._t * 2.5);
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.48);
    grad.addColorStop(0, `rgba(255,40,60,${0.14 * pulse})`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Card — taller to fit score comfortably
    const cardW = Math.min(420, W * 0.84);
    const cardH = Math.min(340, H * 0.62);
    const top   = cy - cardH / 2;

    ctx.save();
    ctx.fillStyle   = "rgba(8, 4, 12, 0.97)";
    ctx.strokeStyle = "rgba(255,50,70,0.55)";
    ctx.lineWidth   = 1.5;
    this._card(ctx, cx, cy, cardW, cardH);

    // Top red glow bar
    ctx.fillStyle = "rgba(255,50,70,0.40)";
    _roundRect(ctx, cx - cardW / 2 + 40, top, cardW - 80, 1.5, 1, true, false);
    ctx.restore();

    // ── "MISSION FAILED" kicker ──
    ctx.save();
    ctx.font      = "700 10px Arial";
    ctx.fillStyle = "rgba(255,80,100,0.80)";
    ctx.textAlign = "center";
    ctx.fillText("MISSION  FAILED", cx, top + 26);
    ctx.restore();

    // ── "GAME OVER" title ──
    ctx.save();
    ctx.textAlign   = "center";
    ctx.font        = "bold 48px Arial";
    ctx.shadowColor = "#ff2244";
    ctx.shadowBlur  = 22 + 10 * Math.sin(this._t * 3);
    ctx.fillStyle   = "#ff3d5a";
    ctx.fillText("GAME OVER", cx, top + 80);
    ctx.restore();

    // ── Divider ──
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(cx - cardW / 2 + 28, top + 96, cardW - 56, 1);

    // ── SCORE — large and centred ──
    const score = this.game.score ?? 0;

    ctx.save();
    ctx.textAlign = "center";

    // Label
    ctx.font      = "bold 11px Arial";
    ctx.fillStyle = "rgba(100, 200, 255, 0.70)";
    ctx.fillText("FINAL  SCORE", cx, top + 128);

    // Value — big
    ctx.font        = "bold 52px Arial";
    ctx.fillStyle   = "#00d4ff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur  = 18;
    ctx.fillText(String(score).padStart(6, "0"), cx, top + 188);
    ctx.shadowBlur  = 0;
    ctx.restore();

    // ── Wave row ──
    ctx.save();
    ctx.textAlign = "center";
    ctx.font      = "bold 13px Arial";
    ctx.fillStyle = "rgba(255, 216, 107, 0.80)";
    ctx.fillText("WAVE  " + (this.game.waveSystem?.currentWave ?? 1) + "  REACHED", cx, top + 216);
    ctx.restore();

    // ── Divider ──
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(cx - cardW / 2 + 28, top + 232, cardW - 56, 1);

    // ── Blinking restart prompt ──
    ctx.save();
    const blink = Math.floor(this._t * 2) % 2 === 0 ? 0.9 : 0.45;
    ctx.globalAlpha = blink;
    ctx.font        = "bold 13px Arial";
    ctx.fillStyle   = "#ccdcff";
    ctx.textAlign   = "center";
    ctx.fillText("PRESS  R  TO  RESTART", cx, top + cardH - 22);
    ctx.restore();
  }
}

/* ── Module-level helpers ─────────────────────────────────── */
function _statPill(ctx, cx, cy, label, value, accent) {
  const w = 104, h = 54;
  ctx.save();

  // Pill bg
  ctx.fillStyle   = "rgba(255,255,255,0.05)";
  ctx.strokeStyle = accent + "44";
  ctx.lineWidth   = 1;
  _roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 12, true, true);

  // Label
  ctx.font      = "700 9px 'Rajdhani', Arial";
  ctx.fillStyle = accent + "bb";
  ctx.textAlign = "center";
  ctx.letterSpacing = "2px";
  ctx.fillText(label, cx, cy - h / 2 + 16);

  // Value
  ctx.font      = "bold 16px 'Orbitron', Arial";
  ctx.fillStyle = "#f0f6ff";
  ctx.letterSpacing = "0px";
  ctx.fillText(value, cx, cy + h / 2 - 14);

  ctx.restore();
}

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
