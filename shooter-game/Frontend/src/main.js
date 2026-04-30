import Game from "./core/Game.js";
import AudioManager from "./core/AudioManager.js";
import NetworkManager from "./network/NetworkManager.js";
import MapData from "./map/MapData.js";
import MAP_PRESETS from "./map/MapPresets.js";

const game = new Game();
const audioManager = new AudioManager();
const network = new NetworkManager(game);

const introScreen = document.getElementById("intro-screen");
const introMainPanel = document.getElementById("intro-main-panel");
const settingsPanel = document.getElementById("settings-panel");
const howtoPanel = document.getElementById("howto-panel");
const mapsPanel = document.getElementById("maps-panel");
const lobbyPanel = document.getElementById("lobby-panel");
const pausePanel = document.getElementById("pause-panel");
const mapGallery = document.getElementById("map-gallery");

const startBtn = document.getElementById("start-btn");
const multiplayerBtn = document.getElementById("multiplayer-btn");
const settingsBtn = document.getElementById("settings-btn");
const mapsBtn = document.getElementById("maps-btn");
const howtoBtn = document.getElementById("howto-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const mapsBackBtn = document.getElementById("maps-back-btn");
const howtoBackBtn = document.getElementById("howto-back-btn");
const lobbyBackBtn = document.getElementById("lobby-back-btn");
const lobbySubtitle = document.querySelector(
  "#lobby-panel .intro-subtitle-compact",
);
const roomNameInput = document.getElementById("room-name-input");
const roomMapSelect = document.getElementById("room-map-select");
const roomTimeSelect = document.getElementById("room-time-select");
const roomRoleLabel = document.getElementById("room-role-label");
const roomCodeInput = document.getElementById("room-code-input");
const copyRoomCodeBtn = document.getElementById("copy-room-code-btn");
const copyRoomCodeFeedback = document.getElementById("copy-room-code-feedback");
const roomFullWarning = document.getElementById("room-full-warning");
const roomStatusText = document.getElementById("room-status-text");
const lobbyPlayerCount = document.getElementById("lobby-player-count");
const lobbyPlayerItems = document.getElementById("lobby-player-items");
const deleteRoomBtn = document.getElementById("delete-room-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseSettingsBtn = document.getElementById("pause-settings-btn");
const pauseMapsBtn = document.getElementById("pause-maps-btn");
const pauseHowtoBtn = document.getElementById("pause-howto-btn");
const pauseMainBtn = document.getElementById("pause-main-btn");

const musicToggle = document.getElementById("music-toggle");
const volumeRange = document.getElementById("volume-range");
const colorSwatches = document.querySelectorAll(".color-swatch");
const createGameBtn = document.getElementById("create-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");

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
  lobbyPanel.classList.add("hidden");
  pausePanel.classList.add("hidden");
  panel.classList.remove("hidden");
}

function showIntroMain() {
  menuContext = "intro";
  setVisiblePanel(introMainPanel);
  void playMenuMusic();
}

function showLobby() {
  void primeMenuAudioOnce();
  setVisiblePanel(lobbyPanel);
}

function setLobbyStatus(message) {
  if (roomStatusText) {
    roomStatusText.textContent = message;
  }
}

function setCopyFeedback(message) {
  if (copyRoomCodeFeedback) {
    copyRoomCodeFeedback.textContent = message;
  }
}

function setRoomFullWarning(isVisible) {
  roomFullWarning?.classList.toggle("hidden", !isVisible);
}

function populateRoomSettings() {
  if (roomMapSelect && roomMapSelect.childElementCount === 0) {
    MAP_PRESETS.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset;
      option.textContent = preset;
      roomMapSelect.appendChild(option);
    });
  }

  if (roomTimeSelect && roomTimeSelect.childElementCount === 0) {
    for (let minutes = 1; minutes <= 10; minutes++) {
      const option = document.createElement("option");
      option.value = String(minutes);
      option.textContent = `${minutes} minute${minutes === 1 ? "" : "s"}`;
      roomTimeSelect.appendChild(option);
    }
  }
}

function applyRoomSettingsToUI(settings = {}) {
  if (roomNameInput) {
    roomNameInput.value = settings.roomName || roomNameInput.value || "";
  }

  if (roomMapSelect && settings.mapPreset) {
    roomMapSelect.value = settings.mapPreset;
  }

  if (roomTimeSelect && settings.durationMinutes) {
    roomTimeSelect.value = String(Math.min(10, Math.max(1, settings.durationMinutes)));
  }
}

function currentRoomSettings() {
  return {
    roomName: roomNameInput?.value?.trim() || "",
    mapPreset: roomMapSelect?.value || "default",
    durationMinutes: Number(roomTimeSelect?.value || 10),
  };
}

