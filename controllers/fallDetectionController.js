import { isOutOfBedROI } from '../models/fallDetectionModel.js';

export const detectFall = async (req, res) => {
  try {
    const { keypoints, userId } = req.body;

    if (!keypoints || !userId) {
      return res.status(400).json({
        message: 'keypoints와 userId는 필수입니다.',
      });
    }

    // userId 반드시 넘겨야 DB ROI 가능
    const outOfBed = await isOutOfBedROI(keypoints, userId);

    if (outOfBed) {
      console.log("낙상 감지됨 (사용자:", userId, ")");
      return res.status(200).json({ message: '낙상 감지됨', status: true });
    }

    return res.status(200).json({ message: '낙상 없음', status: false });

  } catch (error) {
    console.error('detectFall error:', error);
    return res.status(500).json({
      message: '서버 오류',
      error: error.message,
    });
  }
};
