// src/utils/studentCalculations.js

/**
 * Tính điểm trung bình tích lũy (GPA) từ mảng điểm.
 * Công thức: (Tổng (Điểm TB * Tín chỉ)) / (Tổng Tín chỉ)
 * @param {Array<Object>} grades - Mảng chứa các đối tượng điểm, mỗi đối tượng có average_score và credits.
 * @returns {number|null} GPA được làm tròn đến 2 chữ số thập phân, hoặc null nếu không có điểm.
 */
export const convertTo4Scale = (score10) => {
  if (score10 === null || score10 === undefined) return 0;
  if (score10 >= 8.5) return 4.0; // A
  if (score10 >= 8.0) return 3.5; // B+
  if (score10 >= 7.0) return 3.0; // B
  if (score10 >= 6.5) return 2.5; // C+
  if (score10 >= 5.5) return 2.0; // C
  if (score10 >= 5.0) return 1.5; // D+
  if (score10 >= 4.0) return 1.0; // D
  return 0.0; // F
};

// 2. Hàm tính GPA tổng
export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0;

  let totalCredits = 0;
  let totalScore = 0;

  grades.forEach((grade) => {
    // Chỉ tính các môn đã có điểm tổng kết và không phải môn "qua/trượt" (nếu có)
    if (grade.final_score !== null && grade.credits > 0) {
      // Ưu tiên lấy điểm TB hệ 10 (average_score), nếu chưa có thì lấy tạm final_score
      // Ở đây code tự động gọi hàm convertTo4Scale để lấy điểm hệ 4
      const score10 =
        grade.average_score !== undefined
          ? grade.average_score
          : grade.final_score;
      const score4 = convertTo4Scale(score10);

      totalScore += score4 * grade.credits;
      totalCredits += grade.credits;
    }
  });

  if (totalCredits === 0) return 0;

  // Làm tròn 3 chữ số thập phân
  return parseFloat((totalScore / totalCredits).toFixed(3));
};
