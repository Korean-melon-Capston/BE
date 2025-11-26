import express from "express";
import { getBabySleepStats } from "../controllers/calendarController.js";

const router = express.Router();

/**
 * @swagger
 * /api/calendar/stats:
 *   get:
 *     summary: 아기 수면 통계 조회
 *     parameters:
 *       - in: query
 *         name: babyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 아기 ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSleepTime:
 *                   type: integer
 *                   description: "해당 날짜의 총 수면 시간 (분 단위, 밤 수면 기준)"
 *                 napTime:
 *                   type: integer
 *                   description: "해당 날짜의 낮잠 시간 (분 단위)"
 *                 fallCount:
 *                   type: integer
 *                   description: "낙상 감지 횟수"
 *                 movementCount:
 *                   type: integer
 *                   description: "뒤척임(움직임) 감지 횟수"
 *                 sleepQuality:
 *                   type: number
 *                   description: "health_reports.score 평균값 (수면 품질 점수)"
 *             example:
 *               totalSleepTime: 420
 *               napTime: 60
 *               fallCount: 0
 *               movementCount: 15
 *               sleepQuality: 85.5
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

router.get("/stats", getBabySleepStats);

export default router;