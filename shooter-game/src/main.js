import Game from "./core/Game.js";
import AudioManager from "./core/AudioManager.js";
import MapData from "./map/MapData.js";
import MAP_PRESETS from "./map/MapPresets.js";

const game = new Game();
const audioManager = new AudioManager();

const introScreen = document.getElementById("intro-screen");
const introMainPanel = document.getElementById("intro-main-panel");
const settingsPanel = document.getElementById("settings-panel");
const howtoPanel = document.getElementById("howto-panel");
const mapsPanel = document.getElementById("maps-panel");
const pausePanel = document.getElementById("pause-panel");
const mapGallery = document.getElementById("map-gallery");

const startBtn = document.getElementById("start-btn");
const settingsBtn = document.getElementById("settings-btn");
const mapsBtn = document.getElementById("maps-btn");
const howtoBtn = document.getElementById("howto-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const mapsBackBtn = document.getElementById("maps-back-btn");
const howtoBackBtn = document.getElementById("howto-back-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseSettingsBtn = document.getElementById("pause-settings-btn");
const pauseMapsBtn = document.getElementById("pause-maps-btn");
const pauseHowtoBtn = document.getElementById("pause-howto-btn");
const pauseMainBtn = document.getElementById("pause-main-btn");

const musicToggle = document.getElementById("music-toggle");
const volumeRange = document.getElementById("volume-range");
const colorSwatches = document.querySelectorAll(".color-swatch");

let menuContext = "intro";
let hasPrimedAudio = false;
const previewTileClasses = {
  grass: "map-tile-grass",
  forest: "map-tile-forest",
  water: "map-tile-water",
  lava: "map-tile-lava",
  stone: "map-tile-stone",
};

async function ensureAudioReady() {
  await audioManager.initFromUserGesture();
  await audioManager.setMusicEnabled(musicToggle?.checked ?? true);
  audioManager.setVolume(Number(volumeRange?.value || 40) / 100 || 0.4);
}

async function primeMenuAudioOnce() {
  if (hasPrimedAudio) {
    return;
  }

  hasPrimedAudio = true;
  await ensureAudioReady();
  await audioManager.enterMenuMode();
}

async function playMenuMusic() {
  await ensureAudioReady();
  await audioManager.enterMenuMode();
}

function setVisiblePanel(panel) {
  introMainPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");
  howtoPanel.classList.add("hidden");
  mapsPanel.classList.add("hidden");
  pausePanel.classList.add("hidden");
  panel.classList.remove("hidden");
}

function showIntroMain() {
  menuContext = "intro";
  introScreen?.classList.remove("hidden");  // re-show the overlay container
  setVisiblePanel(introMainPanel);
  void playMenuMusic();
}

function showPausePanel() {
  menuContext = "pause";
  introScreen?.classList.remove("hidden");
  setVisiblePanel(pausePanel);
  void playMenuMusic();

  // ── Live stats ──────────────────────────────────────────
  const scoreEl  = document.getElementById("pm-score-val");
  const waveEl   = document.getElementById("pm-wave-val");
  const healthEl = document.getElementById("pm-health-val");

  // Score — show actual value, no arbitrary padding
  if (scoreEl) scoreEl.textContent = game.score ?? 0;

  // Wave
  if (waveEl) waveEl.textContent = game.waveSystem?.currentWave ?? 1;

  // Health — show "72%" and colour-code
  if (healthEl) {
    const player = game.player;
    if (player) {
      const pct = Math.ceil((player.hp / player.maxHp) * 100);
      healthEl.textContent = pct + "%";
      // green > 50%, yellow > 25%, red otherwise
      healthEl.style.color = pct > 50 ? "#00ffaa" : pct > 25 ? "#ffd86b" : "#ff3d5a";
    } else {
      healthEl.textContent = "—";
      healthEl.style.color = "";
    }
  }
}

function showMapsPanel() {
  void primeMenuAudioOnce();
  buildMapGallery();
  setVisiblePanel(mapsPanel);
}

function getBackPanel() {
  return menuContext === "pause" ? pausePanel : introMainPanel;
}

function buildMapGallery() {
  if (!mapGallery || mapGallery.childElementCount > 0) {
    return;
  }

  const previewWidth = 24;
  const previewHeight = 18;

  MAP_PRESETS.forEach((preset, index) => {
    const mapData = new MapData(previewWidth, previewHeight, preset);
    const card = document.createElement("article");
    card.className = "map-preview-card";

    const title = document.createElement("div");
    title.className = "map-preview-title";

    const level = document.createElement("span");
    level.textContent = `Level ${index + 1}`;

    const name = document.createElement("strong");
    name.textContent = preset;

    title.append(level, name);

    const grid = document.createElement("div");
    grid.className = "map-preview-grid";
    grid.setAttribute("aria-label", `${preset} map preview`);
    grid.style.gridTemplateColumns = `repeat(${previewWidth}, 1fr)`;

    for (let y = 0; y < previewHeight; y++) {
      for (let x = 0; x < previewWidth; x++) {
        const tile = document.createElement("span");
        const type = mapData.getTile(x, y) || "grass";
        tile.className = `map-preview-tile ${previewTileClasses[type] || previewTileClasses.grass}`;
        grid.appendChild(tile);
      }
    }

    const note = document.createElement("p");
    note.textContent = "Preview only";

    card.append(title, grid, note);
    mapGallery.appendChild(card);
  });
}

settingsBtn?.addEventListener("click", () => {
  void primeMenuAudioOnce();
  setVisiblePanel(settingsPanel);
});

howtoBtn?.addEventListener("click", () => {
  void primeMenuAudioOnce();
  setVisiblePanel(howtoPanel);
});

mapsBtn?.addEventListener("click", showMapsPanel);

pauseSettingsBtn?.addEventListener("click", () => {
  void ensureAudioReady();
  setVisiblePanel(settingsPanel);
});

pauseMapsBtn?.addEventListener("click", showMapsPanel);

pauseHowtoBtn?.addEventListener("click", () => {
  void ensureAudioReady();
  setVisiblePanel(howtoPanel);
});

settingsBackBtn?.addEventListener("click", () => {
  if (menuContext === "pause") {
    setVisiblePanel(pausePanel);
    return;
  }

  showIntroMain();
});

howtoBackBtn?.addEventListener("click", () => {
  setVisiblePanel(getBackPanel());
});

mapsBackBtn?.addEventListener("click", () => {
  setVisiblePanel(getBackPanel());
});

resumeBtn?.addEventListener("click", () => {
  if (game.isPaused) {
    game.togglePause();
  }
});

pauseMainBtn?.addEventListener("click", () => {
  game.goToMainMenu();
  introScreen?.classList.remove("hidden");
  showIntroMain();
});

startBtn?.addEventListener("click", async () => {
  await ensureAudioReady();

  introScreen?.classList.add("hidden");
  await audioManager.enterGameMode();
  game.beginGame();
});

musicToggle?.addEventListener("change", async (event) => {
  await audioManager.setMusicEnabled(event.target.checked);
});

volumeRange?.addEventListener("input", (event) => {
  const volume = Number(event.target.value) / 100;
  audioManager.setVolume(volume);
});

colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    colorSwatches.forEach((item) => item.classList.remove("active"));
    swatch.classList.add("active");
    game.setPlayerColor(swatch.dataset.color);
  });
});

