// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// GET /api/users/me
// auth 미들웨어를 통과해야만 이 API를 사용할 수 있음
router.get('/me', auth, (req, res) => {
  res.status(200).json({
    message: "성공적으로 사용자 정보를 가져왔습니다.",
    user: req.user
  });
});

module.exports = router;