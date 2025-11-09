// models/mypageModel.js

import db from "../config/db.js";

const Mypage = {
  // 사용자 ID로 사용자 정보 조회
  findUserById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }
};

export default Mypage;