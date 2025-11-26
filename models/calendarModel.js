import db from '../config/db.js';

// 수면 시간 계산 유틸 함수 (초 단위 반환)
function getSleepDuration(start, end) {
  return (new Date(end) - new Date(start)) / 1000;
}

function getDateRanges(date) {
  const nightStart = `${date} 18:00:00`;
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDay = nextDate.toISOString().slice(0, 10);
  const nightEnd = `${nextDay} 09:00:00`;
  const napStart = `${date} 09:01:00`;
  const napEnd = `${date} 17:59:59`;
  return { nightStart, nightEnd, napStart, napEnd };
}

const getTotalSleepTime = async (babyId, date) => {
  const { nightStart, nightEnd } = getDateRanges(date);
  const [records] = await db.execute(
    `SELECT sleep_start, sleep_end FROM baby_records
     WHERE user_id = ? AND sleep_start BETWEEN ? AND ?`,
    [babyId, nightStart, nightEnd]
  );
  let total = 0;
  for (const r of records) total += getSleepDuration(r.sleep_start, r.sleep_end);
  return Math.floor(total / 60);
};

const getNapTime = async (babyId, date) => {
  const { napStart, napEnd } = getDateRanges(date);
  const [records] = await db.execute(
    `SELECT sleep_start, sleep_end FROM baby_records
     WHERE user_id = ? AND sleep_start BETWEEN ? AND ?`,
    [babyId, napStart, napEnd]
  );
  let total = 0;
  for (const r of records) total += getSleepDuration(r.sleep_start, r.sleep_end);
  return Math.floor(total / 60);
};

const getFallCount = async (babyId, date) => {
  const { nightStart, nightEnd } = getDateRanges(date);
  const [records] = await db.execute(
    `SELECT fall_count FROM baby_records
     WHERE user_id = ? AND sleep_start BETWEEN ? AND ?`,
    [babyId, nightStart, nightEnd]
  );
  return records.reduce((acc, curr) => acc + (curr.fall_count || 0), 0);
};

const getMovementCount = async (babyId, date) => {
  const { nightStart, nightEnd } = getDateRanges(date);
  const [records] = await db.execute(
    `SELECT movement_count FROM baby_records
     WHERE user_id = ? AND sleep_start BETWEEN ? AND ?`,
    [babyId, nightStart, nightEnd]
  );
  return records.reduce((acc, curr) => acc + (curr.movement_count || 0), 0);
};

const getSleepQuality = async (babyId, date) => {
  const { nightStart, nightEnd } = getDateRanges(date);
  const [scores] = await db.execute(
    `SELECT score FROM health_reports
     WHERE user_id = ? AND report_date BETWEEN ? AND ?`,
    [babyId, nightStart, nightEnd]
  );

  const total = scores.reduce((sum, r) => sum + r.score, 0);
  const avg = scores.length ? total / scores.length : null;
  return avg;
};

export {
  getTotalSleepTime,
  getNapTime,
  getFallCount,
  getMovementCount,
  getSleepQuality
};
