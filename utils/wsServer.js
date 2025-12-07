// utils/wsServer.js
import { WebSocketServer, WebSocket } from "ws";

let wss = null;

/**
 * HTTP 서버에 WebSocket 서버 붙이기
 * - server.js에서 createServer(app) 한 뒤에 딱 한 번 호출
 */
export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    console.log("🔗 WebSocket 클라이언트 접속");

    socket.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // 아기폰이 보내는 형식: { type: "frame", imageBase64: "..." }
        if (msg.type === "frame" && msg.imageBase64) {
          // 🔥 모든 클라이언트(=부모폰들)에게 프레임 브로드캐스트
          broadcastRaw({
            type: "frame",
            imageBase64: msg.imageBase64,
          });
        }

        // 나중에 확장: motion, fall 등도 여기에서 처리 가능
        // if (msg.type === "motion") { ... }
        // if (msg.type === "fall") { ... }

      } catch (e) {
        console.log("📩 WS raw message:", data.toString());
      }
    });

    socket.on("close", () => {
      console.log("❌ WebSocket 클라이언트 종료");
    });

    socket.on("error", (err) => {
      console.error("⚠️ WebSocket error:", err.message);
    });
  });

  console.log("✅ WebSocket 서버 초기화 완료");
}

function broadcastRaw(obj) {
  if (!wss) return;

  const data = JSON.stringify(obj);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ====== 외부에서 모델 결과/이벤트를 부모폰으로 보내기 위한 헬퍼 ======

/**
 * 모델 추론 결과(키포인트, 바운딩 박스)를 부모 웹소켓 클라이언트들에게 브로드캐스트
 * - controller에서 모델 서버 응답 받은 후 호출
 */
export function broadcastPose({ bboxes, keypoints, timestamp }) {
  if (!wss) return;

  const data = JSON.stringify({
    type: "pose",
    bboxes: bboxes || [],
    keypoints: keypoints || [],
    timestamp: timestamp || Date.now(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * 낙상(혹은 고위험자세) 이벤트를 부모 웹소켓 클라이언트들에게 브로드캐스트
 */
export function broadcastFallEvent(confidence, extra = {}) {
  if (!wss) return;

  const data = JSON.stringify({
    type: "fall",
    confidence: confidence ?? null,
    timestamp: Date.now(),
    ...extra,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * 뒤척임(모션) 강도 정보를 부모 웹소켓 클라이언트들에게 브로드캐스트
 */
export function broadcastMotion({ movement, timestamp, turnCount }) {
  if (!wss) return;

  const data = JSON.stringify({
    type: "motion",
    movement: movement ?? 0,
    timestamp: timestamp ?? Date.now(),
    turnCount: turnCount ?? 0,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
