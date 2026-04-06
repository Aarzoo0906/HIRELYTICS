import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);
const getTimeSpentKey = (email = "") =>
  `hirelytics-time-spent:${email.trim().toLowerCase()}`;

const getStoredTimeSpent = (email = "") => {
  if (!email) {
    return 0;
  }

  const storedValue = Number(localStorage.getItem(getTimeSpentKey(email)) || "0");
  return Number.isFinite(storedValue) ? storedValue : 0;
};

const persistTimeSpent = (email = "", seconds = 0) => {
  if (!email) {
    return;
  }

  localStorage.setItem(getTimeSpentKey(email), `${Math.max(0, seconds)}`);
};

const getPreferredTimeSpent = (email = "", remoteSeconds = 0) =>
  Math.max(getStoredTimeSpent(email), remoteSeconds || 0);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTimeSpentSeconds, setTotalTimeSpentSeconds] = useState(0);
  const API_BASE =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api";
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const initializeAuth = async () => {
      if (!token) {
        localStorage.removeItem("user");
        localStorage.removeItem("lastLogin");
        setUser(null);
        setTotalTimeSpentSeconds(0);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        const storedUser = getStoredUser();
        const userData = {
          ...data.user,
          joinDate: storedUser?.joinDate || new Date().toLocaleDateString(),
          interviews: storedUser?.interviews || [],
        };
        const nextTimeSpent = getPreferredTimeSpent(
          userData.email,
          userData.totalTimeSpentSeconds,
        );

        updateLoginStreak(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        persistTimeSpent(userData.email, nextTimeSpent);
        setTotalTimeSpentSeconds(nextTimeSpent);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("lastLogin");
        setUser(null);
        setTotalTimeSpentSeconds(0);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user?.email) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTotalTimeSpentSeconds((current) => {
        const next = current + 1;
        persistTimeSpent(user.email, next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email || !totalTimeSpentSeconds) {
      return undefined;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return undefined;
    }

    const syncSessionTime = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/session-time`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ totalTimeSpentSeconds }),
          keepalive: true,
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (Number.isFinite(data?.totalTimeSpentSeconds)) {
          persistTimeSpent(user.email, data.totalTimeSpentSeconds);
        }
      } catch {
        // Ignore background sync failures and retry on the next cycle.
      }
    };

    if (totalTimeSpentSeconds % 30 === 0) {
      syncSessionTime();
    }

    const handlePageHide = () => {
      syncSessionTime();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [API_BASE, totalTimeSpentSeconds, user?.email]);

  const updateLoginStreak = (userData) => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem("lastLogin");

    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastLogin === yesterday) {
        userData.loginStreak = (userData.loginStreak || 1) + 1;
      } else {
        userData.loginStreak = 1;
      }

      localStorage.setItem("lastLogin", today);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }

    const storedUser = getStoredUser();
    const nextUser = {
      ...data.user,
      joinDate: storedUser?.joinDate || new Date().toLocaleDateString(),
      loginStreak: storedUser?.loginStreak || 1,
      interviews: storedUser?.interviews || [],
    };
    const nextTimeSpent = getPreferredTimeSpent(
      nextUser.email,
      nextUser.totalTimeSpentSeconds,
    );
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("lastLogin", new Date().toDateString());
    localStorage.setItem("darkMode", "false");
    document.documentElement.classList.remove("dark");
    setUser(nextUser);
    persistTimeSpent(nextUser.email, nextTimeSpent);
    setTotalTimeSpentSeconds(nextTimeSpent);
    return nextUser;
  };

  const register = async (name, email, password) => {
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      throw new Error(registerData?.message || "Registration failed");
    }

    return login(email, password);
  };

  const logout = () => {
    if (user?.email) {
      persistTimeSpent(user.email, totalTimeSpentSeconds);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("lastLogin");
    localStorage.setItem("darkMode", "true");
    document.documentElement.classList.add("dark");
    setUser(null);
    setTotalTimeSpentSeconds(0);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Password change failed");
    }

    const updatedUser = {
      ...user,
      ...data.user,
      joinDate: user?.joinDate,
      interviews: user?.interviews || [],
      loginStreak: user?.loginStreak || 1,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const addInterviewRecord = async (interviewData) => {
    // Save to localStorage for immediate access
    const interviews = user?.interviews || [];
    const newInterview = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      type: interviewData.type,
      difficulty: interviewData.difficulty,
      score: interviewData.score,
      timePerQuestion: interviewData.timePerQuestion || 0,
      totalTime: interviewData.totalTime || 0,
      answers: interviewData.answers,
    };
    interviews.push(newInterview);

    const updated = {
      ...user,
      interviews,
      interviewsTaken: (user?.interviewsTaken || 0) + 1,
    };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    // Also save to backend for persistent storage
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/interview/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: interviewData.type,
          difficulty: interviewData.difficulty,
          totalScore: interviewData.score,
          timePerQuestion: interviewData.timePerQuestion,
          totalTime: interviewData.totalTime,
          answers: interviewData.answers,
          questions: interviewData.questions || [],
          category: interviewData.type,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save interview to backend");
      } else {
        const data = await response.json();
        console.log("Interview saved successfully:", data);
        if (typeof data?.totalScore === "number") {
          newInterview.score = data.totalScore;
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...updated,
              interviews,
            }),
          );
          setUser({
            ...updated,
            interviews: [...interviews],
          });
        }
      }
    } catch (error) {
      console.error("Error saving interview to backend:", error);
    }

    return newInterview;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        changePassword,
        loading,
        addInterviewRecord,
        totalTimeSpentSeconds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
