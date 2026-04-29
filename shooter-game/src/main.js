import Game from "./core/Game.js";
import AudioManager from "./core/AudioManager.js";

const game = new Game();
const audioManager = new AudioManager();

const introScreen = document.getElementById("intro-screen");
const introMainPanel = document.getElementById("intro-main-panel");
const settingsPanel = document.getElementById("settings-panel");
const howtoPanel = document.getElementById("howto-panel");
const pausePanel = document.getElementById("pause-panel");

const startBtn = document.getElementById("start-btn");
const settingsBtn = document.getElementById("settings-btn");
const howtoBtn = document.getElementById("howto-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const howtoBackBtn = document.getElementById("howto-back-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseSettingsBtn = document.getElementById("pause-settings-btn");
const pauseHowtoBtn = document.getElementById("pause-howto-btn");
const pauseMainBtn = document.getElementById("pause-main-btn");

const musicToggle = document.getElementById("music-toggle");
const volumeRange = document.getElementById("volume-range");
const colorSwatches = document.querySelectorAll(".color-swatch");

let menuContext = "intro";

function setVisiblePanel(panel) {
  introMainPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");
  howtoPanel.classList.add("hidden");
  pausePanel.classList.add("hidden");
  panel.classList.remove("hidden");
}

function showIntroMain() {
  menuContext = "intro";
  setVisiblePanel(introMainPanel);
}

function showPausePanel() {
  menuContext = "pause";
  introScreen?.classList.remove("hidden");
  setVisiblePanel(pausePanel);
}

settingsBtn?.addEventListener("click", () => {
  setVisiblePanel(settingsPanel);
});

howtoBtn?.addEventListener("click", () => {
  setVisiblePanel(howtoPanel);
});

pauseSettingsBtn?.addEventListener("click", () => {
  setVisiblePanel(settingsPanel);
});

pauseHowtoBtn?.addEventListener("click", () => {
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
  if (menuContext === "pause") {
    setVisiblePanel(pausePanel);
    return;
  }

  showIntroMain();
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
  await audioManager.initFromUserGesture();
  await audioManager.setMusicEnabled(musicToggle?.checked ?? true);
  audioManager.setVolume(Number(volumeRange?.value || 40) / 100 || 0.4);

  introScreen?.classList.add("hidden");
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
    introScreen?.classList.add("hidden");
  }
});

game.start();
