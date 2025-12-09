// routes/roiRoutes.js
import { Router } from "express";
import { saveROI, getROIStatus } from "../controllers/roiController.js";
import auth from "../middlewares/auth.js";

const router = Router();

/**
 * ROI 저장/수정
 * POST /api/roi
 */
router.post("/", auth, saveROI);
// 필요하면 테스트용으로 auth 뺄 수도 있음: router.post("/", saveROI);

/**
 * ROI 조회
 * GET /api/roi
 */
router.get("/", auth, getROIStatus);
// 테스트용: router.get("/", getROIStatus);

export default router;