// routes/graphRoutes.js

import express from "express";
import { getGraphData } from "../controllers/graphController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Graph
 *   description: 수면 분석 그래프 데이터 API
 */

/**
 * @swagger
 * /api/graph/data:
 *   post:
 *     summary: 기간별 그래프 데이터 조회
 *     description: |
 *       지정된 기간 동안 수면 시간, 뒤척임 횟수, 수면 점수 데이터를 반환합니다.  
 *       - 밤잠/낮잠 판별 후 하루 단위로 total_sleep을 계산  
 *       - 날짜별 movement 이벤트 개수 계산  
 *       - 각 날짜별 sleep score 계산  
 *     tags: [Graph]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-07"
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 그래프 데이터 조회 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     sleepHours:
 *                       type: array
 *                       description: 날짜별 총 수면 시간 (수면+낮잠)
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: 2025-10-08
 *                           hours:
 *                             type: number
 *                             example: 9.5
 *                     movement:
 *                       type: array
 *                       description: 날짜별 뒤척임 이벤트 개수
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: 2025-10-08
 *                           count:
 *                             type: number
 *                             example: 8
 *                     score:
 *                       type: array
 *                       description: 날짜별 수면 점수
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: 2025-10-08
 *                           score:
 *                             type: number
 *                             example: 82
 *
 *       400:
 *         description: 잘못된 요청 (날짜 누락, 범위 내 수면데이터 없음 등)
 *       401:
 *         description: 인증 실패 (토큰 오류)
 *       500:
 *         description: 서버 오류
 */
router.post("/data", authMiddleware, getGraphData);

export default router;
