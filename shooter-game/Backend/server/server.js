const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* =========================
   GAME STATE
========================= */

let rooms = {};
const MAX_PLAYERS = 5;

function createRoomSeed() {
  return Math.floor(Math.random() * 1000000000) + 1;
}

function createDefaultRoomSettings(roomId) {
  return {
    roomName: `Room ${roomId}`,
    mapPreset: "default",
    durationMinutes: 10,
  };
}

/* =========================
   HELPERS
========================= */

function updateLobby(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  io.to(roomId).emit("lobbyUpdate", {
    roomId,
    host: room.host,
    players: room.players,
    count: Object.keys(room.players).length,
    max: MAX_PLAYERS,
    started: room.started,
    seed: room.seed,
  });
}

function deleteRoomIfEmpty(roomId) {
  const room = rooms[roomId];
  if (room && Object.keys(room.players).length === 0) {
    delete rooms[roomId];
  }
}

function deleteRoom(roomId, reason = "roomDeleted") {
  const room = rooms[roomId];
  if (!room) return;

  io.to(roomId).emit(reason, {
    roomId,
  });

  for (const playerId of Object.keys(room.players)) {
    const playerSocket = io.sockets.sockets.get(playerId);
    if (playerSocket) {
      playerSocket.leave(roomId);
    }
  }

  delete rooms[roomId];
}

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  /* -------------------------
     CREATE ROOM
  ------------------------- */
  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const seed = createRoomSeed();

    rooms[roomId] = {
      id: roomId,
      host: socket.id,
      players: {},
      started: false,
      seed,
      settings: createDefaultRoomSettings(roomId),
    };

    rooms[roomId].players[socket.id] = {
      id: socket.id,
      x: 0,
      y: 0,
      angle: 0,
      kills: 0,
      deaths: 0,
    };

    socket.join(roomId);
    socket.data.roomId = roomId;

    updateLobby(roomId);

    socket.emit("roomCreated", {
      roomId,
      seed,
      host: socket.id,
      settings: rooms[roomId].settings,
      players: rooms[roomId].players,
    });
  });

  /* -------------------------
     JOIN ROOM
  ------------------------- */
  socket.on("joinRoom", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (Object.keys(room.players).length >= MAX_PLAYERS) {
      socket.emit("roomError", "Room is full");
      return;
    }

    if (room.started) {
      socket.emit("roomError", "Game already started");
      return;
    }

    room.players[socket.id] = {
      id: socket.id,
      x: 0,
      y: 0,
      angle: 0,
      kills: 0,
      deaths: 0,
    };

    socket.join(roomId);
    socket.data.roomId = roomId;

    updateLobby(roomId);

    socket.emit("roomJoined", {
      roomId,
      seed: room.seed,
      host: room.host,
      isHost: room.host === socket.id,
      settings: room.settings,
      players: room.players,
    });
  });

  socket.on("updateRoomSettings", ({ roomId, settings }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.host !== socket.id || room.started) {
      return;
    }

    room.settings = {
      ...room.settings,
      ...settings,
      roomName: (
        settings?.roomName ||
        room.settings.roomName ||
        `Room ${roomId}`
      ).trim(),
      durationMinutes: Math.max(
        1,
        Math.min(10, Number(settings?.durationMinutes) || 10),
      ),
    };

    io.to(roomId).emit("roomSettingsUpdated", {
      roomId,
      settings: room.settings,
    });

    updateLobby(roomId);
  });

  /* -------------------------
     START GAME
  ------------------------- */
  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.host !== socket.id) return;

    room.started = true;

    io.to(roomId).emit("gameStarted", {
      roomId,
      seed: room.seed,
      settings: room.settings,
      players: room.players,
    });
  });

  /* -------------------------
     PLAYER MOVEMENT SYNC
  ------------------------- */
  socket.on("playerMove", ({ roomId, x, y, angle }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.players[socket.id]) {
      room.players[socket.id].x = x;
      room.players[socket.id].y = y;
      room.players[socket.id].angle = angle;
    }

    io.to(roomId).emit("playersUpdate", room.players);
  });

  socket.on("playerStatsUpdate", ({ roomId, playerId, stats }) => {
    const room = rooms[roomId];
    if (!room || !room.players[playerId]) return;

    if (socket.id !== playerId && socket.id !== room.host) {
      return;
    }

    room.players[playerId] = {
      ...room.players[playerId],
      ...stats,
    };

    io.to(roomId).emit("playersUpdate", room.players);
  });

  socket.on("playerShoot", ({ roomId, ...payload }) => {
    const room = rooms[roomId];
    if (!room) return;

    io.to(roomId).emit("playerShoot", payload);
  });

  socket.on("worldState", ({ roomId, state }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.host !== socket.id) {
      return;
    }

    room.state = state;
    io.to(roomId).emit("worldState", state);
  });

  socket.on("leaveRoom", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    delete room.players[socket.id];
    socket.leave(roomId);
    updateLobby(roomId);
    deleteRoomIfEmpty(roomId);
  });

  socket.on("deleteRoom", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.host !== socket.id) {
      return;
    }

    deleteRoom(roomId);
  });

  socket.on("kickPlayer", ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.host !== socket.id) {
      return;
    }

    if (!room.players[playerId] || playerId === room.host) {
      return;
    }

    delete room.players[playerId];

    const kickedSocket = io.sockets.sockets.get(playerId);
    if (kickedSocket) {
      kickedSocket.leave(roomId);
      kickedSocket.emit("playerKicked", { roomId, playerId });
    }

    updateLobby(roomId);
    deleteRoomIfEmpty(roomId);
  });

  socket.on("matchEnded", ({ roomId, result }) => {
    const room = rooms[roomId];
    if (!room || room.host !== socket.id) {
      return;
    }

    room.started = false;
    room.matchResult = result;

    io.to(roomId).emit("matchEnded", {
      roomId,
      result,
    });
  });

  /* -------------------------
     DISCONNECT
  ------------------------- */
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.players[socket.id]) {
        delete room.players[socket.id];

        updateLobby(roomId);

        deleteRoomIfEmpty(roomId);
      }
    }
  });
});

/* =========================
   START SERVER
========================= */

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
