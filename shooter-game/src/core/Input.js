/**
 * Input system for handling keyboard and mouse input
 */
export default class Input {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, button: -1 };
    this.keysPressed = new Set();

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys[key]) {
        this.keysPressed.add(key);
      }
      this.keys[key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse events
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener("mousedown", (e) => {
      this.mouse.button = e.button;
    });

    window.addEventListener("mouseup", () => {
      this.mouse.button = -1;
    });
  }

  isKeyDown(key) {
    return this.keys[key.toLowerCase()] || false;
  }

  isKeyPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }

  clearPressed() {
    this.keysPressed.clear();
  }

  isMousePressed(button = 0) {
    return this.mouse.button === button;
  }

  getMousePos() {
    return { x: this.mouse.x, y: this.mouse.y };
  }
}
