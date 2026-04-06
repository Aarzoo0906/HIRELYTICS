import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import {
  Home,
  Briefcase,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Medal,
  Award,
  BookMarked,
  FileSearch,
  Mic,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(() => {
    const storedValue = localStorage.getItem("hirelytics-sidebar-expanded");
    return storedValue === null ? true : storedValue === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "hirelytics-sidebar-expanded",
      `${isDesktopExpanded}`,
    );
  }, [isDesktopExpanded]);

  useEffect(() => {
    const syncSidebarWidth = () => {
      const isDesktop = window.innerWidth >= 768;
      const sidebarWidth = isDesktop ? (isDesktopExpanded ? 256 : 96) : 0;

      document.documentElement.style.setProperty(
        "--hirelytics-sidebar-width",
        `${sidebarWidth}px`,
      );
    };

    syncSidebarWidth();
    window.addEventListener("resize", syncSidebarWidth);

    return () => {
      window.removeEventListener("resize", syncSidebarWidth);
    };
  }, [isDesktopExpanded]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInterviewClick = () => {
    navigate("/interview-selection");
    setIsOpen(false);
  };

  const handleDesktopToggle = () => {
    setIsDesktopExpanded((current) => !current);
  };

  const isActive = (path) => {
    if (path === "/interview") {
      return (
        location.pathname === "/interview-selection" ||
        location.pathname === "/interview"
      );
    }
    if (path === "/resume-analyzer") {
      return location.pathname === "/resume-analyzer";
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
    {
      path: "/resume-analyzer",
      icon: FileSearch,
      label: "Resume ATS",
      onClick: null,
    },
    { path: "/voice-practice", icon: Mic, label: "Voice Practice", onClick: null },
    { path: "/preparation", icon: BookMarked, label: "Preparation", onClick: null },
    { path: "/profile", icon: User, label: "Profile", onClick: null },
    { path: "/leaderboard", icon: Medal, label: "Leaderboard", onClick: null },
    { path: "/achievements", icon: Award, label: "Achievements", onClick: null },
    { path: "/settings", icon: Settings, label: "Settings", onClick: null },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-2xl border border-slate-200 bg-white/95 p-2.5 text-slate-800 shadow-lg backdrop-blur-sm transition hover:scale-105 dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-100 md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/35 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 h-screen border-r-2 border-slate-200 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/95 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDesktopExpanded ? "md:w-64" : "md:w-24"
        } md:translate-x-0 ${
          isDesktopExpanded ? "w-64" : "w-64"
        } flex flex-col`}
      >
        <div className="border-b-2 border-slate-200 px-5 py-5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center ${isDesktopExpanded ? "gap-3.5" : "justify-center"}`}
          >
            <div
              className={`flex items-center justify-center overflow-hidden rounded-2xl border border-teal-100 bg-white p-1.5 shadow-lg shadow-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 ${
                isDesktopExpanded ? "h-14 w-14 flex-shrink-0" : "h-11 w-11"
              }`}
            >
              <BrandLogo
                className="h-full w-full scale-[1.08] object-contain"
                alt="Hirelytics"
                priority
              />
            </div>
            {isDesktopExpanded && (
              <div className="min-w-0 flex-1">
                <h1 className="text-[2rem] leading-none font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
                  Hirelytics
                </h1>
                <p className="mt-1.5 text-[11px] leading-none font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  AI Interview Prep
                </p>
              </div>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDesktopToggle}
          className="absolute -right-3 top-24 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:scale-105 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:flex"
          title={isDesktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isDesktopExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-28">
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
                className={`w-full flex items-center rounded-xl border-2 px-4 py-3 font-medium transition-all duration-200 ${
                  isItemActive 
                    ? "bg-teal-600 dark:bg-teal-500 text-white border-teal-700 dark:border-teal-600 shadow-md" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-transparent hover:border-teal-200 dark:hover:border-teal-700"
                } ${isDesktopExpanded ? "gap-3 justify-start" : "justify-center md:px-0"}`}
                title={!isDesktopExpanded ? item.label : undefined}
              >
                <Icon size={20} />
                {isDesktopExpanded && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className={`w-full rounded-xl border-2 border-transparent px-4 py-3 font-medium text-slate-700 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
              isDesktopExpanded ? "flex items-center gap-3" : "flex items-center justify-center"
            }`}
            title={!isDesktopExpanded ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {isDesktopExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={`hidden transition-all duration-300 md:block ${
          isDesktopExpanded ? "md:w-64" : "md:w-24"
        }`}
      ></div>
    </>
  );
};
