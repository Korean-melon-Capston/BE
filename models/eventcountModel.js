// models/reportModel.js
import db from '../config/db.js';

// 1) 기간 + 타입별 이벤트 카운트 (GROUP BY)
const getEventCountsForRange = async (userId, startTime, endTime) => {
  const [rows] = await db.execute(
    `SELECT event_type, COUNT(*) AS cnt
       FROM events
      WHERE user_id = ?
        AND event_time BETWEEN ? AND ?
      GROUP BY event_type`,
    [userId, startTime, endTime]
  );

  let fallCount = 0;
  let movementCount = 0;

  for (const row of rows) {
    if (row.event_type === 'fall') {
      fallCount = row.cnt;
    } else if (row.event_type === 'movement') {
      movementCount = row.cnt;
    }
  }

  return { fallCount, movementCount };
};

// 2) 특정 타입만 따로 뽑고 싶을 때
const getEventCountByTypeInRange = async (userId, startTime, endTime, eventType) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS event_count
       FROM events
      WHERE user_id = ?
        AND event_type = ?
        AND event_time BETWEEN ? AND ?`,
    [userId, eventType, startTime, endTime]
  );

  return rows[0]?.event_count ?? 0;
};

export {
  getEventCountsForRange,
  getEventCountByTypeInRange
};