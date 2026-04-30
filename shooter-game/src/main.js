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
  setVisiblePanel(introMainPanel);
  void playMenuMusic();
}

function showPausePanel() {
  menuContext = "pause";
  introScreen?.classList.remove("hidden");
  setVisiblePanel(pausePanel);
  void playMenuMusic();
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

document.addEventListener(
  "pointerdown",
  () => {
    void primeMenuAudioOnce();
  },
  { once: true },
);

document.addEventListener(
  "keydown",
  () => {
    void primeMenuAudioOnce();
  },
  { once: true },
);

game.start();
