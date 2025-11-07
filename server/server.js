const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "..", "client")));

// Track connected users
let users = {}; // socket.id -> { userId, color, room }

io.on("connection", (socket) => {
  //   console.log("User connected:", socket.id);

  //User joins a room
  socket.on("join", ({ userId, color, room = "main" }) => {
    socket.join(room);
    users[socket.id] = { userId, color, room };

    // Broadcast the updated user list to everyone in the room
    io.to(room).emit(
      "users:update",
      Object.values(users).filter((u) => u.room === room)
    );

    // console.log(`[JOIN] ${userId} joined room: ${room}`);
  });

  //User drawing status (start/stop drawing)
  socket.on("user:drawing", ({ userId, isDrawing, room = "main" }) => {
    socket.to(room).emit("user:drawing", { userId, isDrawing });
  });

  //Cursor movement updates
  socket.on("cursor:move", ({ userId, pos, room = "main", color }) => {
    socket.to(room).emit("cursor:update", { userId, pos, color });
  });

  //Real-time drawing stream events
  socket.on("draw:start", (data) => {
    socket.to(data.room || "main").emit("draw:start", data);
  });

  socket.on("draw:segment", (data) => {
    socket.to(data.room || "main").emit("draw:segment", data);
  });

  socket.on("draw:end", (data) => {
    socket.to(data.room || "main").emit("draw:end", data);
  });

  //Undo/Redo events
  socket.on("op:undo", ({ userId, opId, room = "main" }) => {
    io.to(room).emit("op:undo", { userId, opId });
  });

  socket.on("op:redo", ({ userId, op, room = "main" }) => {
    io.to(room).emit("op:redo", { userId, op });
  });

  //Disconnect cleanup
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.userId} disconnected`);
      delete users[socket.id];

      // Update the remaining users in the same room
      io.to(user.room).emit(
        "users:update",
        Object.values(users).filter((u) => u.room === user.room)
      );
    } else {
      console.log("Unknown user disconnected:", socket.id);
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
