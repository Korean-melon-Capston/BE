// -----------------------------------------------------------
// 1) 아기 개월 수 계산
// -----------------------------------------------------------
export function getMonthAge(birthDate) {
  if (!birthDate) return 0;

  const today = new Date();
  const birth = new Date(birthDate);

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) months -= 1;

  return Math.max(months, 0);
}

// -----------------------------------------------------------
// 2) 개월 수 기준 권장 총 수면 시간
// -----------------------------------------------------------
export function getRecommendedSleepHours(monthAge) {
  if (monthAge <= 3) return 15.5;
  if (monthAge <= 11) return 13.5;
  if (monthAge <= 23) return 12.5;
  if (monthAge <= 59) return 11.5;
  return 11.5;
}

// -----------------------------------------------------------
// 3) 총 수면 시간 점수 (0~100)
// -----------------------------------------------------------
export function calcSleepDurationScore(hours, birthDate) {
  const monthAge = getMonthAge(birthDate);
  const recommended = getRecommendedSleepHours(monthAge);

  const diff = Math.abs(hours - recommended);

  if (diff <= 0.5) return 100;
  if (diff <= 1) return 90;
  if (diff <= 2) return 75;
  if (diff <= 3) return 50;
  return 30;
}

// -----------------------------------------------------------
// 4) 취침 시각 일관성 점수 (0~100)
// -----------------------------------------------------------
export function calcBedtimeConsistency(startTimes = []) {
  if (!Array.isArray(startTimes) || startTimes.length === 0) return 0;

  const times = startTimes
    .map((t) => new Date(t))
    .filter((d) => !isNaN(d)) // 잘못된 날짜 필터링
    .map((d) => d.getHours() + d.getMinutes() / 60);

  if (times.length === 0) return 0;

  const diff = Math.max(...times) - Math.min(...times);

  if (diff <= 0.5) return 100;
  if (diff <= 1) return 90;
  if (diff <= 1.5) return 75;
  if (diff <= 2) return 55;
  return 35;
}

// -----------------------------------------------------------
// 5) 이벤트 점수 (0~20)
// movementCount / fallCount 기반
// -----------------------------------------------------------
export function calcEventRiskScore({ movementCount = 0, fallCount = 0 }) {
  // 낙상 점수
  let fallScore = 0;
  if (fallCount === 0) fallScore = 10;
  else if (fallCount === 1) fallScore = 5;
  else fallScore = 0;

  // 뒤척임 점수
  let movementScore = 0;
  if (movementCount <= 2) movementScore = 10;
  else if (movementCount <= 5) movementScore = 7;
  else if (movementCount <= 10) movementScore = 3;
  else movementScore = 1;

  // 총합 0~20
  return fallScore + movementScore;
}

// -----------------------------------------------------------
// 6) 최종 수면 점수 계산 (0~100)
// duration: 40%, consistency: 40%, events: 20%
// -----------------------------------------------------------
export function calculateFinalSleepScore(records, baby_birth, eventCounts = {}) {
  if (!records || records.length === 0) return 0;

  // total_sleeptime 안전 변환
  const sleepHours = records.map((r) => Number(r.total_sleeptime) || 0);

  // 취침 시각 안전 추출
  const startTimes = records.map(
    (r) => r.sleep_start || r.first_sleep_start
  );

  // ① 총 수면 시간 점수
  const durationScore = calcSleepDurationScore(sleepHours[0], baby_birth);

  // ② 취침 시간 일관성 점수
  const consistencyScore = calcBedtimeConsistency(startTimes);

  // ③ 이벤트 점수 (movement + fall)
  const eventScore = calcEventRiskScore(eventCounts);

  // ④ 최종 점수 계산 (가중치 기반)
  let finalScore =
    durationScore * 0.4 +
    consistencyScore * 0.4 +
    eventScore * 0.2;

  // 안전 장치: 최소 0점
  return Math.round(Math.max(finalScore, 0));
}