function flashCopyGlow() {
  if (!copyRoomCodeBtn) {
    return;
  }

  copyRoomCodeBtn.classList.add("copy-glow");
  window.clearTimeout(copyRoomCodeBtn._copyGlowTimeout);
  copyRoomCodeBtn._copyGlowTimeout = window.setTimeout(() => {
    copyRoomCodeBtn.classList.remove("copy-glow");
  }, 1400);
}

function renderLobbyPlayers(players = []) {
  if (!lobbyPlayerItems || !lobbyPlayerCount) {
    return;
  }

  lobbyPlayerItems.innerHTML = "";
  lobbyPlayerCount.textContent = `${players.length} / 5`;

  players.forEach((player, index) => {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const isHost = player.id === network.hostId;
    name.textContent = isHost ? "Admin" : `Player ${index + 1}`;

    const meta = document.createElement("span");
    meta.className = "lobby-player-tag";
    meta.textContent = isHost ? "Host" : "Joined";

    const actions = document.createElement("div");
    actions.className = "lobby-player-actions";

    actions.append(name, meta);

    if (network.isHost && !isHost) {
      const kickButton = document.createElement("button");
      kickButton.type = "button";
      kickButton.className = "intro-btn kick-player-btn";
      kickButton.textContent = "Kick";
      kickButton.addEventListener("click", () => {
        network.kickPlayer(player.id);
      });
      actions.appendChild(kickButton);
    }

    item.append(actions);
    lobbyPlayerItems.appendChild(item);
  });
}

function setLobbyRoomState(roomId, isHost) {
  if (roomCodeInput) {
    roomCodeInput.value = roomId || "-";
  }

  if (roomRoleLabel) {
    roomRoleLabel.textContent = isHost ? "Admin" : "Guest";
  }

  if (deleteRoomBtn) {
    deleteRoomBtn.classList.toggle("hidden", !isHost);
  }

  if (roomNameInput) roomNameInput.disabled = !isHost;
  if (roomMapSelect) roomMapSelect.disabled = !isHost;
  if (roomTimeSelect) roomTimeSelect.disabled = !isHost;
}

function updateStartButton(playersCount, isHost, started) {
  if (!createGameBtn) {
    return;
  }

  if (!isHost) {
    createGameBtn.textContent = "Create Room";
    createGameBtn.disabled = false;
    return;
  }

  if (started) {
    createGameBtn.textContent = "Game Started";
    createGameBtn.disabled = true;
    return;
  }

  if (playersCount >= 2) {
    createGameBtn.textContent = "Start Game";
    createGameBtn.disabled = false;
    return;
  }

  createGameBtn.textContent = "Waiting for Players...";
  createGameBtn.disabled = true;
}

populateRoomSettings();

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

multiplayerBtn?.addEventListener("click", showLobby);

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

