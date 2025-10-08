const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT

// --- 라우트 가져오기 ---
const sampleRoutes = require("./routes/sampleRoutes");
const authRoutes = require('./routes/authRoutes');     // << auth 연결 추가
const userRoutes = require('./routes/userRoutes');     // << user 연결 추가

// --- 미들웨어 설정 ---
app.use(cors());
app.use(express.json());

// --- API 라우트 등록 ---
app.use('/api', sampleRoutes);
app.use('/api/auth', authRoutes); // << 예서 추가 (Google 로그인 API)
app.use('/api/users', userRoutes); // << 예서 추가 (인증이 필요한 사용자 정보 API)

// Swagger setup
require('./swagger/swagger')(app);

// --- 서버 실행 ---
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});


/////
const jwt = require("jsonwebtoken");

const devToken = jwt.sign(
    { id: 2, name: "테스트유저" },         // 👉 Payload (유저 정보)
    process.env.JWT_SECRET,               // 👉 비밀 키 (서명용)
    { expiresIn: "7d" }                   // 👉 유효 기간
);

console.log("\n🧪 개발용 토큰:");
console.log(`${devToken}\n`);

app.get("/", (req, res) => {
    res.send("베이비모니터링 API 서버입니다. Swagger는 /api-docs 에 있습니다.");
});