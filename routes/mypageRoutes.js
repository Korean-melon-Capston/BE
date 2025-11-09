import express from "express";
import { getMyPage } from "../controllers/mypageController.js";
import authenticate from "../middlewares/auth.js"; // JWT 인증 미들웨어

const router = express.Router();

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

export default router;