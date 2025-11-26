// routes/reportRoutes.js
import express from "express";
import auth from "../middlewares/auth.js";
import {
  getReports,
  createReportWithAI
} from "../controllers/reportController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: AI 기반 건강 리포트 API
 */

/**
 * @swagger
 * /api/reports/ai:
 *   post:
 *     summary: AI 기반 건강 리포트 생성
 *     description: 최근 수면 데이터를 기반으로 GPT가 건강 리포트를 생성합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 생성 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/ai", auth, createReportWithAI);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: 리포트 목록 조회
 *     description: 해당 사용자의 리포트를 최신순으로 반환합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/", auth, getReports);

export default router;
