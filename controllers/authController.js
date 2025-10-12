require("dotenv").config();
const axios = require("axios");
const User = require("../models/userModel");
const { createToken } = require("../utils/jwt");

const authController = {
  // 1. 구글 로그인 리다이렉트
  googleLogin: (req, res) => {
    const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
      `response_type=code&scope=openid%20email%20profile`;

    res.redirect(redirectUri);
  },

  // 2. 구글 콜백 처리
  googleCallback: async (req, res) => {
    const code = req.query.code;

    try {
      // (1) 인증 코드로 access_token 요청
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const accessToken = tokenResponse.data.access_token;

      // (2) access_token으로 사용자 정보 요청
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { id: google_id, email, name, picture: profile_image } = userResponse.data;

      // (3) DB에 사용자 있는지 확인
      let user = await User.findUserByOAuth(google_id, 'google');

      // (4) 없으면 회원가입
      if (!user) {
        const userId = await User.createUser({
          oauth_id: google_id,
          provider: 'google',
          email,
          name,
          profile_image,
        });

        user = { id: userId, name };
      }

      // (5) JWT 토큰 발급
      const token = createToken(user);

      // (6) 프론트엔드로 리다이렉트 (토큰 포함)
      const frontendURL = process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_DEV;

      res.redirect(`${frontendURL}?token=${token}&name=${encodeURIComponent(user.name)}`);
    } catch (err) {
      console.error("구글 로그인 에러:", err);
      res.status(500).send("로그인 실패");
    }
  }
};

module.exports = authController;