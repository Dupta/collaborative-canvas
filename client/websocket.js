// client/websocket.js
// console.log("Connecting to socket server...");

const socket = io();
const userId = "u_" + Math.random().toString(36).slice(2, 6);
const userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
const room = "main";

const cursorsDiv = document.getElementById("cursors");
const remoteCursors = {};
const remoteNames = {};
const activeStrokes = {};

//Connection events
socket.on("connect", () => {
  //   console.log("Connected to server with ID:", socket.id);
  if (window.updateConnectionStatus) window.updateConnectionStatus(true);
  socket.emit("join", { userId, color: userColor, room });
});

socket.on("disconnect", () => {
  //   console.log("Disconnected from server");
  if (window.updateConnectionStatus) window.updateConnectionStatus(false);
});

//DRAWING EVENTS
window.sendStroke = (stroke) =>
  socket.emit("draw:stroke", { stroke, userId, room });
window.sendStrokeStart = (data) => socket.emit("draw:start", data);
window.sendStrokeSegment = (data) => socket.emit("draw:segment", data);
window.sendStrokeEnd = (data) => socket.emit("draw:end", data);

//CURSOR EVENTS
window.sendCursor = (pos) =>
  socket.emit("cursor:move", { userId, pos, room, color: userColor });

//DRAWING STATUS EVENTS
window.sendDrawingStatus = (isDrawing) => {
  socket.emit("user:drawing", { userId, isDrawing, room });
};

//UNDO / REDO
window.sendUndo = function (opId) {
  socket.emit("op:undo", { userId, opId, room });
};
window.sendRedo = function (op) {
  socket.emit("op:redo", { userId, op, room });
};

window.sendDrawingStatus = function (isDrawing) {
  socket.emit("user:drawing", { userId, isDrawing, room });
};

//INITIAL CANVAS STATE
socket.on("state:init", (data) => {
  const ops = data.operations || [];
  if (window.CanvasModule) window.CanvasModule.applyFullState(ops);
});
//REDO EVENTS
socket.on("op:redo", ({ userId, op, room = "main" }) => {
  io.to(room).emit("op:redo", { userId, op });
});

//STROKES FROM OTHERS
socket.on("draw:stroke", (data) => {
  if (!data || !data.stroke) return;
  if (data.userId === userId) return;
  if (window.CanvasModule) window.CanvasModule.applyRemoteOp(data.stroke);
});

//STATE UPDATES (Undo/Redo Sync)
socket.on("state:update", (data) => {
  if (window.CanvasModule && data.operations)
    window.CanvasModule.applyFullState(data.operations);
});

//USER LIST UPDATES
socket.on("users:update", (users) => updateUserList(users));

//REMOTE CURSORS + FLOATING NAMES
socket.on("cursor:update", ({ userId: uid, pos, color }) => {
  if (uid === userId) return;

  // create cursor dot if not exists
  if (!remoteCursors[uid]) {
    const dot = document.createElement("div");
    dot.className = "remote-cursor";
    dot.style.background = color || "#000";
    cursorsDiv.appendChild(dot);
    remoteCursors[uid] = dot;
  }

  // create name label if not exists
  if (!remoteNames[uid]) {
    const label = document.createElement("div");
    label.className = "remote-name";
    label.textContent = uid;
    label.style.background = color || "#000";
    cursorsDiv.appendChild(label);
    remoteNames[uid] = label;
  }

  // position both cursor & label
  const dot = remoteCursors[uid];
  const label = remoteNames[uid];

  dot.style.left = pos.x + "px";
  dot.style.top = pos.y + "px";
  label.style.left = pos.x + 14 + "px";
  label.style.top = pos.y - 10 + "px";
});

//SHOW/HIDE NAME WHEN DRAWING
socket.on("user:drawing", ({ userId: uid, isDrawing }) => {
  if (uid === userId) return;
  const label = remoteNames[uid];
  const userEl = document.querySelector(`[data-user-id="${uid}"]`);
  if (!label) return;

  // update floating name visibility
  if (isDrawing) {
    label.classList.add("active");
  } else {
    label.classList.remove("active");
  }

  // update dropdown indicator
  if (userEl) {
    const indicator = userEl.querySelector(".user-indicator");
    if (isDrawing) {
      userEl.classList.add("drawing-active");
      if (indicator) indicator.textContent = "✏️";
    } else {
      userEl.classList.remove("drawing-active");
      if (indicator) indicator.textContent = "";
    }
  }
});

//STREAMED DRAWING EVENTS (REAL-TIME)
socket.on("draw:start", ({ userId, x, y, color, width, tool }) => {
  activeStrokes[userId] = { x, y, color, width, tool };
});

socket.on("draw:segment", ({ userId, from, to, color, width, tool }) => {
  const ctx = document.getElementById("drawing-board").getContext("2d");
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalCompositeOperation =
    tool === "eraser" ? "destination-out" : "source-over";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
});

socket.on("draw:end", ({ userId }) => {
  delete activeStrokes[userId];
});

//UPDATE USER LIST DISPLAY
function updateUserList(users = []) {
  const ul = document.getElementById("user-list");
  if (!ul) return;
  ul.innerHTML = "";

  users.forEach((u) => {
    const li = document.createElement("li");
    li.setAttribute("data-user-id", u.userId);

    const dot = document.createElement("span");
    dot.className = "user-dot";
    dot.style.background = u.color || "#333";
    li.appendChild(dot);

    const indicator = document.createElement("span");
    indicator.className = "user-indicator";
    indicator.textContent = "";
    li.appendChild(indicator);

    const name = u.userId === userId ? "You" : u.userId;
    li.appendChild(document.createTextNode(" " + name));
    ul.appendChild(li);
  });

  const countElem = document.getElementById("user-count");
  if (countElem) countElem.textContent = users.length.toString();
}

//LATENCY PING
setInterval(() => {
  const start = Date.now();
  socket.emit("ping");
  socket.once("pong", () => {
    const ms = Date.now() - start;
    const latencyElem = document.getElementById("latency");
    if (latencyElem) latencyElem.textContent = `Ping: ${ms}ms`;
  });
}, 5000);

//DROPDOWN TOGGLE
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("user-toggle");
  const list = document.getElementById("user-list");

  if (!toggle || !list) return;
  list.classList.add("hidden");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    list.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !list.contains(e.target)) {
      list.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") list.classList.add("hidden");
  });
});
