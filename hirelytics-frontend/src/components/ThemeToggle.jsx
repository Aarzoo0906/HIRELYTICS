import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = ({ className = "", iconOnly = false }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    const isLandingPage = window.location.pathname === "/";
    const isDarkMode =
      storedTheme === null ? isLandingPage : storedTheme === "true";
    setIsDark(isDarkMode);
    localStorage.setItem("darkMode", `${isDarkMode}`);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center transition-colors ${iconOnly ? "h-10 w-10 rounded-full text-current opacity-80 hover:bg-white/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 dark:hover:bg-white/10" : "rounded-xl border border-slate-200 bg-white/95 p-2.5 text-slate-800 shadow-sm backdrop-blur hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"} ${className}`.trim()}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
