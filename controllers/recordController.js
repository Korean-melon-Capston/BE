// controllers/recordController.js
import Record from '../models/recordModel.js';

/**
 * @description 수면 기록 생성 (POST /api/records)
 */
export const createRecord = async (req, res) => {
  try {
    const user_id = req.user.id; // auth 미들웨어에서 세팅됨
    const { sleep_start, sleep_end, movement_level } = req.body;

    // 필수 값 검증
    if (!sleep_start || !sleep_end || movement_level == null) {
      return res.status(400).json({
        message: 'sleep_start, sleep_end, movement_level은 필수입니다.',
      });
    }

    // DB 저장
    const newRecord = await Record.create({
      user_id,
      sleep_start,
      sleep_end,
      movement_level,
    });

    return res.status(201).json({
      message: '수면 기록이 저장되었습니다.',
      record: newRecord,
    });

  } catch (error) {
    console.error('createRecord error:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};

/**
 * @description 수면 기록 전체 조회 (GET /api/records)
 */
export const getRecords = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 사용자 수면 기록 가져오기
    const records = await Record.findByUserId(user_id);

    return res.status(200).json({
      message: '수면 기록 조회 성공',
      records,
    });

  } catch (error) {
    console.error('getRecords error:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};
