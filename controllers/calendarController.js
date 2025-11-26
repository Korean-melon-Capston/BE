import {
  getTotalSleepTime,
  getNapTime,
  getFallCount,
  getMovementCount,
  getSleepQuality
} from '../models/calendarModel.js';

const getBabySleepStats = async (req, res) => {
  try {
    const { babyId, date } = req.query;
    if (!babyId || !date) {
      return res.status(400).json({ error: 'babyId와 date는 필수입니다.' });
    }

    const totalSleepTime = await getTotalSleepTime(babyId, date);
    const napTime = await getNapTime(babyId, date);
    const fallCount = await getFallCount(babyId, date);
    const movementCount = await getMovementCount(babyId, date);
    const sleepQuality = await getSleepQuality(babyId, date);

    return res.status(200).json({
      totalSleepTime,
      napTime,
      fallCount,
      movementCount,
      sleepQuality
    });
  } catch (error) {
    console.error('수면 통계 조회 에러:', error);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
};

export { getBabySleepStats };
