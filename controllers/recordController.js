// controllers/recordController.js
import Record from '../models/recordModel.js';

/** 
 * MySQL DATETIME 포맷 변환 함수
 * ISO 형식(2025-12-07T12:06:30.896Z)을
 * -> "2025-12-07 12:06:30" 으로 변환
 */
const toMySQLDatetime = (date) => {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * @description 수면 기록 생성 (POST /api/records)
 */
export const createRecord = async (req, res) => {
  try {
    const user_id = req.user.id;

    let { sleep_start, sleep_end } = req.body || {};

    // --- 테스트용 자동 생성 ---
    if (!sleep_start || !sleep_end) {
      console.log("⚠ 요청 body 없음 → 테스트용 수면 기록 자동 생성");

      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      sleep_start = now;
      sleep_end = twoHoursLater;
    }

    // MySQL DATETIME 형식으로 변환
    const startFormatted = toMySQLDatetime(sleep_start);
    const endFormatted = toMySQLDatetime(sleep_end);

    // 총 수면시간 계산 (시간 단위)
    const total_sleeptime =
      (new Date(sleep_end) - new Date(sleep_start)) / (1000 * 60 * 60);

    // DB 저장 — movement_level 제거
    const newRecord = await Record.create({
      user_id,
      sleep_start: startFormatted,
      sleep_end: endFormatted,
      total_sleeptime,
    });

    return res.status(201).json({
      message: "수면 기록 저장 완료",
      record: newRecord,
    });

  } catch (error) {
    console.error("createRecord error:", error);
    return res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

/**
 * @description 수면 기록 전체 조회 (GET /api/records)
 */
export const getRecords = async (req, res) => {
  try {
    const user_id = req.user.id;

    const records = await Record.findByUserId(user_id);

    return res.status(200).json({
      message: "수면 기록 조회 성공",
      records,
    });

  } catch (error) {
    console.error("getRecords error:", error);
    return res.status(500).json({ message: "서버 오류" });
  }
};