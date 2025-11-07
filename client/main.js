document.addEventListener("DOMContentLoaded", () => {
  const brushBtn = document.getElementById("brush");
  const eraserBtn = document.getElementById("eraser");
  const colors = document.querySelectorAll(".color");
  const strokeRange = document.getElementById("stroke-size");
  const strokeValue = document.getElementById("stroke-value");
  const undoBtn = document.getElementById("undo");
  const redoBtn = document.getElementById("redo");
  const clearBtn = document.getElementById("clear");
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.getElementById("connection-status");

  // Tools
  brushBtn.addEventListener("click", () => {
    CanvasModule.setTool("brush");
    brushBtn.classList.add("active");
    eraserBtn.classList.remove("active");
  });

  eraserBtn.addEventListener("click", () => {
    CanvasModule.setTool("eraser");
    eraserBtn.classList.add("active");
    brushBtn.classList.remove("active");
  });

  // Colors
  colors.forEach((c) => {
    c.addEventListener("click", () => {
      CanvasModule.setColor(c.dataset.color);
      colors.forEach((cc) => (cc.style.outline = ""));
      c.style.outline = "2px solid #6c5ce7";
    });
  });

  // Stroke width
  strokeRange.addEventListener("input", (e) => {
    const w = e.target.value;
    CanvasModule.setWidth(parseInt(w, 10));
    strokeValue.textContent = `${w}px`;
  });

  // Undo
  undoBtn.addEventListener("click", () => CanvasModule.undoLocal());
  //redo format corrected code
  redoBtn.addEventListener("click", () => {
    console.log("Redo clicked!");
    CanvasModule.redoLocal();
  });
  //clear part
  clearBtn.addEventListener("click", () => {
    const ctx = document.getElementById("drawing-board").getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });

  // Show connection state (websocket.js will update)
  window.updateConnectionStatus = function (connected) {
    statusDot.style.background = connected ? "#2ecc71" : "#95a5a6";
    statusText.textContent = connected ? "Connected" : "Disconnected";
  };
});
