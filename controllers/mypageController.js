import MyPageModel from "../models/mypageModel.js";

export const getMyPage = async (req, res) => {
  try {
    const userId = req.user.id; // JWT 인증 미들웨어를 통해 추출된 사용자 ID
    const user = await MyPageModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("마이페이지 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};