// controllers/modelController.js
import axios from "axios";
import { setLatestResult } from "../utils/resultStore.js";
import { broadcastFrame, broadcastPose } from "../utils/wsServer.js";

const MODEL_SERVER_URL =
  process.env.MODEL_SERVER_URL || "http://127.0.0.1:8000";

/**
 * @desc 카메라폰에서 받은 이미지를 모델서버로 보내서
 *       키포인트/바운딩박스를 받아오는 프록시 역할 + WebSocket 브로드캐스트
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

    // 1️⃣ 일단 프레임을 부모폰 쪽으로 WebSocket 브로드캐스트
    const ts = timestamp ?? Date.now();
    try {
      broadcastFrame({
        imageBase64,
        timestamp: ts,
      });
    } catch (e) {
      console.error("⚠️ broadcastFrame error:", e.message);
    }

    // 2️⃣ 모델서버에 그대로 전달할 payload
    const payload = {
      imageBase64,
      timestamp: ts,
    };

    const response = await axios.post(`${MODEL_SERVER_URL}/infer`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10_000, // 10초 타임아웃
    });

    // 3️⃣ 모델서버에서 받은 최신 결과를 서버 메모리에 저장 (모션 감지용)
    const modelResult = response.data;
    setLatestResult(modelResult);

    // 4️⃣ 포즈 정보도 WebSocket으로 부모폰에 전달 (옵션)
    try {
      if (modelResult) {
        const { bboxes = [], keypoints = [], timestamp: modelTs } = modelResult;

        if ((bboxes && bboxes.length > 0) || (keypoints && keypoints.length > 0)) {
          broadcastPose({
            bboxes,
            keypoints,
            timestamp: modelTs ?? ts,
          });
        }
      }
    } catch (e) {
      console.error("⚠️ broadcastPose error:", e.message);
    }

    // 5️⃣ 모델서버에서 받은 결과를 그대로 프론트(카메라폰)로 전달
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
