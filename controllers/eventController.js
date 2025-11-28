// controllers/eventController.js
import { saveEventLog } from "../models/eventModel.js";

export async function addEventLog(req, res) {
  try {
    const { userId, eventType, eventTime, videoUrl } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({
        message: "userId와 eventType은 필수입니다.",
      });
    }

    if (!["movement", "fall"].includes(eventType)) {
      return res.status(400).json({
        message: "eventType은 'movement' 또는 'fall' 이어야 합니다.",
      });
    }

    const result = await saveEventLog({
      userId,
      eventType,
      eventTime,
      videoUrl,
    });

    return res.status(201).json({
      message: "이벤트가 저장되었습니다.",
      eventId: result.eventId,
      eventTime: result.eventTime,
    });
  } catch (err) {
    console.error("📛 이벤트 저장 오류:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
}