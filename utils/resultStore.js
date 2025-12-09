// utils/resultStore.js

// 모델 서버에서 온 최신 추론 결과를 메모리에 간단히 저장/조회하는 유틸

// latestResult: 모델 서버에서 받은 원본 result 객체 (keypoints, bboxes 등 포함)
// latestTimestamp: 해당 결과가 저장된 시각
let latestResult = null;
let latestTimestamp = null;

/**
 * 모델 서버에서 받은 전체 result 객체 저장
 * 예: { keypoints: [...], bboxes: [...], ... }
 */
export function setLatestResult(result, timestamp = Date.now()) {
  latestResult = result;
  latestTimestamp = timestamp;
}

/**
 * 모션 감지 등에서 최신 결과 가져오기
 * 반환 형식:
 *   - 결과가 있으면: { ...result, timestamp }
 *   - 아직 결과가 없으면: { result: null, timestamp }
 */
export function getLatestResult() {
  if (!latestResult) {
    return {
      result: null,
      timestamp: latestTimestamp,
    };
  }

  return {
    ...latestResult,
    timestamp: latestTimestamp,
  };
}