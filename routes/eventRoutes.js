import express from "express";
import { addEventLog } from "../controllers/eventController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: 이벤트 저장 API
 */

/**
 * @swagger
 * /eventlog:
 *   post:
 *     summary: 이벤트 저장 (movement / fall)
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             userId: 1
 *             eventType: "fall"
 *             eventTime: "2025-11-20 23:40:00"
 *             videoUrl: "https://example.com/clip.mp4"
 *     responses:
 *       201:
 *         description: 저장 성공
 *         content:
 *           application/json:
 *             example:
 *               message: "이벤트가 저장되었습니다."
 *               eventId: 12
 *               eventTime: "2025-11-20 23:40:00"
 *       400:
 *         description: 요청 부족
 *       500:
 *         description: 서버 오류
 */

router.post("/", addEventLog);

export default router;