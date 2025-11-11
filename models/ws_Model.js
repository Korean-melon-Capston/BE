import WebSocket from "ws";

const MODEL_SERVER_URL = "ws://localhost:8000/ws/stream";

// 최신 추론 결과 저장용 전역 변수
let latestResult = { bboxes: [], keypoints: [] };

export function connectToModelServer() {
  const modelSocket = new WebSocket(MODEL_SERVER_URL);

  modelSocket.on("open", () => {
    console.log("✅ Connected to model server");
  });

  modelSocket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      latestResult = data; // 최신 결과 갱신
      console.log(
        `📩 Received result — Boxes: ${data?.bboxes?.length || 0}, Keypoints: ${data?.keypoints?.length || 0}`
      );
    } catch (err) {
      console.error("🚨 Error parsing message from model server:", err);
    }
  });

  modelSocket.on("close", () => {
    console.log("🔌 Model server connection closed");
  });

  modelSocket.on("error", (err) => {
    console.error("🚨 Model server WebSocket error:", err);
  });

  return modelSocket;
}

// 최신 결과를 외부 컨트롤러에서 접근 가능하게 export
export function getLatestResult() {
  return latestResult;
}