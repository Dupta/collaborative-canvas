(function () {
  const canvas = document.getElementById("drawing-board");
  const ctx = canvas.getContext("2d");

  // Drawing state
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentStroke = null;

  // Tool state
  let tool = "brush";
  let color = "#000000";
  let widthVal = 4;

  // Operation history
  const operations = [];
  const redoStack = [];
  const appliedOpIds = new Set();

  //setup canvas size
  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    redrawAll(operations);
  }

  window.addEventListener("resize", fitCanvas);
  setTimeout(fitCanvas, 100);

  //initializations and setters
  function setTool(t) {
    tool = t;
  }

  function setColor(c) {
    color = c;
  }

  function setWidth(w) {
    widthVal = w;
  }

  //draw logic how to draw the lines
  function generateId() {
    return "op_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  }

  function startStroke(x, y) {
    drawing = true;
    if (window.sendDrawingStatus) window.sendDrawingStatus(true);

    lastX = x;
    lastY = y;

    currentStroke = {
      id: generateId(),
      tool,
      color,
      width: widthVal,
      points: [{ x, y }],
    };

    if (window.sendStrokeStart) {
      window.sendStrokeStart({
        userId: window.userId || "unknown",
        color,
        width: widthVal,
        tool,
        x,
        y,
        room: "main",
      });
    }
  }

  function continueStroke(x, y) {
    if (!drawing || !currentStroke) return;

    drawSegment({
      from: { x: lastX, y: lastY },
      to: { x, y },
      color,
      width: widthVal,
      tool,
    });

    currentStroke.points.push({ x, y });

    if (window.sendStrokeSegment) {
      window.sendStrokeSegment({
        userId: window.userId || "unknown",
        from: { x: lastX, y: lastY },
        to: { x, y },
        color,
        width: widthVal,
        tool,
        room: "main",
      });
    }

    if (window.sendCursor) window.sendCursor({ x, y });

    lastX = x;
    lastY = y;
  }

  function endStroke() {
    if (!drawing || !currentStroke) return;

    drawing = false;
    if (window.sendDrawingStatus) window.sendDrawingStatus(false);

    operations.push(currentStroke);
    redoStack.length = 0; //clear redo when new stroke starts

    if (window.sendStrokeEnd) {
      window.sendStrokeEnd({
        userId: window.userId || "unknown",
        stroke: currentStroke,
        room: "main",
      });
    }

    currentStroke = null;
  }

  //drawing segment logic
  function drawSegment({ from, to, color, width, tool }) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineWidth = width;

    //Interpolate points for smoother curve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / 2); // smaller divisor = smoother

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = from.x + (dx * i) / steps;
      const y = from.y + (dy * i) / steps;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.closePath();
  }

  function redrawAll(ops) {
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const op of ops) {
      if (!op.points || op.points.length < 2) continue;

      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = op.width;
      ctx.strokeStyle = op.color;
      ctx.globalCompositeOperation =
        op.tool === "eraser" ? "destination-out" : "source-over";

      ctx.moveTo(op.points[0].x, op.points[0].y);
      for (let i = 1; i < op.points.length; i++) {
        ctx.lineTo(op.points[i].x, op.points[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  //mouse click and movement handlers
  function toCanvasCoords(e) {
    const r = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - r.left, y: clientY - r.top };
  }

  canvas.addEventListener("mousedown", (e) => {
    const p = toCanvasCoords(e);
    startStroke(p.x, p.y);
  });

  canvas.addEventListener("mousemove", (e) => {
    const p = toCanvasCoords(e);
    continueStroke(p.x, p.y);
  });

  window.addEventListener("mouseup", endStroke);
  canvas.addEventListener("mouseleave", endStroke);

  // Touch support
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      const p = toCanvasCoords(e);
      startStroke(p.x, p.y);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const p = toCanvasCoords(e);
      continueStroke(p.x, p.y);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      endStroke();
    },
    { passive: false }
  );

  //undo and redo logic
  function undoLocal() {
    if (window.sendUndo) {
      window.sendUndo();
      console.log("[client] Requested global undo");
    }
  }

  function redoLocal() {
    if (window.sendRedo) {
      window.sendRedo();
      console.log("[client] Requested global redo");
    }
  }

  //sync operations from server
  function applyRemoteOp(op) {
    if (!op || !op.id) return;
    if (appliedOpIds.has(op.id)) return;
    appliedOpIds.add(op.id);
    operations.push(op);
    redrawAll(operations);
  }

  function applyFullState(ops) {
    appliedOpIds.clear();
    operations.length = 0;
    if (Array.isArray(ops)) {
      ops.forEach((o) => {
        if (o && o.id) appliedOpIds.add(o.id);
        operations.push(o);
      });
    }
    redrawAll(operations);
  }

  //api
  window.CanvasModule = {
    setTool,
    setColor,
    setWidth,
    undoLocal,
    redoLocal,
    applyRemoteOp,
    applyFullState,
    redrawAll,
    getOperations: () => operations,
  };
})();
