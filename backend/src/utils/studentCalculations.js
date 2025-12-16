// src/utils/studentCalculations.js

/**
 * Tính điểm trung bình tích lũy (GPA) từ mảng điểm.
 * Công thức: (Tổng (Điểm TB * Tín chỉ)) / (Tổng Tín chỉ)
 * @param {Array<Object>} grades - Mảng chứa các đối tượng điểm, mỗi đối tượng có average_score và credits.
 * @returns {number|null} GPA được làm tròn đến 2 chữ số thập phân, hoặc null nếu không có điểm.
 */
export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return null;

  const totalPoints = grades.reduce((sum, g) => {
    const score = parseFloat(g.average_score) || 0;
    const credits = parseFloat(g.credits) || 0;
    return sum + score * credits;
  }, 0);

  const totalCredits = grades.reduce(
    (sum, g) => sum + (parseFloat(g.credits) || 0),
    0
  );

  return totalCredits > 0
    ? parseFloat((totalPoints / totalCredits).toFixed(2))
    : 0;
};
