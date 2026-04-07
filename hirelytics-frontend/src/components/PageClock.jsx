import { useEffect, useState } from "react";
import { CalendarDays, Clock3, User2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatDisplayName } from "../utils/name";

const formatDate = (value) =>
  value.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (value) =>
  value.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const PageClock = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="sticky top-0 z-20 w-full overflow-hidden rounded-t-2xl border-b border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_20%),linear-gradient(90deg,#020617_0%,#082f49_45%,#1d4ed8_100%)] px-4 py-3 text-white shadow-lg shadow-slate-900/10 md:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
            <User2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/75">
              Welcome Back
            </p>
            <p className="truncate text-xl font-bold tracking-tight md:text-2xl">
              {formatDisplayName(user?.name || "Guest")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-white/95 backdrop-blur-sm">
            <CalendarDays size={15} />
            {formatDate(now)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/12 px-3 py-1.5 font-semibold text-cyan-100 backdrop-blur-sm">
            <Clock3 size={15} />
            {formatTime(now)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PageClock;
