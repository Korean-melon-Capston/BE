// routes/recordRoutes.js
import express from 'express';
import { createRecord, getRecords } from '../controllers/recordController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: 아기 수면 기록 관련 API
 */

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: 아기 수면 기록 생성
 *     description: 인증된 사용자가 아기의 수면 시작/종료 시간과 움직임 정도를 저장합니다.
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 기록 생성 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/', auth, createRecord);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: 아기 수면 기록 조회
 *     description: 인증된 사용자가 저장한 수면 기록 목록을 최신순으로 조회합니다.
 *     tags: [Records]
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
router.get('/', auth, getRecords);

export default router;
