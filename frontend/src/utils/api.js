// src/utils/api.js
export const API_BASE_URL = "http://localhost:4000/api";

/**
 * Helper function để gọi API với token tự động
 * @param {string} endpoint - API endpoint (không cần /api prefix)
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Thêm token vào header nếu có
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

/**
 * Helper function để gọi API và parse JSON response
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Parsed JSON data
 */
export const apiCallJson = async (endpoint, options = {}) => {
  const response = await apiCall(endpoint, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: "Unknown error" 
    }));
    throw new Error(error.message || error.error || "API call failed");
  }
  
  return await response.json();
};
