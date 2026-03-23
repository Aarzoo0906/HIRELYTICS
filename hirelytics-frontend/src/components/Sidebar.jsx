import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Briefcase,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Medal,
  Award,
} from "lucide-react";
import { useState } from "react";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInterviewClick = () => {
    navigate("/interview-selection");
    setIsOpen(false);
  };

  const isActive = (path) => {
    if (path === "/interview") {
      return (
        location.pathname === "/interview-selection" ||
        location.pathname === "/interview"
      );
    }
    return location.pathname === path;
  };

  const activeClass = "bg-teal-600 text-white";
  const inactiveClass =
    "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard", onClick: null },
    {
      path: "/interview",
      icon: Briefcase,
      label: "Interview",
      onClick: handleInterviewClick,
    },
    { path: "/profile", icon: User, label: "Profile", onClick: null },
    { path: "/leaderboard", icon: Medal, label: "Leaderboard", onClick: null },
    { path: "/achievements", icon: Award, label: "Achievements", onClick: null },
    { path: "/settings", icon: Settings, label: "Settings", onClick: null },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 z-40"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 md:translate-x-0 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            Hirelytics
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    navigate(item.path);
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isItemActive ? activeClass : inactiveClass
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={`md:w-64 hidden md:block ${isOpen ? "w-64 block" : ""}`}
      ></div>
    </>
  );
};
