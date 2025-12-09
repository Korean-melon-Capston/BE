// controllers/motionController.js

import { broadcastMotion } from "../utils/wsServer.js";
import { getLatestResult } from "../utils/resultStore.js";
import { upsertROI, getROIByUserId } from "../models/roiModel.js";

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

    if (movement > 15) {
      turnCount++;
      console.log(`🌀 Motion detected! Total turns: ${turnCount}`);
    } else {
      console.log(`ℹ️ Movement below threshold: ${movement}`);
    }

    // 웹소켓으로 모션 정보 전송 (movement, timestamp, turnCount)
    try {
      broadcastMotion({
        movement,
        timestamp,
        turnCount, // 🔹 wsServer.broadcastMotion 이 turnCount 를 기대함
      });
    } catch (err) {
      console.error(
        "❌ Failed to broadcast motion update via WebSocket:",
        err
      );
    }
  } else {
    console.log("ℹ️ First frame received, baseline keypoints stored.");
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

/**
 * ROI(침대 영역) 저장 API
 * POST /motion/roi
 * body: { userId, x, y, width, height }  // x,y,width,height 는 0~1 비율
 */
export async function saveROI(req, res) {
  try {
    // 나중에 JWT 붙이면 req.user.id 를 우선 사용
    const tokenUserId = req.user?.id;
    const bodyUserId = req.body?.userId;
    const userId = tokenUserId || bodyUserId;

    if (!userId) {
      return res.status(400).json({ message: "userId 가 필요합니다." });
    }

    const { x, y, width, height } = req.body || {};

    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof width !== "number" ||
      typeof height !== "number"
    ) {
      return res.status(400).json({
        message: "x, y, width, height 는 모두 number 타입이어야 합니다.",
      });
    }

    if (x < 0 || x > 1 || y < 0 || y > 1) {
      return res
        .status(400)
        .json({ message: "x, y 는 0 이상 1 이하의 값이어야 합니다." });
    }

    if (width <= 0 || width > 1 || height <= 0 || height > 1) {
      return res.status(400).json({
        message: "width, height 는 0보다 크고 1 이하여야 합니다.",
      });
    }

    if (x + width > 1 || y + height > 1) {
      return res.status(400).json({
        message:
          "ROI 가 화면 범위를 벗어납니다. (x+width, y+height 는 1 이하여야 함)",
      });
    }

    // DB roi 테이블에 INSERT / UPDATE
    const savedDb = await upsertROI(userId, { x, y, width, height });

    return res.json({
      message: "ROI 저장 완료",
      roi: {
        userId,
        x,
        y,
        width,
        height,
        db: savedDb, // x1,y1,x2,y2 (정수) 확인용
      },
    });
  } catch (err) {
    console.error("saveROI error:", err);
    return res
      .status(500)
      .json({ message: "ROI 저장 중 서버 오류가 발생했습니다." });
  }
}

/**
 * ROI 조회 API
 * GET /motion/roi?userId=1
 */
export async function getROIStatus(req, res) {
  try {
    const tokenUserId = req.user?.id;
    const queryUserId = req.query?.userId;
    const userId = tokenUserId || queryUserId;

    if (!userId) {
      return res.status(400).json({ message: "userId 가 필요합니다." });
    }

    const roi = await getROIByUserId(userId);

    if (!roi) {
      return res.json({
        message: "ROI가 아직 설정되지 않았습니다.",
        roi: null,
      });
    }

    return res.json({
      message: "ROI 조회 성공",
      roi,
    });
  } catch (err) {
    console.error("getROIStatus error:", err);
    return res
      .status(500)
      .json({ message: "ROI 조회 중 서버 오류가 발생했습니다." });
  }
}
