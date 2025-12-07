// controllers/fallDetectionController.js
import { isOutOfBedROI } from '../models/fallDetectionModel.js';  // 모델을 임포트

// 낙상 감지 API
export const detectFall = async (req, res) => {
  try {
    const { keypoints, userId } = req.body;  // 요청에서 keypoints와 userId 받기

    // 필수 값 확인
    if (!keypoints || !userId) {
      return res.status(400).json({ message: 'keypoints와 userId는 필수입니다.' });
    }

    // 낙상 감지 판단
    const outOfBed = isOutOfBedROI(keypoints); // 모델에서 ROI 벗어났는지 체크

    if (outOfBed) {
      console.log("낙상 감지: 아기가 침대에서 이탈했습니다. userId:", userId);
      return res.status(200).json({ message: '낙상 감지됨', status: true });
    }

    return res.status(200).json({ message: '낙상 없음', status: false });

  } catch (error) {
    console.error('detectFall error:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
};
