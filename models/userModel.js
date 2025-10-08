// models/userModel.js

const pool = require('../config/db');

/**
 * 이메일로 사용자 찾기
 * @param {string} email
 * @returns {object|null} 사용자 정보 또는 null
 */
const findByEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // 사용자를 찾으면 객체, 없으면 undefined 반환
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * 새로운 사용자 생성
 * @param {object} userData - { email, name, googleId, profileImage }
 * @returns {object} 생성된 사용자 정보
 */
const create = async (userData) => {
  const { email, name, googleId, profileImage } = userData;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (email, name, google_id, profile_image) VALUES (?, ?, ?, ?)',
      [email, name, googleId, profileImage]
    );
    // 생성된 사용자의 정보를 다시 조회하여 반환
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

module.exports = {
  findByEmail,
  create,
};