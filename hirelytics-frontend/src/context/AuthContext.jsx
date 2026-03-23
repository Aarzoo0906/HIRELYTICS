import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      updateLoginStreak(userData);
      setUser(userData);
    } else if (storedUser && !token) {
      localStorage.removeItem("user");
      localStorage.removeItem("lastLogin");
      setUser(null);
    }
    setLoading(false);
  }, []);

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
    const doLogin = async () =>
      fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

    let response = await doLogin();
    let data = await response.json();

    // Legacy/local-only users won't exist in backend DB.
    // Create the account once, then retry login.
    if (
      !response.ok &&
      response.status === 400 &&
      typeof data?.message === "string" &&
      data.message.toLowerCase().includes("not found")
    ) {
      const fallbackName = email.split("@")[0] || "user";
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fallbackName,
          email,
          password,
        }),
      });

      if (!registerResponse.ok && registerResponse.status !== 400) {
        const registerData = await registerResponse.json();
        throw new Error(registerData?.message || "Registration failed");
      }

      response = await doLogin();
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data?.message || "Login failed");
    }

    const nextUser = {
      ...data.user,
      joinDate: new Date().toLocaleDateString(),
      loginStreak: 1,
      interviews: [],
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("lastLogin", new Date().toDateString());
    setUser(nextUser);
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
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const addInterviewRecord = (interviewData) => {
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
      points: (user?.points || 0) + Math.floor(interviewData.score),
    };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
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
        loading,
        addInterviewRecord,
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
