import { io } from "socket.io-client";
import { setRandomSeed } from "../utils/random.js";

export default class NetworkManager {
  constructor(game) {
    this.game = game;
    this.roomId = null;
    this.seed = null;
    this.isHost = false;
    this.hostId = null;
    this.players = {};
    this.settings = {
      roomName: "",
      mapPreset: "default",
      durationMinutes: 10,
    };

    this.onRoomCreated = null;
    this.onRoomJoined = null;
    this.onLobbyUpdate = null;
    this.onGameStarted = null;
    this.onPlayersUpdate = null;
    this.onPlayerShoot = null;
    this.onWorldState = null;
    this.onRoomDeleted = null;
    this.onPlayerKicked = null;
    this.onRoomSettingsUpdated = null;
    this.onMatchEnded = null;
    this.onError = null;

    const socketBaseUrl =
      import.meta.env.VITE_SOCKET_URL ||
      `${window.location.protocol}//${window.location.hostname}:3000`;

    this.socket = io(socketBaseUrl);

    this.socket.on("connect", () => {
      this.game.playerId = this.socket.id;
    });

    this.init();
  }

  init() {
    this.socket.on("roomCreated", (payload) => {
      this.roomId = payload.roomId;
      this.seed = payload.seed;
      this.isHost = true;
      this.hostId = payload.host;
      this.settings = payload.settings || this.settings;
      setRandomSeed(payload.seed);
      this.players = payload.players || {};
      this.onRoomCreated?.(payload);
    });

    this.socket.on("roomJoined", (payload) => {
      this.roomId = payload.roomId;
      this.seed = payload.seed;
      this.isHost = Boolean(payload.isHost);
      this.hostId = payload.host;
      this.settings = payload.settings || this.settings;
      setRandomSeed(payload.seed);
      this.players = payload.players || {};
      this.onRoomJoined?.(payload);
    });

    this.socket.on("lobbyUpdate", (payload) => {
      this.roomId = payload.roomId || this.roomId;
      this.hostId = payload.host || this.hostId;
      this.settings = payload.settings || this.settings;
      this.players = payload.players || {};
      this.onLobbyUpdate?.(payload);
    });

    this.socket.on("gameStarted", (payload) => {
      this.players = payload.players || this.players;
      if (payload.seed !== undefined) {
        this.seed = payload.seed;
        setRandomSeed(payload.seed);
      }
      this.onGameStarted?.(payload);
    });

    this.socket.on("playersUpdate", (players) => {
      this.players = players || {};
      this.onPlayersUpdate?.(players);
    });

    this.socket.on("playerShoot", (payload) => {
      this.onPlayerShoot?.(payload);
    });

    this.socket.on("worldState", (state) => {
      this.onWorldState?.(state);
    });

    this.socket.on("roomError", (message) => {
      this.onError?.(message);
    });

    this.socket.on("roomDeleted", (payload) => {
      this.onRoomDeleted?.(payload);
      this.roomId = null;
      this.seed = null;
      this.hostId = null;
      this.isHost = false;
      this.players = {};
    });

    this.socket.on("playerKicked", (payload) => {
      this.onPlayerKicked?.(payload);
      if (payload?.playerId === this.socket.id) {
        this.roomId = null;
        this.seed = null;
        this.hostId = null;
        this.isHost = false;
        this.players = {};
      }
    });

    this.socket.on("roomSettingsUpdated", (payload) => {
      this.settings = payload.settings || this.settings;
      this.onRoomSettingsUpdated?.(payload);
    });

    this.socket.on("matchEnded", (payload) => {
      this.onMatchEnded?.(payload);
    });
  }

  createRoom() {
    this.socket.emit("createRoom");
  }

  joinRoom(roomId) {
    this.socket.emit("joinRoom", { roomId });
  }

  startGame() {
    if (!this.roomId) {
      return;
    }

    this.socket.emit("startGame", { roomId: this.roomId });
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit("leaveRoom", { roomId: this.roomId });
    }

    this.roomId = null;
    this.isHost = false;
    this.players = {};
  }

  deleteRoom() {
    if (!this.roomId || !this.isHost) {
      return;
    }

    this.socket.emit("deleteRoom", { roomId: this.roomId });
  }

  updateRoomSettings(settings) {
    if (!this.roomId || !this.isHost) {
      return;
    }

    this.socket.emit("updateRoomSettings", {
      roomId: this.roomId,
      settings,
    });
  }

  kickPlayer(playerId) {
    if (!this.roomId || !this.isHost || !playerId) {
      return;
    }

    this.socket.emit("kickPlayer", { roomId: this.roomId, playerId });
  }

  sendPlayerState(state) {
    if (!this.roomId) {
      return;
    }

    this.socket.emit("playerMove", {
      roomId: this.roomId,
      x: state.x,
      y: state.y,
      angle: state.angle,
      hp: state.hp,
      maxHp: state.maxHp,
      color: state.color,
      kills: state.kills,
      deaths: state.deaths,
    });
  }

  sendPlayerShoot(state) {
    if (!this.roomId) {
      return;
    }

    this.socket.emit("playerShoot", {
      roomId: this.roomId,
      ...state,
    });
  }

  sendWorldState(state) {
    if (!this.roomId || !this.isHost) {
      return;
    }

    this.socket.emit("worldState", { roomId: this.roomId, state });
  }

  updatePlayerStats(playerId, stats) {
    if (!this.roomId || !playerId) {
      return;
    }

    this.socket.emit("playerStatsUpdate", {
      roomId: this.roomId,
      playerId,
      stats,
    });
  }

  endMatch(result) {
    if (!this.roomId || !this.isHost) {
      return;
    }

    this.socket.emit("matchEnded", {
      roomId: this.roomId,
      result,
    });
  }

  getLocalPlayerStats() {
    return this.players?.[this.socket.id] || { kills: 0, deaths: 0 };
  }

  getRemotePlayers() {
    const localId = this.socket.id;
    const remotePlayers = {};

    for (const [id, player] of Object.entries(this.players)) {
      if (id !== localId) {
        remotePlayers[id] = player;
      }
    }

    return remotePlayers;
  }

  getLobbyPlayers() {
    return Object.values(this.players || {});
  }
}
