// routes/sampleRoutes.js

const express = require("express");

const router = express.Router();
const auth = require("../middlewares/auth");
const sampleController = require("../controllers/sampleController");

/**
 * @swagger
 * /api/sample:
 *   get:
 *     summary: 샘플 데이터를 가져옵니다
 *     tags: [Sample]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공적으로 샘플 데이터를 반환함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello from sampleController!"
 */


// GET /api/sample
router.get("/sample", auth, sampleController.getSample);

module.exports = router;