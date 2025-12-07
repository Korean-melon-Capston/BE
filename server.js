// server.js (ESM version)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import jwt from "jsonwebtoken";

<<<<<<< Updated upstream
// Routes
=======
>>>>>>> Stashed changes
import authRoutes from "./routes/authRoutes.js";
import mypageRoutes from "./routes/mypageRoutes.js";
import motionRoutes from "./routes/motionRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import swaggerSetup from "./swagger/swagger.js";
import babyinfoRoutes from "./routes/babyinfoRoutes.js";
import babyinfofixRoutes from "./routes/babyinfofixRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import eventLogRoutes from "./routes/eventRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";

<<<<<<< Updated upstream
=======
// 🔹 추가: WebSocket 초기화 함수
import { initWebSocket } from "./utils/wsServer.js";

>>>>>>> Stashed changes
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

<<<<<<< Updated upstream
// JSON 설정 (중복 제거)
=======
// 큰 base64 이미지 받으려면 limit 키우는 거 유지
>>>>>>> Stashed changes
app.use(express.json({ limit: "10mb" }));
app.use(cors());
<<<<<<< Updated upstream

// Routes Mounting
=======
// 아래 줄은 사실 중복이라 지워도 됨
// app.use(express.json());

>>>>>>> Stashed changes
app.use("/auth", authRoutes);
app.use("/mypage", mypageRoutes);
app.use("/motion", motionRoutes);
app.use("/calendar", calendarRoutes);
app.use("/baby", babyinfoRoutes);
app.use("/babyfix", babyinfofixRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/reports", reportRoutes);
app.use("/eventlog", eventLogRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/notify", notificationRoutes);
app.use("/api/model", modelRoutes);

// Swagger
swaggerSetup(app);

const server = http.createServer(app);

// 🔥 여기서 WebSocket 서버 초기화 (단 한 번)
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});

// 개발용 JWT 토큰 생성
const devToken = jwt.sign(
  { id: 2, name: "테스트유저" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

console.log("\n🧪 개발용 토큰:");
console.log(`${devToken}\n`);

app.get("/", (req, res) => {
  res.send("베이비모니터링 API 서버입니다. Swagger는 /api-docs 에 있습니다.");
});
