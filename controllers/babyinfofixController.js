import {
  updateBabyInfo
} from "../models/babyinfofixModel.js";

// ✔ 아기 정보 수정
export const updateBabyInfoController = async (req, res) => {
  try {
    const { userId, babyname, babygender, baby_birthday } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId는 필수입니다." });
    }

    const updated = await updateBabyInfo({
      userId,
      babyname,
      babygender,
      baby_birthday
    });

    if (!updated) {
      return res.status(400).json({ error: "수정 실패. 전달된 값 확인 필요." });
    }

    return res.status(200).json({
      message: "아기 정보가 성공적으로 수정되었습니다.",
      updated
    });
  } catch (err) {
    console.error("아기 정보 수정 오류:", err);
    return res.status(500).json({ error: "서버 오류 발생" });
  }
};