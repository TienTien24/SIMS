// src/utils/studentUtils.js (Hoặc studentHelpers.js)
import { pool } from "../config/db.config.js";

/**
 * Helper: Lấy student_id từ user_id
 * @param {number} userId - ID của người dùng từ req.user
 * @returns {Promise<number|null>} student_id hoặc null
 */
export const getStudentIdByUserId = async (userId) => {
  const query = "SELECT id FROM Students WHERE user_id = ?";
  try {
    const [rows] = await pool.execute(query, [userId]);
    return rows[0]?.id;
  } catch (error) {
    console.error("Error fetching studentId by userId:", error);
    return null;
  }
};
