import { connectToModelServer, sendFrameToModel } from "../models/ws_Model.js";

export function handleClientConnection(clientSocket) {
  console.log("📡 Client connected to webserver");

  // 모델 서버 연결
  const modelSocket = connectToModelServer();

  // 모델 서버 연결 성공 로그
  modelSocket.on("open", () => {
    console.log("✅ Connected to FastAPI model server");
  });

  // 클라이언트 → 웹서버 → 모델서버
  clientSocket.on("message", (data) => {
    console.log("📩 Received from client:", data.toString().slice(0, 50)); // 앞부분만 출력
    sendFrameToModel(modelSocket, data);
  });

  // 모델서버 → 웹서버 → 클라이언트
  modelSocket.on("message", (msg) => {
    console.log("📦 Received from model server:", msg.toString().slice(0, 50)); // 앞부분만 출력
    clientSocket.send(msg);
  });

  // 연결 종료 처리
  clientSocket.on("close", () => {
    console.log("❌ Client disconnected");
    modelSocket.close();
  });

  // 모델 서버 에러 로그
  modelSocket.on("error", (err) => {
    console.error("❌ Model server connection error:", err.message);
  });
}