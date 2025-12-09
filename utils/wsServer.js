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

        // 아기폰이 WS 로 직접 프레임을 보낼 경우
        if (msg.type === "frame" && msg.imageBase64) {
          console.log("📥 [WS] frame 수신 → 브로드캐스트");
          broadcastFrame({
            imageBase64: msg.imageBase64,
            timestamp: msg.timestamp,
          });
        }

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



/** 공통 브로드캐스트 헬퍼 */
function broadcastRaw(obj) {
  if (!wss) return;

  const data = JSON.stringify(obj);
  let count = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
      count++;
    }
  });

  console.log(`📡 [WS] broadcastRaw → type: ${obj.type}, 전송 대상: ${count}명`);
}



/**
 * 🔹 아기폰 프레임을 부모폰으로 브로드캐스트
 *  - type: "frame"
 */
export function broadcastFrame({ imageBase64, timestamp }) {
  if (!imageBase64) {
    console.log("⚠️ broadcastFrame 호출됨: imageBase64 없음");
    return;
  }

  console.log("📤 [WS] broadcastFrame 실행");

  broadcastRaw({
    type: "frame",
    imageBase64,
    timestamp: timestamp ?? Date.now(),
  });
}



/**
 * 🔹 모델 추론 결과(키포인트, 바운딩 박스)를 부모 웹소켓 클라이언트들에게 브로드캐스트
 * - type: "pose"
 */
export function broadcastPose({ bboxes, keypoints, timestamp }) {
  console.log("📤 [WS] broadcastPose 실행 (bbox:", bboxes?.length ?? 0, ")");

  broadcastRaw({
    type: "pose",
    bboxes: bboxes || [],
    keypoints: keypoints || [],
    timestamp: timestamp || Date.now(),
  });
}



/**
 * 🔹 낙상(혹은 고위험자세) 이벤트 브로드캐스트
 * - type: "fall"
 */
export function broadcastFallEvent(confidence, extra = {}) {
  console.log("📤 [WS] broadcastFallEvent 실행");

  broadcastRaw({
    type: "fall",
    confidence: confidence ?? null,
    timestamp: Date.now(),
    ...extra,
  });
}



/**
 * 🔹 뒤척임(모션) 강도 정보를 브로드캐스트
 * - type: "motion"
 */
export function broadcastMotion({ movement, timestamp, turnCount }) {
  console.log(
    `📤 [WS] broadcastMotion 실행 (movement: ${movement}, turnCount: ${turnCount})`
  );

  broadcastRaw({
    type: "motion",
    movement: movement ?? 0,
    timestamp: timestamp ?? Date.now(),
    turnCount: turnCount ?? 0,
  });
}
