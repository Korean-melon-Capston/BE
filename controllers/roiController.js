// controllers/roiController.js
import { upsertROI, getROIByUserId } from "../models/roiModel.js";

/**
 * ROI 저장/수정
 * POST /api/roi
 * body: { x1, y1, x2, y2 }  // 이미지 좌표계의 정수/실수 좌표
 * userId 는 기본적으로 JWT(req.user.id) 사용, 없으면 body.userId 로 대체(테스트용)
 */
export async function saveROI(req, res) {
  try {
    const tokenUserId = req.user?.id;
    const bodyUserId = req.body?.userId; // 디버그/테스트용
    const userId = tokenUserId || bodyUserId;

    if (!userId) {
      return res.status(400).json({
        message: "userId 가 필요합니다. (JWT 또는 body.userId)",
      });
    }

    const { x1, y1, x2, y2 } = req.body || {};

    // 숫자형 검증
    if (
      typeof x1 !== "number" ||
      typeof y1 !== "number" ||
      typeof x2 !== "number" ||
      typeof y2 !== "number"
    ) {
      return res.status(400).json({
        message: "x1, y1, x2, y2 는 모두 number 타입이어야 합니다.",
      });
    }

    // 좌표 관계 검증 (왼쪽 위 ~ 오른쪽 아래 기준)
    if (x2 <= x1 || y2 <= y1) {
      return res.status(400).json({
        message: "x2 > x1, y2 > y1 이어야 합니다. (직사각형 영역)",
      });
    }

    await upsertROI(userId, x1, y1, x2, y2);

    console.log(
      `✅ [ROI] 저장 완료 userId=${userId}, ROI=(${x1},${y1})~(${x2},${y2})`
    );

    return res.json({
      message: "ROI 저장/수정 완료",
      roi: { userId, x1, y1, x2, y2 },
    });
  } catch (err) {
    console.error("saveROI error:", err);
    return res.status(500).json({
      message: "ROI 저장 중 서버 오류가 발생했습니다.",
      error: err.message,
    });
  }
}

/**
 * ROI 조회
 * GET /api/roi
 *  - 기본: JWT 의 userId 사용
 *  - 테스트용: 쿼리스트링 userId 지원: /api/roi?userId=1
 */
export async function getROIStatus(req, res) {
  try {
    const tokenUserId = req.user?.id;
    const queryUserId = req.query?.userId;
    const userId = tokenUserId || queryUserId;

    if (!userId) {
      return res.status(400).json({
        message: "userId 가 필요합니다. (JWT 또는 query.userId)",
      });
    }

    const roi = await getROIByUserId(userId);

    if (!roi) {
      console.log(`ℹ️ [ROI] userId=${userId} ROI 없음`);
      return res.json({
        message: "ROI가 아직 설정되지 않았습니다.",
        roi: null,
      });
    }

    console.log(
      `ℹ️ [ROI] 조회 userId=${userId}, ROI=(${roi.x1},${roi.y1})~(${roi.x2},${roi.y2})`
    );

    return res.json({
      message: "ROI 조회 성공",
      roi,
    });
  } catch (err) {
    console.error("getROIStatus error:", err);
    return res.status(500).json({
      message: "ROI 조회 중 서버 오류가 발생했습니다.",
      error: err.message,
    });
  }
}