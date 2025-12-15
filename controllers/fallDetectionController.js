// controllers/fallDetectionController.js
import { isOutOfBedROI } from "../models/fallDetectionModel.js";
import { saveEventLog } from "../models/eventModel.js";

export const detectFall = async (req, res) => {
  try {
    const { keypoints } = req.body;
    // 🔥 토큰 기반 userId 사용 (테스트 중이면 토큰 없을 때 1로 강제)
    const userId = req.user?.id ?? 11;

    if (!keypoints) {
      return res.status(400).json({
        message: "keypoints 누락",
      });
    }

    const fall = await isOutOfBedROI(keypoints, userId);

    if (fall) {
      console.log(`🚨 [FallDetection] User ${userId} — FALL DETECTED at ${new Date().toISOString()}`);
      try {
        const now = new Date();
        await saveEventLog({
          userId,
          eventType: "fall",
          eventTime: now.toISOString(),
          videoUrl: null,
        });
        console.log(`✅ [FallDetection] DB saved (userId=${userId}, type=fall)`);
      } catch (dbErr) {
        console.error("❌ [FallDetection] DB save failed:", dbErr.message);
      }
    } else {
      console.log(`ℹ️ [FallDetection] User ${userId} — no fall detected`);
    }

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