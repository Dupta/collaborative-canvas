class DrawingState {
  constructor() {
    // per-room operation lists
    this.roomOps = {}; // { roomName: [ op1, op2, ... ] }
  }

  addOperation(room, op) {
    this.roomOps[room] = this.roomOps[room] || [];
    this.roomOps[room].push(op);
  }

  getOperations(room) {
    this.roomOps[room] = this.roomOps[room] || [];
    return this.roomOps[room];
  }

  undoOperation(room, opId) {
    this.roomOps[room] = this.roomOps[room] || [];
    if (!opId) {
      // default: pop last op
      this.roomOps[room].pop();
      return;
    }
    const idx = this.roomOps[room].findIndex((o) => o.id === opId);
    if (idx >= 0) this.roomOps[room].splice(idx, 1);
  }

  clearRoom(room) {
    this.roomOps[room] = [];
  }
}

module.exports = { DrawingState };
