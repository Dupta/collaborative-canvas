class RoomManager {
  constructor() {
    this.rooms = {}; // { roomName: [ { socketId, userId, color } ] }
  }

  addUser(room, user) {
    this.rooms[room] = this.rooms[room] || [];
    // remove existing same socketId if present
    this.rooms[room] = this.rooms[room].filter(
      (u) => u.socketId !== user.socketId
    );
    this.rooms[room].push(user);
  }

  removeBySocket(socketId) {
    for (const room of Object.keys(this.rooms)) {
      this.rooms[room] = this.rooms[room].filter(
        (u) => u.socketId !== socketId
      );
      if (this.rooms[room].length === 0) delete this.rooms[room];
    }
  }

  getUsers(room) {
    this.rooms[room] = this.rooms[room] || [];
    return this.rooms[room].map((u) => ({ userId: u.userId, color: u.color }));
  }
}

module.exports = { RoomManager };
