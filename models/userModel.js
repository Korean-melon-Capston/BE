const db = require("../config/db");

const User = {
  // google_id + provider로 사용자 조회
  findUserByOAuth: async (google_id, provider) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE google_id = ? AND provider = ?",
      [google_id, provider]
    );
    return rows[0];
  },

  // 새 사용자 생성
  createUser: async ({ google_id, provider, email, name, profile_image }) => {
    const [result] = await db.query(
      `INSERT INTO users (google_id, provider, email, name, profile_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [google_id, provider, email, name, profile_image]
    );
    return result.insertId;
  }
};

module.exports = User;

//google_id 는 google에서 제공하는 고유 id
//provider 는 google임 (로그인 제공자)
//email
//name 은 사용자이름
//profile_image는 프로필 이미지 
//created_at, updated_at 은 현재시간으로 설정