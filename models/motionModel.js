import db from "../config/db.js"; // MySQL 연결 파일 가정

// 뒤척임 이벤트 저장
export async function saveMotionEvent(turnCount) {
  const query = "INSERT INTO motion_events (turn_count, created_at) VALUES (?, NOW())";
  await db.execute(query, [turnCount]);
  console.log(`✅ Motion event saved (turnCount: ${turnCount})`);
}

// 최근 뒤척임 이벤트 가져오기
export async function getRecentMotionEvents(limit = 10) {
  const query = "SELECT * FROM motion_events ORDER BY created_at DESC LIMIT ?";
  const [rows] = await db.execute(query, [limit]);
  return rows;
}

//수정필요