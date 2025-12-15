// controllers/modelController.js
import axios from "axios";
import { setLatestResult } from "../utils/resultStore.js";
import { broadcastFrame, broadcastPose, broadcastFallEvent } from "../utils/wsServer.js";
import { isOutOfBedROI } from "../models/fallDetectionModel.js";
import { detectMotion } from "./motionController.js";

const MODEL_SERVER_URL =
  process.env.MODEL_SERVER_URL || "http://127.0.0.1:8000";

/**
 * @desc 카메라폰에서 받은 이미지를 모델서버로 보내서
 *       키포인트/바운딩박스를 받아오는 프록시 역할 + WebSocket 브로드캐스트
 * @route POST /api/model/infer
 */
export const inferFromModelServer = async (req, res) => {
  try {
    const { imageBase64, timestamp, userId: bodyUserId } = req.body || {};
    const tokenUserId = req.user?.id;
    const queryUserId = req.query?.userId;
    // 🔹 우선순위: 토큰 > body > query (없으면 그냥 undefined로 두고, 낙상 판정만 스킵)
    const userId = tokenUserId ?? bodyUserId ?? queryUserId ?? 11;

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
    let fallDetected = false;

    // 🔹 timestamp 누락 방지를 위해 보정해서 저장
    const modelResultWithTs = {
      ...modelResult,
      timestamp: modelResult?.timestamp ?? ts,
    };
    setLatestResult(modelResultWithTs);

    // 🔹 뒤척임 감지도 여기서 함께 수행
    try {
      const motionResult = await detectMotion();
      if (motionResult) {
        console.log(
          `📈 [MotionDetection] movement=${
            motionResult.movement?.toFixed?.(3) ?? motionResult.movement
          }, turns=${motionResult.turns}, ts=${motionResult.timestamp}`
        );
      } else {
        console.log("ℹ️ [MotionDetection] detectMotion returned no result");
      }
    } catch (e) {
      console.error("⚠️ [MotionDetection] detectMotion 호출 중 오류:", e);
    }

    // 4️⃣ 포즈 정보도 WebSocket으로 부모폰에 전달 (옵션)
    try {
      if (modelResultWithTs) {
        const { bboxes = [], keypoints = [], timestamp: modelTs } = modelResultWithTs;

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

    // 5️⃣ ROI 기반 낙상 감지 (userId가 있을 때만)
    try {
      if (!userId) {
        console.log("ℹ️ [FallDetection] userId 없음 → 낙상 판정 스킵");
      } else if (
        modelResultWithTs &&
        Array.isArray(modelResultWithTs.keypoints) &&
        modelResultWithTs.keypoints.length > 0
      ) {
        const fall = await isOutOfBedROI(modelResultWithTs.keypoints, userId);
        fallDetected = !!fall;

        if (fallDetected) {
          const nowIso = new Date().toISOString();
          console.log(`🚨 [FallDetection] User ${userId} — FALL DETECTED at ${nowIso}`);
          // 필요 시 신뢰도(confidence)는 일단 1.0으로 고정, 나중에 모델에서 내려주면 교체
          broadcastFallEvent(1.0, { userId, detectedAt: nowIso });
        } else {
          console.log(`ℹ️ [FallDetection] User ${userId} — no fall detected`);
        }
      } else {
        console.log("ℹ️ [FallDetection] keypoints 없음 → 낙상 판정 스킵");
      }
    } catch (e) {
      console.error("⚠️ [FallDetection] 낙상 판정 중 오류:", e);
    }

    // 5️⃣ 모델서버에서 받은 결과를 그대로 프론트(카메라폰)로 전달
    return res.status(200).json({
      message: "모델 추론 성공",
      result: modelResult, // 여기 안에 keypoints, bbox 등
      fallDetected,
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