game.setPauseChangeHandler((isPaused) => {
  if (isPaused) {
    showPausePanel();
    return;
  }

  if (game.hasStarted) {
    void audioManager.enterGameMode();
    introScreen?.classList.add("hidden");
  }
});

// ── Game Over Screen ──────────────────────────────────────────
const gameOverScreen = document.getElementById("game-over-screen");
const goScoreEl      = document.getElementById("go-score");
const goTimeEl       = document.getElementById("go-time");
const goWaveEl       = document.getElementById("go-wave");
const goRestartBtn   = document.getElementById("go-restart-btn");
const goMenuBtn      = document.getElementById("go-menu-btn");

let gameOverShown = false;  // guard so we only show once per death

function showGameOver() {
  if (gameOverShown) return;
  gameOverShown = true;

  // Populate stats
  if (goScoreEl) goScoreEl.textContent = game.score ?? 0;
  if (goTimeEl)  goTimeEl.textContent  = game.getPlayTimeFormatted?.() ?? "00:00";
  if (goWaveEl)  goWaveEl.textContent  = game.waveSystem?.currentWave ?? 1;

  gameOverScreen?.classList.remove("hidden");
  void audioManager.enterMenuMode?.();
}

function hideGameOver() {
  gameOverShown = false;
  gameOverScreen?.classList.add("hidden");
}

game.setGameOverHandler(showGameOver);

// Play Again button + R key
function doRestart() {
  hideGameOver();
  introScreen?.classList.add("hidden");
  void audioManager.enterGameMode?.();
  game.restart();
  game.hasStarted = true;
}

goRestartBtn?.addEventListener("click", doRestart);

// ── Restart Confirm Popup ─────────────────────────────────────
const rcBackdrop = document.getElementById("restart-confirm");
const rcYesBtn   = document.getElementById("rc-yes-btn");
const rcNoBtn    = document.getElementById("rc-no-btn");

function showRestartConfirm() {
  // Pause the game while the popup is open
  if (!game.isPaused && game.hasStarted && !game.isGameOver) {
    game.togglePause();
  }
  rcBackdrop?.classList.remove("hidden");
}

function hideRestartConfirm() {
  rcBackdrop?.classList.add("hidden");
}

rcYesBtn?.addEventListener("click", () => {
  hideRestartConfirm();
  doRestart();
});

rcNoBtn?.addEventListener("click", () => {
  hideRestartConfirm();
  // Un-pause if we paused to show the confirm
  if (game.isPaused && game.hasStarted && !game.isGameOver) {
    game.togglePause();
  }
});

// R key handling
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // If confirm popup is open: Enter = yes, Escape = cancel
  if (!rcBackdrop?.classList.contains("hidden")) {
    if (key === "enter") { rcYesBtn?.click(); }
    if (key === "escape") { rcNoBtn?.click(); }
    return;
  }

  // Game over: R restarts immediately (no confirm needed)
  if (key === "r" && game.isGameOver) {
    doRestart();
    return;
  }

  // In-game / pause menu: R shows confirm popup
  if (key === "r" && game.hasStarted && !game.isGameOver) {
    showRestartConfirm();
  }
});

// Main Menu button
goMenuBtn?.addEventListener("click", () => {
  hideGameOver();
  game.goToMainMenu();
  showIntroMain();
});

// ── Audio priming ─────────────────────────────────────────────
document.addEventListener(
  "pointerdown",
  () => { void primeMenuAudioOnce(); },
  { once: true },
);

document.addEventListener(
  "keydown",
  () => { void primeMenuAudioOnce(); },
  { once: true },
);

game.start();
