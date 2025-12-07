import { broadcastMotion } from "../utils/wsServer.js";
import { getLatestResult } from "../utils/resultStore.js";

let previousKeypoints = null;
let turnCount = 0;
let lastMotionResult = null;

/** 두 프레임 간 변화량 계산 */
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

/** 최신 resultStore에서 keypoints를 읽어 뒤척임 감지 */
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

    // 웹소켓으로 모션 정보 전송 (movement, timestamp, turns)
    try {
      broadcastMotion({
        movement,
        timestamp,
        turns: turnCount,
      });
    } catch (err) {
      console.error("❌ Failed to broadcast motion update via WebSocket:", err);
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

/** 모션 조회용 API (마지막 계산 결과 조회) */
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
  res.json({
    message: "Current motion detection status",
    turns,
    movement,
    timestamp,
  });
}