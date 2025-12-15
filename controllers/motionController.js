// controllers/motionController.js

import { broadcastMotion } from "../utils/wsServer.js";
import { getLatestResult } from "../utils/resultStore.js";
import { saveEventLog } from "../models/eventModel.js";

let previousKeypoints = null;
let turnCount = 0;
let lastMotionResult = null;

/**
 * 두 프레임 간 keypoint 변화량 계산
 * @param {number[][]} current
 * @param {number[][]} previous
 * @returns {number} 평균 이동 거리
 */
function calculateMotion(current, previous) {
  if (!current || !previous) return 0;

  let totalChange = 0;
  let count = 0;

  for (let i = 0; i < current.length; i++) {
    const kpCurrent = current[i];
    const kpPrev = previous[i];
    if (kpCurrent && kpPrev) {
      const dx = kpCurrent[0] - kpPrev[0];
      const dy = kpCurrent[1] - kpPrev[1];
      totalChange += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  }

  return count > 0 ? totalChange / count : 0;
}

/**
 * 최신 resultStore에서 keypoints를 읽어 뒤척임 감지
 * - 모델 서버가 결과를 resultStore에 넣어두고,
 *   이 함수가 주기적으로 호출된다고 가정
 */
export async function detectMotion() {
  const latest = getLatestResult();

  if (!latest || !latest.keypoints || latest.keypoints.length === 0) {
    console.log("⚠️ No keypoints in resultStore");
    const fallback = {
      turns: turnCount,
      movement: 0,
      timestamp: Date.now(),
      message: "No keypoints detected",
    };
    lastMotionResult = fallback;
    return fallback;
  }

  const person = latest.keypoints[0]; // 한 사람만 있다고 가정
  let movement = 0;
  const timestamp = Date.now();

  if (previousKeypoints) {
    movement = calculateMotion(person, previousKeypoints);

    if (movement > 20) {
      turnCount++;
      console.log(
        `🌀 [MOTION DETECTED] movement=${movement.toFixed(
          3
        )}, turns=${turnCount}, ts=${timestamp}`
      );

      // ✅ DB 저장 (events 테이블에 motion 이벤트로 저장)
      // detectMotion()은 req/res가 없어서 일단 테스트용으로 userId=1 고정
      // (나중에 JWT 연동되면 호출부에서 userId를 넘기도록 구조 개선)
      try {
        await saveEventLog({
          userId: 1,
          eventType: "motion",
          eventTime: new Date(timestamp),
          videoUrl: null,
        });
        console.log(
          `✅ [MotionDetection] event saved (type=motion, userId=11, turns=${turnCount}, ts=${timestamp})`
        );
      } catch (e) {
        console.error("❌ [MotionDetection] event save failed:", e?.message || e);
      }
    } else {
      console.log(
        `ℹ️ [MOTION BELOW THRESHOLD] movement=${movement.toFixed(
          3
        )}, threshold=20`
      );
    }

    // 웹소켓으로 모션 정보 전송 (movement, timestamp, turnCount)
    try {
      const payload = {
        movement,
        timestamp,
        turnCount,
      };

      console.log("📡 [WS] broadcasting motion update:", payload);
      broadcastMotion(payload);
    } catch (err) {
      console.error(
        "❌ Failed to broadcast motion update via WebSocket:",
        err
      );
    }
  } else {
    console.log(
      "ℹ️ First frame received, baseline keypoints stored. (no motion calc yet)"
    );
  }

  previousKeypoints = person;

  const result = {
    turns: turnCount,
    movement,
    timestamp,
  };
  lastMotionResult = result;
  return result;
}

/**
 * 모션 조회용 API (마지막 계산 결과 조회)
 * GET /motion/status
 */
export async function getMotionStatus(req, res) {
  if (!lastMotionResult) {
    return res.json({
      message: "No motion data yet",
      turns: turnCount,
      movement: 0,
      timestamp: null,
    });
  }

  const { turns, movement, timestamp } = lastMotionResult;
  return res.json({
    message: "Current motion detection status",
    turns,
    movement,
    timestamp,
  });
}
