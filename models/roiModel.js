// models/roiModel.js
import pool from "../config/db.js";

/**
 * user_id 기준으로 ROI INSERT or UPDATE
 * (x1, y1, x2, y2 는 정수 좌표로 저장)
 */
export async function upsertROI(userId, x1, y1, x2, y2) {
  const sql = `
    INSERT INTO roi (user_id, x1, y1, x2, y2)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      x1 = VALUES(x1),
      y1 = VALUES(y1),
      x2 = VALUES(x2),
      y2 = VALUES(y2),
      updated_at = CURRENT_TIMESTAMP
  `;
  await pool.execute(sql, [userId, x1, y1, x2, y2]);
}

/**
 * 디버깅/조회용: 현재 ROI 가져오기
 */
export async function getROIByUserId(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM roi WHERE user_id = ?",
    [userId]
  );
  return rows[0] || null;
}
