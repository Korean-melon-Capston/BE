// routes/authRoutes.js

import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: 구글 로그인 페이지로 리다이렉트
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 구글 로그인 페이지로 리다이렉트됨
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: 구글 로그인 콜백 처리
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: 구글에서 전달된 인가 코드
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: 로그인 성공 시 프론트엔드로 리다이렉트
 *       500:
 *         description: 로그인 실패
 */

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

export default router;