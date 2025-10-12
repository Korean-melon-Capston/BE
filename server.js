const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const sampleRoutes = require("./routes/sampleRoutes");
const authRoutes = require('./routes/authRoutes');

app.use(cors());
app.use(express.json());

app.use('/api', sampleRoutes);
app.use('/auth', authRoutes); // 구글 인증 라우트

app.use(express.static(path.join(__dirname, 'web')));

// Swagger setup
require('./swagger/swagger')(app);

// 두 기능에 대한 안내를 모두 포함하도록 기본 경로 핸들러를 수정합니다.
app.get("/", (req, res) => {
    res.send(`
        <h1>베이비모니터링 API 서버입니다.</h1>
        <p>Swagger API 문서는 <a href="/api-docs">/api-docs</a> 에서 확인하세요.</p>
        <p>Google 로그인 테스트는 <a href="/auth/google">/auth/google</a> 에서 할 수 있습니다.</p>
    `);
});

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