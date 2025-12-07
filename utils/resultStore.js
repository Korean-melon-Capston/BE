// utils/resultStore.js

// 모델 서버에서 온 최신 추론 결과를 메모리에 간단히 저장/조회하는 유틸

let latestData = {
  result: null,
  timestamp: null,
};

/**
 * 모델 서버에서 받은 전체 result 객체 저장
 * 예: { keypoints: [...], bbox: {...}, ... }
 */
export function setLatestResult(result, timestamp = Date.now()) {
  latestData.result = result;
  latestData.timestamp = timestamp;
}

/**
 * 모션 감지 등에서 최신 결과 가져오기
 */
export function getLatestResult() {
  return latestData;
}