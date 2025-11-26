// models/recordModel.js
import db from '../config/db.js';

const Record = {
  // 2주차: 수면 기록 생성
  create: async (recordData) => {
    const { user_id, sleep_start, sleep_end, movement_level } = recordData;
    const sql = `
      INSERT INTO baby_records (user_id, sleep_start, sleep_end, movement_level, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(sql, [
      user_id,
      sleep_start,
      sleep_end,
      movement_level,
    ]);
    return { id: result.insertId, ...recordData };
  },

  // 3주차: 사용자별 수면 기록 조회 (미리 구현해두면 좋음)
  findByUserId: async (userId) => {
    const sql = `
      SELECT *
      FROM baby_records
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  // 4주차: AI 연동용 - 최근 N개 기록 조회 (일단 같이 남겨둘게)
  findRecentByUserId: async (userId, limit = 5) => {
    const sql = `
      SELECT sleep_start, sleep_end, movement_level
      FROM baby_records
      WHERE user_id = ?
      ORDER BY sleep_start DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [userId, limit]);
    return rows;
  },
};

export default Record;
// user_id: 유저 고유 id
// sleep_start: 수면 측정 시작
// sleep_end: 수면 측정 종료
// movement_level: 움직임 정도
