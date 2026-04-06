import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Interview", to: "/interview-selection" },
      { label: "Resume ATS", to: "/resume-analyzer" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Preparation", to: "/preparation" },
      { label: "Leaderboard", to: "/leaderboard" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

export const AppFooter = ({ compact = false }) => {
  return (
    <footer
      className="relative mt-auto w-full overflow-hidden border-t border-slate-200 bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950 px-4 py-6 text-white shadow-lg shadow-slate-900/10 md:px-6 lg:px-8"
    >
      <div className={`relative flex w-full flex-col gap-6 ${compact ? "lg:flex-row lg:items-center lg:justify-between" : "lg:grid lg:grid-cols-[1.2fr_1fr_1fr]"}`}>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold tracking-tight text-white">Hirelytics</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
              <Sparkles size={12} />
              Smart prep
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
              <ShieldCheck size={12} />
              Dark mode first
            </span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
            Practice interviews, sharpen your resume, and track steady progress in one focused prep workspace.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-100">
              {section.title}
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {section.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white visited:text-white transition hover:text-teal-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-6 flex w-full flex-col gap-3 border-t border-white/10 pt-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between">
        <p>Hirelytics keeps your preparation organized, visible, and consistent.</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-white/70">
            Version 1.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
