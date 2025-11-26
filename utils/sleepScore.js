// utils/sleepScore.js

// 1. 총 수면 시간 점수
export function calcSleepDurationScore(hours) {
  const recommended = 11; // 권장 10~12의 중간값
  const diff = Math.abs(hours - recommended);

  if (diff <= 0.5) return 20;
  if (diff <= 1) return 18;
  if (diff <= 2) return 16;
  if (diff <= 3) return 10;
  return 5;
}

// 2. 평균 수면 안정성 점수 (일자별 수면 시간의 표준편차)
export function calcStabilityScore(sleeps) {
  const avg = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;
  const variance =
    sleeps.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / sleeps.length;
  const std = Math.sqrt(variance);

  if (std <= 0.33) return 20; // 20분
  if (std <= 0.66) return 18; // 40분
  if (std <= 1) return 15; // 1시간
  return 8;
}

// 3. 움직임 점수
export function calcMovementScore(level) {
  if (level <= 2) return 20;
  if (level <= 5) return 16;
  if (level <= 7) return 10;
  if (level <= 9) return 5;
  return 2;
}

// 4. 이벤트 점수
export function calcEventScore(count) {
  if (count === 0) return 20;
  if (count === 1) return 15;
  if (count === 2) return 10;
  if (count === 3) return 5;
  return 0;
}

// 5. 취침 시간 일관성 점수
export function calcBedtimeConsistency(startTimes) {
  const times = startTimes.map((t) => {
    const d = new Date(t);
    return d.getHours() + d.getMinutes() / 60;
  });

  const max = Math.max(...times);
  const min = Math.min(...times);
  const diff = max - min;

  if (diff <= 0.33) return 20; // 20분
  if (diff <= 0.66) return 15; // 40분
  if (diff <= 1) return 10; // 1시간
  return 5;
}

// 최종 점수 계산 (5개 요소 평균)
export function calculateFinalSleepScore(records) {
  const totalHours = records.map((r) => r.total_sleeptime);
  const startTimes = records.map((r) => r.sleep_start);
  const movements = records.map((r) => r.movement_level);
  const events = records.map((r) => r.event_count || 0);

  const durationScore = calcSleepDurationScore(totalHours[0]);
  const stabilityScore = calcStabilityScore(totalHours);
  const movementScore = calcMovementScore(movements[0]);
  const eventScore = calcEventScore(events.reduce((a, b) => a + b, 0));
  const bedtimeConsistencyScore = calcBedtimeConsistency(startTimes);

  return (
    durationScore +
    stabilityScore +
    movementScore +
    eventScore +
    bedtimeConsistencyScore
  ) / 5;
}