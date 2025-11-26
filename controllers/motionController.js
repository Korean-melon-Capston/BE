import { saveMotionEvent } from "../models/motionModel.js";

let previousKeypoints = null;
let turnCount = 0;

/**
 * 두 프레임 간의 keypoint 변화량 계산 (뒤척임 감지)
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
 * 뒤척임 감지 로직 실행
 */
export async function detectMotion() {
  const { keypoints } = getLatestResult();

  if (!keypoints || keypoints.length === 0) {
    console.log("⚠️ No keypoints yet.");
    return { turns: turnCount, message: "No keypoints detected" };
  }

  if (previousKeypoints) {
    const movement = calculateMotion(keypoints[0], previousKeypoints[0]);
    if (movement > 15) { // 이거 실험해서 조절해야함 값 찾아야지
      turnCount++;
      await saveMotionEvent(turnCount); // 🟢 DB에 저장
      console.log(`🌀 Motion detected! Total turns: ${turnCount}`);
    }
  }

  previousKeypoints = keypoints;
  return { turns: turnCount };
}

/**
 * 뒤척임 횟수 조회용 API
 */
export async function getMotionStatus(req, res) {
  const result = await detectMotion();
  res.json({
    message: "Current motion detection status",
    turns: result.turns,
  });
}