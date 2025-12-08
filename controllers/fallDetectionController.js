// controllers/fallController.js
import { isOutOfBedROI } from "../models/fallDetectionModel.js";

export const detectFall = async (req, res) => {
  try {
    const { keypoints } = req.body;
    const userId = req.user?.id;  // 🔥 토큰 기반 userId 사용

    if (!keypoints || !userId) {
      return res.status(400).json({
        message: "keypoints 또는 userId 누락",
      });
    }

    const fall = await isOutOfBedROI(keypoints, userId);

    return res.status(200).json({
      message: fall ? "낙상 감지됨" : "낙상 없음",
      status: fall,
    });

  } catch (error) {
    console.error("detectFall error:", error);
    return res.status(500).json({
      message: "서버 오류",
      error: error.message,
    });
  }
};