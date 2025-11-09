// server.js (ESM version)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import jwt from "jsonwebtoken";
import { initWebSocketServer } from "./routes/ws_Routes.js";
import { connectToModelServer } from "./models/ws_Model.js";
import authRoutes from "./routes/authRoutes.js";
import mypageRoutes from "./routes/mypageRoutes.js";
import swaggerSetup from "./swagger/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/mypage", mypageRoutes);


// Swagger setup
swaggerSetup(app);

const server = http.createServer(app);
initWebSocketServer(server);

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

// ✅ FastAPI 모델 서버 자동 연결
connectToModelServer();