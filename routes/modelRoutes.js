// routes/modelRoutes.js
import { Router } from "express";
import { inferFromModelServer } from "../controllers/modelController.js";
// import auth from "../middlewares/auth.js"; // 필요하면

const router = Router();

/**
 * @swagger
 * /api/model/infer:
 *   post:
 *     summary: Send image to model server for inference
 *     description: Receives Base64 image from camera phone and forwards it to the model server. Returns keypoints and bounding boxes.
 *     tags:
 *       - Model
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageBase64:
 *                 type: string
 *                 description: Base64 encoded image
 *               timestamp:
 *                 type: number
 *                 description: Client timestamp
 *     responses:
 *       200:
 *         description: Inference completed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Model server error
 */

// 카메라폰이 이 엔드포인트로 POST 요청을 보냄
router.post("/infer", /* auth, */ inferFromModelServer);

export default router;