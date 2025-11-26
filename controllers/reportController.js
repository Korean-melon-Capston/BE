// controllers/reportController.js
import Report from '../models/reportModel.js';
import Record from '../models/recordModel.js';
import OpenAI from "openai";
import { calculateFinalSleepScore } from "../utils/sleepScore.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 리포트 조회 (3주차)
 */
export const getReports = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
    }

    const reports = await Report.findByUserId(req.user.id);

    res.status(200).json({
      message: '리포트 조회 성공',
      reports,
    });

  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ message: '서버 오류' });
  }
};

/**
 * AI 리포트 생성 (4주차)
 */
export const createReportWithAI = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "인증 정보가 유효하지 않습니다." });
    }

    const user_id = req.user.id;

    // 최근 5개 기록 가져오기
    const recentRecords = await Record.findRecentByUserId(user_id, 5);

    if (!recentRecords || recentRecords.length === 0) {
      return res.status(400).json({ message: "AI 분석에 필요한 수면 기록이 부족합니다." });
    }

    // 점수 계산
    const finalScore = calculateFinalSleepScore(recentRecords);

    // 기록 텍스트 구성
    const recordsText = recentRecords
      .map((r) => {
        const start = new Date(r.sleep_start).toLocaleString("ko-KR");
        const end = new Date(r.sleep_end).toLocaleString("ko-KR");
        return `· 수면: ${start} ~ ${end} / 움직임: ${r.movement_level}`;
      })
      .join("\n");

    // AI 프롬프트
    const prompt = `
당신은 아동 수면 건강 전문가입니다.
아래의 최근 수면 기록을 분석하여 보호자에게 보고서를 작성하세요.

최근 수면 기록:
${recordsText}

---

# 출력 형식:

## 📊 수면 패턴 분석
- 최근 기록을 기반으로 아이의 수면 상태를 3~5가지 bullet로 요약하세요.
- 수면 시간, 뒤척임, 패턴 변화 등 데이터 기반으로 설명하세요.

## 💡 개선 권장사항
- 보호자가 바로 적용할 수 있는 실천 팁을 bullet로 3~5개 작성하세요.
- 문장은 간단하고 따뜻하게, "해보세요" 같은 제안형으로 작성하세요.

반드시 두 섹션 제목과 bullet 포맷을 그대로 유지하세요.
`.trim();

    // GPT 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // 안정적
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiRecommendation = completion.choices[0].message.content.trim();

    // DB 저장
    const newReport = await Report.create({
      user_id,
      report_date: new Date(),
      recommendation: aiRecommendation,
      score: finalScore,
    });

    res.status(201).json({
      message: "AI 건강 리포트가 생성되었습니다.",
      report: newReport,
    });

  } catch (error) {
    console.error("createReportWithAI error:", error);
    res.status(500).json({
      message: "AI 리포트 생성 실패",
      error: error.message,
    });
  }
};
