import pool from "../config/db.js";

// 아기 정보 수정
export const updateBabyInfo = async ({ userId, babyname, babygender, baby_birthday }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `UPDATE users 
       SET babyname = ?, babygender = ?, baby_birthday = ?
       WHERE id = ?`,
      [babyname, babygender, baby_birthday, userId]
    );
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};