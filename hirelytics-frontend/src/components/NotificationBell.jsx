import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Sparkles } from "lucide-react";
import { notificationService } from "../services/notification.service";

const typeTheme = {
  announcement: "border-cyan-300/60 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200",
  reward: "border-amber-300/60 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  warning: "border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200",
  success: "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  info: "border-slate-300/60 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
};

const formatTimeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications],
  );

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (notification) => {
    if (notification.isRead) {
      return;
    }

    try {
      await notificationService.markRead(notification._id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100 bg-[linear-gradient(135deg,#ffffff_0%,#eff8ff_100%)] text-sky-900 shadow-lg shadow-sky-300/30 transition hover:-translate-y-0.5 hover:shadow-xl dark:border-cyan-400/20 dark:bg-[linear-gradient(135deg,#082f49_0%,#1d4ed8_100%)] dark:text-cyan-100 dark:shadow-slate-950/40"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md dark:border-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-50 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(240,249,255,0.95)_100%)] shadow-2xl backdrop-blur-md dark:border-cyan-400/20 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(8,47,73,0.96)_100%)]">
          <div className="flex items-center justify-between border-b border-cyan-100 px-4 py-4 dark:border-cyan-400/15">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600 dark:text-cyan-300" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <CheckCheck size={14} />
              Read all
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {loading ? (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
                Loading notifications...
              </p>
            ) : sortedNotifications.length ? (
              <div className="space-y-3">
                {sortedNotifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => handleMarkRead(notification)}
                    className={`block w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      typeTheme[notification.type] || typeTheme.info
                    } ${notification.isRead ? "opacity-80" : "ring-2 ring-rose-300/50 dark:ring-rose-700/40"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">{notification.title}</p>
                        <p className="mt-1 text-xs leading-6 opacity-90">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">
                      <span>{notification.category}</span>
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No notifications yet. Admin updates will appear here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
