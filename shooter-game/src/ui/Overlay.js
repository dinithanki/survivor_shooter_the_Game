/**
 * Overlay — only handles the death-flash visual now.
 * Game Over screen is handled by the HTML panel in index.html.
 */
export default class Overlay {
  constructor(game) {
    this.game           = game;
    this.currentOverlay = null;
    this._t             = 0;
  }

  show(overlay) { this.currentOverlay = overlay; this._t = 0; }
  hide()        { this.currentOverlay = null; }

  draw(ctx) {
    // Nothing drawn on canvas — game over is now an HTML panel
  }
}