lobbyBackBtn?.addEventListener("click", () => {
  if (network.roomId) {
    if (network.isHost) {
      network.deleteRoom();
    } else {
      network.leaveRoom();
    }
  }

  showIntroMain();
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
  network.leaveRoom();
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

createGameBtn?.addEventListener("click", () => {
  if (!network.roomId) {
    network.createRoom();
    setLobbyStatus("Creating room...");
    return;
  }

  if (network.isHost && !game.hasStarted) {
    network.startGame();
  }
});

roomNameInput?.addEventListener("input", () => {
  if (!network.isHost) return;
  network.updateRoomSettings(currentRoomSettings());
});

roomMapSelect?.addEventListener("change", () => {
  if (!network.isHost) return;
  network.updateRoomSettings(currentRoomSettings());
});

roomTimeSelect?.addEventListener("change", () => {
  if (!network.isHost) return;
  network.updateRoomSettings(currentRoomSettings());
});

joinGameBtn?.addEventListener("click", () => {
  const roomId = window.prompt("Enter room code");
  if (!roomId) {
    return;
  }

  const normalizedRoomId = roomId.trim().toUpperCase();
  network.joinRoom(normalizedRoomId);
  setLobbyStatus(`Joining room ${normalizedRoomId}...`);
});

copyRoomCodeBtn?.addEventListener("click", async () => {
  const code = roomCodeInput?.value?.trim();
  if (!code || code === "-") {
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
    setCopyFeedback(`Copied room code ${code}.`);
    flashCopyGlow();
  } catch {
    setCopyFeedback(`Room code: ${code}`);
  }
});

deleteRoomBtn?.addEventListener("click", () => {
  network.deleteRoom();
});

network.onRoomCreated = ({ roomId }) => {
  game.startMultiplayer(network, roomId);
  game.setRemotePlayers(network.getRemotePlayers());
  game.setMultiplayerSettings(network.settings);
  applyRoomSettingsToUI(network.settings);
  setLobbyRoomState(roomId, true);
  renderLobbyPlayers(network.getLobbyPlayers());
  updateStartButton(1, true, false);
  joinGameBtn.textContent = "Join Room";
  deleteRoomBtn?.classList.remove("hidden");
  setLobbyStatus(
    `Room ${roomId} is ready. Share the code, then start the match.`,
  );
  setCopyFeedback("Copy the room code to share it with friends.");
};

network.onRoomJoined = ({ roomId }) => {
  game.startMultiplayer(network, roomId);
  game.setRemotePlayers(network.getRemotePlayers());
  game.setMultiplayerSettings(network.settings);
  applyRoomSettingsToUI(network.settings);
  setLobbyRoomState(roomId, false);
  renderLobbyPlayers(network.getLobbyPlayers());
  updateStartButton(network.getLobbyPlayers().length, false, false);
  setLobbyStatus(`Joined room ${roomId}. Waiting for the host to start.`);
  setCopyFeedback("Ask the host for the room code if you need it again.");
};

network.onLobbyUpdate = ({ roomId, count, max, started, players, host }) => {
  game.setRemotePlayers(network.getRemotePlayers());
  game.setMultiplayerSettings(network.settings);
  applyRoomSettingsToUI(network.settings);
  setLobbyRoomState(roomId, network.isHost);
  renderLobbyPlayers(
    players ? Object.values(players) : network.getLobbyPlayers(),
  );
  if (started) {
    setLobbyStatus(`Room ${roomId} is live.`);
  } else if (network.isHost) {
    setLobbyStatus(
      count <= 1
        ? `Room ${roomId} is ready. Waiting for players...`
        : `Room ${roomId} is ready. ${count}/${max} players in the lobby.`,
    );
  } else {
    setLobbyStatus(`Joined room ${roomId}. Waiting for the host to start.`);
  }

  setRoomFullWarning(count >= max);

  updateStartButton(count, network.isHost, started);
  if (network.isHost) {
    deleteRoomBtn?.classList.remove("hidden");
  }
  void host;
};

network.onPlayersUpdate = () => {
  game.setRemotePlayers(network.getRemotePlayers());
  game.syncLocalPlayerStats(network.getLocalPlayerStats());
  renderLobbyPlayers(network.getLobbyPlayers());
};

network.onPlayerShoot = (payload) => {
  game.applyRemoteShot(payload);
};

network.onWorldState = (state) => {
  if (!network.isHost) {
    game.applyWorldState(state);
  }
};

network.onGameStarted = ({ roomId }) => {
  game.startMultiplayer(network, roomId);
  game.setRemotePlayers(network.getRemotePlayers());
  game.setMultiplayerSettings(network.settings);
  game.beginGame();
  introScreen?.classList.add("hidden");
  void audioManager.enterGameMode();
  setLobbyStatus(`Battle started in room ${roomId}.`);
};

network.onRoomSettingsUpdated = ({ settings }) => {
  game.setMultiplayerSettings(settings);
  applyRoomSettingsToUI(settings);
  if (network.isHost) {
    setLobbyStatus(
      `Room ${network.roomId} settings saved: ${settings.roomName || network.roomId}.`,
    );
  }
};

network.onMatchEnded = ({ result }) => {
  game.applyMatchResult(result);
  introScreen?.classList.remove("hidden");
  setLobbyStatus(
    `${result?.roomName || "Match"} ended. Winner: ${result?.winnerName || "Unknown"}.`,
  );
  setCopyFeedback("Create or join another room to play again.");
};

network.onRoomDeleted = ({ roomId }) => {
  game.goToMainMenu();
  introScreen?.classList.remove("hidden");
  showIntroMain();
  setLobbyRoomState(null, false);
  renderLobbyPlayers([]);
  setLobbyStatus(`Room ${roomId} was deleted.`);
  setCopyFeedback("Copy the room code to share it with friends.");
  setRoomFullWarning(false);
};

network.onPlayerKicked = ({ playerId }) => {
  if (playerId === network.socket.id) {
    game.goToMainMenu();
    introScreen?.classList.remove("hidden");
    showIntroMain();
    setLobbyRoomState(null, false);
    renderLobbyPlayers([]);
    setRoomFullWarning(false);
    setCopyFeedback("Copy the room code to share it with friends.");
    setLobbyStatus("You were removed from the room.");
  }
};

network.onError = (message) => {
  window.alert(message);
};

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

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const activeTag = document.activeElement?.tagName?.toLowerCase();

  if (["input", "textarea", "select"].includes(activeTag)) {
    return;
  }

  if (key === "p" && game.hasStarted && !game.isGameOver) {
    event.preventDefault();
    game.togglePause();
    return;
  }
});

game.start();
