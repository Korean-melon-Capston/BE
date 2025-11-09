// middlewares/auth.js

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // .env에서 JWT_SECRET을 불러오기 위해 필요

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Authorization 헤더가 존재하고 Bearer 토큰 형식인지 확인
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 정보를 req.user에 저장
    req.user = decoded;

    next(); // 다음 미들웨어 또는 라우트 핸들러로
  } catch (err) {
    console.error("JWT 인증 실패:", err);
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export default auth;