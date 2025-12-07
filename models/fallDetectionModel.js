// models/fallDetectionModel.js
import { getROIByUserId } from "./roiModel.js";

/**
 * keypoints = [
 *   [ [x,y,c], [x,y,c], ... ]  // person 0
 * ]
 */
export async function isOutOfBedROI(keypoints, userId) {
  if (!keypoints || keypoints.length === 0) return false;

  const person = keypoints[0];
  const centerPoint = person[0]; // 첫 번째 관절(코 또는 임의의 기준점)

  const x = centerPoint?.[0];
  const y = centerPoint?.[1];

  if (x == null || y == null) return false;

  // DB에서 ROI 조회 (유저 맞춤)
  const roi = await getROIByUserId(userId);

  if (!roi) {
    console.warn("⚠️ ROI not set for user:", userId);
    return false;
  }

  const { x1, y1, x2, y2 } = roi;

  // ROI 밖으로 나갔는지 체크
  return x < x1 || x > x2 || y < y1 || y > y2;
}