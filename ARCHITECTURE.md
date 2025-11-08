# Collaborative Canvas – Architecture Documentation

---

## Overview

The **Collaborative Canvas** is a real-time, multi-user drawing application built using **Node.js**, **Express**, and **Socket.IO**.  
It allows multiple users to draw on a shared canvas simultaneously with **live updates**, **cursor tracking**, and **global undo/redo** functionality.

Each user action — like drawing a line, changing color, or erasing — is broadcast through a **WebSocket connection**, ensuring that all connected clients stay perfectly synchronized.

---

## Data Flow Diagram

User Draws  
↓  
Canvas (Client)  
↓  
Socket.IO emits event  
↓  
Server receives event  
↓  
Broadcasts to all other clients  
↓  
Other clients render stroke live

---

## WebSocket Protocol

The system uses **Socket.IO** for all real-time communication between the server and clients.

| **Event** | **Direction** | **Purpose** |
|------------|---------------|--------------|
| `join` | client → server | Sent when a user joins; server registers user ID and color |
| `users:update` | server → all | Sends updated list of online users |
| `cursor:move` | client ↔ all | Tracks real-time mouse/cursor position |
| `user:drawing` | client ↔ all | Indicates which user is currently drawing |
| `draw:start` | client ↔ all | Indicates drawing has started (stroke initialization) |
| `draw:segment` | client ↔ all | Sends intermediate line points while drawing |
| `draw:end` | client ↔ all | Ends stroke and adds it to operation list |
| `op:undo` | client ↔ all | Removes last stroke globally |
| `op:redo` | client ↔ all | Reapplies last undone stroke globally |

---

## Undo/Redo Strategy

Each completed stroke is treated as a **unique operation** identified by a generated `op_id`.  
The client keeps two stacks:
- `operations[]` → all strokes currently visible  
- `redoStack[]` → temporarily stores undone strokes  

### Logic Flow:
1. When a user performs undo:  
   - The last stroke is removed from `operations[]`  
   - Pushed into `redoStack[]`  
   - Server broadcasts an `op:undo` event to update others  

2. When a user performs redo:  
   - The last stroke is popped from `redoStack[]`  
   - Added back to `operations[]`  
   - Server broadcasts `op:redo` to all users  

This ensures all clients stay synchronized and maintain a **shared global canvas state**.

---

## Performance Optimizations

To maintain **smooth real-time drawing**, several optimizations were implemented:

- **WebSocket-only Transport**  
  Configured Socket.IO to use pure WebSockets for lower latency (`transports: ["websocket"]`).

- **Incremental Rendering**  
  Instead of redrawing the full canvas, only new stroke segments are rendered.

- **Cursor Throttling**  
  Limits how often cursor position updates are sent (reduces bandwidth).

- **Compression Disabled**  
  Disabling WebSocket compression reduces delay on small, frequent messages.

- **Lightweight DOM Usage**  
  Canvas drawing done directly via context — no heavy DOM reflows or layout thrashing.

---

## Conflict Resolution

When multiple users draw simultaneously:
- Each user’s stroke is treated as an **independent operation**.
- The server relays all strokes to every connected client in the **same order received**.
- Overlapping drawings simply blend visually (canvas compositing ensures correct layering).
- Undo/Redo are **global operations** — when triggered, they apply the same state across all clients to maintain consistency.

---

## Folder Structure

collaborative-canvas/
├── client/
│ ├── index.html # Frontend UI
│ ├── style.css # Toolbar & layout styling
│ ├── canvas.js # Canvas rendering & drawing logic
│ ├── websocket.js # Real-time event handling (Socket.IO)
│ └── main.js # UI bindings and tool interactions
│
├── server/
│ └── server.js # Express + Socket.IO backend
│
├── package.json # Project metadata & dependencies
├── README.md # Main documentation
└── ARCHITECTURE.md # System design explanation


---

## Component Interaction


Client (Browser)
├── index.html
├── canvas.js ← handles drawing & sends strokes
├── websocket.js ← opens socket connection & syncs data
└── main.js ← manages tools, colors, and UI

Server (Node.js)
├── Express server serves static files
├── Socket.IO handles user events
└── Broadcasts drawing updates to all clients


---

## Summary

The **Collaborative Canvas** demonstrates how **Socket.IO** can be used to create a **real-time, low-latency multi-user experience**.  
The architecture prioritizes:
- **Synchronized state** (every user sees the same canvas)  
- **Low latency** (via WebSockets and incremental updates)  
- **Simple conflict handling** (first-come message ordering)  
- **Scalability-ready design** (room-based broadcasting possible)

This architecture balances simplicity, interactivity, and performance to enable seamless collaborative drawing.

