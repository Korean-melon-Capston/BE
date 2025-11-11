import express from "express";
import { getMotionStatus } from "../controllers/motionController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Motion
 *   description: Motion detection (뒤척임 감지) API
 */

/**
 * @swagger
 * /motion/status:
 *   get:
 *     summary: Get current motion (뒤척임) detection status
 *     description: Returns the current count of detected motion (turns) based on YOLO pose keypoints.
 *     tags: [Motion]
 *     responses:
 *       200:
 *         description: Successfully retrieved motion status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current motion detection status
 *                 turns:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: Server error
 */

// 뒤척임 상태 조회 API
// GET /motion/status
router.get("/status", getMotionStatus);

export default router;
