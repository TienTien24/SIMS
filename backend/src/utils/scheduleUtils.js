// src/utils/scheduleUtils.js

/**
 * Kiểm tra xem 2 khoảng tiết học có bị trùng nhau không
 * @param {string} period1 - Ví dụ: "1-3"
 * @param {string} period2 - Ví dụ: "2-4"
 * @returns {boolean} true nếu trùng, false nếu không
 */
export const checkTimeOverlap = (period1, period2) => {
  const parsePeriod = (p) => {
    if (!p) return { start: 0, end: 0 };
    const parts = p.toString().split(/[-,]/); 
    const start = parseInt(parts[0]);
    const end = parts.length > 1 ? parseInt(parts[parts.length - 1]) : start; 
    return { start, end };
  };

  const t1 = parsePeriod(period1);
  const t2 = parsePeriod(period2);

  return Math.max(t1.start, t2.start) <= Math.min(t1.end, t2.end);
};

export const translateDay = (day) => {
    const map = { 
        'Monday': 'Thứ 2', 'Tuesday': 'Thứ 3', 'Wednesday': 'Thứ 4', 
        'Thursday': 'Thứ 5', 'Friday': 'Thứ 6', 'Saturday': 'Thứ 7', 'Sunday': 'CN' 
    };
    return map[day] || day;
};