const express = require("express");
const router = express.Router();
const { getMyPage } = require("../controllers/mypageController");
const authenticate = require("../middlewares/auth"); // JWT 인증 미들웨어

/**
 * @swagger
 * /mypage:
 *   get:
 *     summary: 마이페이지 조회
 *     tags: [MyPage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자 없음
 */
router.get("/", authenticate, getMyPage);

module.exports = router;