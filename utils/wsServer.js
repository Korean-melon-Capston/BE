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
