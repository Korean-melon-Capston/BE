// models/reportModel.js
import db from "../config/db.js";

class ReportModel {
  /**
   * @description 리포트 생성
   * @param {Object} param0
   * @param {number} param0.user_id
   * @param {Date} param0.report_date
   * @param {string} param0.recommendation
   * @param {number} param0.score
   */
  static async create({ user_id, report_date, recommendation, score }) {
    const sql = `
      INSERT INTO health_reports (user_id, report_date, recommendation, score)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      report_date,
      recommendation,
      score,
    ]);

    return {
      id: result.insertId,
      user_id,
      report_date,
      recommendation,
      score,
    };
  }

  /**
   * @description 특정 사용자 리포트 전체 조회 (최신순)
   * @param {number} user_id
   */
  static async findByUserId(user_id) {
    const sql = `
      SELECT id, user_id, report_date, recommendation, score
      FROM health_reports
      WHERE user_id = ?
      ORDER BY report_date DESC
    `;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  }

  /**
   * @description 특정 리포트 1개 조회
   * @param {number} id
   */
  static async findById(id) {
    const sql = `
      SELECT id, user_id, report_date, recommendation, score
      FROM health_reports
      WHERE id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * @description 리포트 삭제 (선택 사항)
   */
  static async delete(id) {
    const sql = `DELETE FROM health_reports WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
}

export default ReportModel;
