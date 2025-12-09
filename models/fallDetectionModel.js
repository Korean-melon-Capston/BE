// models/fallDetectionModel.js
import db from "../config/db.js";

export async function getROIByUserId(userId) {
  const [rows] = await db.query(
    `SELECT x1, y1, x2, y2 FROM roi WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function isOutOfBedROI(keypoints, userId) {
  if (!keypoints || !Array.isArray(keypoints) || keypoints.length === 0)
    return false;

  const person = keypoints[0]; // 첫 번째 사람


  // 골반 좌표 (index 11, 12)
  const leftHip = person[11];  // [x,y,conf]
  const rightHip = person[12]; // [x,y,conf]

  if (!leftHip || !rightHip) {
    console.warn("⚠️ 골반 키포인트 없음");
    return false;
  }

  const hipX = (leftHip[0] + rightHip[0]) / 2;
  const hipY = (leftHip[1] + rightHip[1]) / 2;

  if (hipX == null || hipY == null) return false;

  // ROI 불러오기
  const roi = await getROIByUserId(userId);

  if (!roi) {
    console.warn("⚠️ ROI not set for user:", userId);
    return false;
  }

  const { x1, y1, x2, y2 } = roi;

  // ROI 영역 벗어났는지 체크
  const out =
    hipX < x1 ||
    hipX > x2 ||
    hipY < y1 ||
    hipY > y2;

  return out;
}
