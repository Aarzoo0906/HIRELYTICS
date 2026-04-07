import { API_BASE } from "../lib/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const interviewService = {
  // Get interview history
  getHistory: async () => {
    try {
      const response = await fetch(`${API_BASE}/interview/history`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }
      return data;
    } catch (error) {
      console.error("Error fetching interview history:", error);
      throw error;
    }
  },

  // Get performance feedback
  getFeedback: async () => {
    try {
      const response = await fetch(`${API_BASE}/interview/feedback`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch feedback");
      }
      return data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },

  // Generate AI questions
  generateQuestions: async (type, difficulty, topic) => {
    try {
      const response = await fetch(`${API_BASE}/interview/generate-questions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, difficulty, topic }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate questions");
      }
      return data;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  },

  // Submit interview
  submitInterview: async (interviewData) => {
    try {
      const response = await fetch(`${API_BASE}/interview/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(interviewData),
      });

      if (response.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit interview");
      }
      return data;
    } catch (error) {
      console.error("Error submitting interview:", error);
      throw error;
    }
  },
};
