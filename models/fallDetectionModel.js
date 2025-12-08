// models/fallDetectionModel.js
import db from "../config/db.js";

// ROI 조회
export async function getROIByUserId(userId) {
  const [rows] = await db.query(
    `SELECT x1, y1, x2, y2 FROM roi WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * 낙상 감지 알고리즘
 * - 골반 중심 + 주요 관절 좌표들을 확인
 * - 하나라도 ROI 밖이면 즉시 낙상(true)
 */
export async function isOutOfBedROI(keypoints, userId) {
  if (!keypoints || keypoints.length === 0) return false;

  const person = keypoints[0]; // 한 사람만 분석

  // 사용할 주요 관절 인덱스
  const KEY_IDX = {
    RHIP: 11, LHIPP: 12,
    RSHOULDER: 5, LSHOULDER: 6,
    RKNEE: 13, LKNEE: 14,
    RANKLE: 15, LANKLE: 16,
  };

  // ROI 가져오기
  const roi = await getROIByUserId(userId);
  if (!roi) {
    console.warn("⚠️ ROI 없음:", userId);
    return false;
  }

  const { x1, y1, x2, y2 } = roi;

  // 골반 중심 계산
  const hipR = person[KEY_IDX.RHIP];
  const hipL = person[KEY_IDX.LHIPP];

  if (!hipR || !hipL) {
    console.warn("⚠️ 골반 키포인트 없음");
    return false;
  }

  const centerX = (hipR[0] + hipL[0]) / 2;
  const centerY = (hipR[1] + hipL[1]) / 2;

  const importantPoints = [
    [centerX, centerY],                  // 중심점
    person[KEY_IDX.RSHOULDER],
    person[KEY_IDX.LSHOULDER],
    person[KEY_IDX.RKNEE],
    person[KEY_IDX.LKNEE],
    person[KEY_IDX.RANKLE],
    person[KEY_IDX.LANKLE]
  ];

  // ROI 체크 함수
  const isOutsideROI = (x, y) => (x < x1 || x > x2 || y < y1 || y > y2);

  // 한 포인트라도 ROI 밖이면 낙상 판정 TRUE
  for (const p of importantPoints) {
    if (!p) continue;

    const [px, py] = p;
    if (isOutsideROI(px, py)) {
      console.log(`⚠️ ROI 이탈 감지 → (${px}, ${py})`);
      return true;
    }
  }

  return false;
}