// server.js (ESM version)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import jwt from "jsonwebtoken";
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
import modelRoutes from "./routes/modelRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

app.use(cors());
app.use(express.json());
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
app.use("/api/model", modelRoutes);

// Swagger setup
swaggerSetup(app);


const server = http.createServer(app);

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
