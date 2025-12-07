import axios from "axios";
import { setLatestResult } from "../utils/resultStore.js";

const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL || "http://127.0.0.1:8000";

/**
 * @desc 카메라폰에서 받은 이미지를 모델서버로 보내서
 *       키포인트/바운딩박스를 받아오는 프록시 역할
 * @route POST /api/model/infer
 */
export const inferFromModelServer = async (req, res) => {
  try {
    const { imageBase64, timestamp } = req.body;

    // 입력 값 검증
    if (!imageBase64) {
      return res.status(400).json({
        message: "imageBase64는 필수입니다.",
      });
    }

    // 모델서버에 그대로 전달할 payload
    const payload = {
      imageBase64,
      timestamp: timestamp ?? Date.now(),
    };

    const response = await axios.post(`${MODEL_SERVER_URL}/infer`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10_000, // 10초 타임아웃 (원하면 조절)
    });

    // 모델서버에서 받은 최신 결과를 서버 메모리에 저장 (모션 감지용)
    const modelResult = response.data;
    setLatestResult(modelResult);

    // 모델서버에서 받은 결과를 그대로 프론트(카메라폰)로 전달
    return res.status(200).json({
      message: "모델 추론 성공",
      result: modelResult, // 여기 안에 keypoints, bbox 등
    });
  } catch (error) {
    console.error("inferFromModelServer error:", error.message);

    // 모델서버 에러 응답이 있을 경우
    if (error.response) {
      return res.status(500).json({
        message: "모델 서버 응답 에러",
        status: error.response.status,
        data: error.response.data,
      });
    }

    // 타임아웃이나 네트워크 에러
    return res.status(500).json({
      message: "모델 서버 요청 실패",
      error: error.message,
    });
  }
};