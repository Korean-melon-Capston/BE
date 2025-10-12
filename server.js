const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT

const sampleRoutes = require("./routes/sampleRoutes");
const authRoutes = require('./routes/authRoutes');
const mypageRoutes = require("./routes/mypageRoutes");


app.use(cors());
app.use(express.json());
app.use('/api', sampleRoutes);
app.use('/auth', authRoutes);
app.use("/mypage", mypageRoutes);


// Swagger setup
require('./swagger/swagger')(app);

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