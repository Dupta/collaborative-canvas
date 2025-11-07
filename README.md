# 🎨 Collaborative Canvas

A **real-time collaborative drawing board** built using **Node.js**, **Express**, **Socket.IO**, and **HTML5 Canvas**.  
Multiple users can draw together live — every stroke, cursor move, and erase action is synced instantly.

---

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Live-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Deployed on Render](https://img.shields.io/badge/Render-Deployed-success)

---

## 🚀 Live Demo

🔗 **[Click here to try it live](https://collaborative-canvas-oqtg.onrender.com)**  
_(Open in two tabs or devices to see real-time collaboration!)_

---

## 🧩 Features

- 🖌️ **Drawing Tools** — Brush, eraser, stroke width, and color selection
- ⚡ **Real-Time Sync** — Instant updates across users using WebSockets
- ✏️ **Active User Indicators** — See who’s drawing live (name floating near their cursor)
- 🔄 **Undo / Redo** — Works globally for all users
- 👥 **User Management** — Shows total users + dropdown with color indicators
- 📱 **Cross-Device** — Works seamlessly on desktop and mobile browsers

---

## 🧰 Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| **Frontend**   | HTML, CSS, JavaScript (Canvas API) |
| **Backend**    | Node.js, Express.js, Socket.IO     |
| **Deployment** | Render (Web Service)               |
| **Protocol**   | WebSockets                         |

---

🧱 Folder Structure
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

## ⚙️ Setup Instructions

Clone the repository and install dependencies:

```bash
git clone https://github.com/Dupta/collaborative-canvas.git
cd collaborative-canvas
npm install
npm start

## Then open:
http://localhost:3000

# 🧪 Testing with Multiple Users

Run the app locally or open your deployed link.

Open it in **two or more browsers (or devices)**.

Draw on one screen → updates appear **instantly** on all others.

## 🎨 Test Features

- ✏️ Brush and eraser
- 🎨 Color and stroke width
- ↩️ Undo / Redo (global)
- 👥 Live user list and cursor indicators

✅ Works on **Chrome**, **Firefox**, and **Safari**.

---

## 🧩 Known Limitations / Bugs

- ⏱️ Minor delay (~100–200 ms) depending on network latency.
- 🔁 Undo/Redo actions apply **globally across users**.
- 💤 Free Render tier may cause **short startup delay after inactivity**.
- 🧼 Canvas is **not persistent** (refresh clears drawings).

## 🕒 Time Spent

| Task | Time |
|------|------|
| Canvas implementation & drawing tools | 4 hours |
| Real-time synchronization (Socket.IO) | 5 hours |
| Undo/Redo + user management | 3 hours |
| UI design & styling | 2 hours |
| Debugging & deployment (Render) | 3 hours |
| **Total** | **~17 hours** |

## 💡 Future Improvements

- 💾 Add persistent canvas saving using **MongoDB** or **Firebase**.
- 🔐 Implement **authentication** and individual user profiles.
- 🏠 Support **multiple “rooms”** for separate drawing sessions.
- 📊 Integrate **latency visualization** (ping/fps monitor).
- 📱 Improve **mobile touch support** and optimize drawing performance.

```


