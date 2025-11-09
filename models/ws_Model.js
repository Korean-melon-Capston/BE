import WebSocket from "ws";

const MODEL_SERVER_URL = "ws://localhost:8000/ws/stream";

export function connectToModelServer() {
  const modelSocket = new WebSocket(MODEL_SERVER_URL);

  modelSocket.on("open", () => {
    console.log("✅ Connected to model server");
  });

  modelSocket.on("close", () => {
    console.log("🔌 Model server connection closed");
  });

  modelSocket.on("error", (err) => {
    console.error("🚨 Model server WebSocket error:", err);
  });

  return modelSocket;
}

export function sendFrameToModel(modelSocket, frameData) {
  try {
    if (modelSocket.readyState === WebSocket.OPEN) {
      modelSocket.send(frameData);
    } else {
      console.warn("⚠️ Model server WebSocket not ready");
    }
  } catch (err) {
    console.error("🚨 Error sending frame to model server:", err);
  }
}