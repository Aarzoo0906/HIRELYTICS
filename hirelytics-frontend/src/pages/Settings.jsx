import { useState, useRef, useEffect, useMemo } from "react";
import { AppFooter } from "../components/AppFooter";
import { ContactSupportPanel } from "../components/ContactSupportPanel";
import { PageHeader } from "../components/PageHeader";
import { PageClock } from "../components/PageClock";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getValidImageSrc } from "../utils/profileImage";
import { formatDuration } from "../utils/time";
import { useNavigate } from "react-router-dom";
import { formatDisplayName } from "../utils/name";
import {
  Camera,
  Trash2,
  Download,
  LogOut,
  ChevronRight,
  Clock3,
  Search,
  Shield,
  Megaphone,
  Send,
} from "lucide-react";

export const Settings = () => {
  const { user, updateUser, logout, changePassword, totalTimeSpentSeconds } = useAuth();
  const navigate = useNavigate();

  const defaultNotifications = useMemo(
    () => ({
      emailNotifications: true,
      achievementEmails: true,
      leaderboardUpdates: false,
      weeklyReport: true,
      pushNotifications: true,
    }),
    [],
  );

  const defaultPrivacy = useMemo(
    () => ({
      profilePublic: true,
      showOnLeaderboard: true,
      allowFriendRequests: true,
      dataCollection: true,
    }),
    [],
  );

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
  });

  const [profileImage, setProfileImage] = useState(
    getValidImageSrc(user?.profileImage) ||
      getValidImageSrc(localStorage.getItem("profilePhoto")),
  );
  const [imagePreview, setImagePreview] = useState(
    getValidImageSrc(user?.profileImage) ||
      getValidImageSrc(localStorage.getItem("profilePhoto")),
  );
  const fileInputRef = useRef(null);

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [privacy, setPrivacy] = useState(defaultPrivacy);

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState("");
  const [isDeleteAccountConfirmOpen, setIsDeleteAccountConfirmOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    link: "/dashboard",
    type: "announcement",
  });
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const isAdmin = user?.role === "admin";
  const fallbackInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const storedSettings = localStorage.getItem("settings");
    if (!storedSettings) return;

    try {
      const parsed = JSON.parse(storedSettings);
      if (parsed.formData) setFormData(parsed.formData);
      if (parsed.profileImage !== undefined) {
        setProfileImage(getValidImageSrc(parsed.profileImage));
        setImagePreview(getValidImageSrc(parsed.profileImage));
      }
      if (parsed.notifications) {
        setNotifications({ ...defaultNotifications, ...parsed.notifications });
      }
      if (parsed.privacy) setPrivacy({ ...defaultPrivacy, ...parsed.privacy });
    } catch {
      localStorage.removeItem("settings");
    }
  }, [defaultNotifications, defaultPrivacy]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "admin") {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAdminLoading(true);
      try {
        const token = localStorage.getItem("token");
        const apiBase =
          import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
          "http://localhost:5000/api";
        const params = new URLSearchParams();

        if (adminSearch.trim()) {
          params.set("search", adminSearch.trim());
        }

        const response = await fetch(
          `${apiBase}/admin/users${params.toString() ? `?${params.toString()}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load admin users");
        }

        setAdminUsers(data.users || []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Failed to load admin users");
        }
      } finally {
        setAdminLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [activeTab, adminSearch, isAdmin]);

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSave = () => {
    const settingsPayload = {
      formData,
      profileImage,
      notifications,
      privacy,
    };

    localStorage.setItem("settings", JSON.stringify(settingsPayload));
    if (getValidImageSrc(profileImage)) {
      localStorage.setItem("profilePhoto", profileImage);
    } else {
      localStorage.removeItem("profilePhoto");
    }

    updateUser({
      ...formData,
      profileImage,
      notifications,
      privacy,
    });
    setMessage("Settings saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download data
  const handleDownloadData = () => {
    const userData = {
      ...user,
      downloadedAt: new Date().toISOString(),
    };
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(userData, null, 2)),
    );
    element.setAttribute("download", `user-data-${user?.email}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Delete account
  const handleDeleteAccount = () => {
    setError("");
    setMessage("");
    setIsDeleteAccountConfirmOpen(true);
  };

  const confirmDeleteAccount = () => {
    localStorage.removeItem("settings");
    localStorage.removeItem("profilePhoto");
    logout();
    navigate("/login");
  };

  const cancelDeleteAccount = () => {
    setIsDeleteAccountConfirmOpen(false);
    setMessage("Account deletion cancelled.");
  };

  const handleCancel = () => {
    const storedSettings = localStorage.getItem("settings");
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.formData) setFormData(parsed.formData);
        setProfileImage(parsed.profileImage || null);
        setImagePreview(getValidImageSrc(parsed.profileImage));
        setProfileImage(getValidImageSrc(parsed.profileImage));
        setNotifications({
          ...defaultNotifications,
          ...(parsed.notifications || {}),
        });
        setPrivacy({ ...defaultPrivacy, ...(parsed.privacy || {}) });
      } catch {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          bio: user?.bio || "",
          phone: user?.phone || "",
        });
      }
    } else {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
        phone: user?.phone || "",
      });
      setProfileImage(getValidImageSrc(user?.profileImage));
      setImagePreview(getValidImageSrc(user?.profileImage));
      setNotifications(defaultNotifications);
      setPrivacy(defaultPrivacy);
    }

    setMessage("Changes reverted.");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleBroadcastAnnouncement = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setError("Announcement title and message are required.");
      return;
    }

    try {
      setAnnouncementLoading(true);
      const token = localStorage.getItem("token");
      const apiBase =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
        "http://localhost:5000/api";

      const response = await fetch(`${apiBase}/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(announcementForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to send announcement");
      }

      setMessage(`Announcement sent to ${data.delivered || 0} users.`);
      setAnnouncementForm({
        title: "",
        message: "",
        link: "/dashboard",
        type: "announcement",
      });
    } catch (broadcastError) {
      setError(broadcastError.message || "Failed to send announcement");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage("Password updated successfully.");
    } catch (passwordError) {
      setError(passwordError.message || "Password update failed.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageClock />

          <PageHeader
            eyebrow="Account Center"
            title="Settings"
            description="Manage your account, preferences, and privacy settings."
            icon={Shield}
            backFallbackTo="/dashboard"
          />

          <div className="mx-auto w-full max-w-4xl space-y-6">

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
            {[
              { id: "account", label: "Account", icon: "📋" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
              { id: "privacy", label: "Privacy", icon: "🔒" },
              { id: "data", label: "Data & Security", icon: "🌐" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold flex items-center gap-2 rounded-t-xl border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`px-4 py-3 font-semibold flex items-center gap-2 rounded-t-xl border-b-2 transition-all ${
                activeTab === "contact"
                  ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
              }`}
            >
              <span className="text-lg">C</span>
              <span className="hidden sm:inline">Contact Us</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-3 font-semibold flex items-center gap-2 rounded-t-xl border-b-2 transition-all ${
                  activeTab === "admin"
                    ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}
              >
                <span className="text-sm uppercase tracking-wide">Admin</span>
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

          {/* Success Message */}
          {message && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                {message}
              </p>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 font-semibold">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Profile Picture
                  </h2>

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    {/* Image Preview */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            onError={() => {
                              setImagePreview(null);
                              setProfileImage(null);
                              localStorage.removeItem("profilePhoto");
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl text-white font-bold">
                            {fallbackInitial}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full shadow-lg transition-colors"
                      >
                        <Camera size={16} />
                      </button>
                    </div>

                    {/* Upload Info */}
                    <div className="min-w-0 flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-slate-600 dark:text-slate-400 mb-3">
                        JPG, PNG or GIF (max. 2MB)
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Upload New
                        </button>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Personal Information */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formData.bio.length}/160
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Change Password
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-lg transition-colors"
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Email Notifications
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Marketing Emails",
                        desc: "Updates about new features and improvements",
                      },
                      {
                        key: "achievementEmails",
                        label: "Achievement Alerts",
                        desc: "Get notified when you unlock achievements",
                      },
                      {
                        key: "leaderboardUpdates",
                        label: "Leaderboard Updates",
                        desc: "Weekly leaderboard standings and rank changes",
                      },
                      {
                        key: "weeklyReport",
                        label: "Weekly Report",
                        desc: "Summary of your practice and progress",
                      },
                    ].map((notif) => (
                      <div
                        key={notif.key}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {notif.label}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {notif.desc}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[notif.key]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [notif.key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Push Notifications
                  </h2>

                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Push Notifications
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive browser notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          pushNotifications: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                  </div>
                </section>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "profilePublic",
                        label: "Public Profile",
                        desc: "Allow others to view your profile",
                      },
                      {
                        key: "showOnLeaderboard",
                        label: "Show on Leaderboard",
                        desc: "Appear in global leaderboard rankings",
                      },
                      {
                        key: "allowFriendRequests",
                        label: "Allow Friend Requests",
                        desc: "Let others add you as a friend",
                      },
                      {
                        key: "dataCollection",
                        label: "Analytics & Data Collection",
                        desc: "Help us improve by sharing usage data",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {setting.label}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {setting.desc}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacy[setting.key]}
                          onChange={(e) =>
                            setPrivacy({
                              ...privacy,
                              [setting.key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Activity & Sessions
                  </h2>

                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        View Active Sessions
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        See where you're logged in
                      </p>
                    </div>
                    <ChevronRight className="text-slate-600 dark:text-slate-400" />
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      Logout from All Devices
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* DATA & SECURITY TAB */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Time Spent
                  </h2>

                  <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 dark:border-teal-800 dark:from-teal-900/20 dark:to-emerald-900/20">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/80 p-3 text-teal-700 dark:bg-slate-900/60 dark:text-teal-300">
                        <Clock3 size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Total learning time after login
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                          {formatDuration(totalTimeSpentSeconds)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      This timer keeps running quietly in the background and is
                      only shown here when you want to check it.
                    </p>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Data Management
                  </h2>

                  <button
                    type="button"
                    onClick={handleDownloadData}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Download
                          size={20}
                          className="text-teal-600 dark:text-teal-400"
                        />
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Download Your Data
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Get a copy of all your data in JSON format
                      </p>
                    </div>
                    <ChevronRight className="text-slate-600 dark:text-slate-400" />
                  </button>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Data Storage
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Storage Used
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          2.4 MB / 5 GB
                        </p>
                      </div>
                      <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: "0.048%" }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Interviews:</span> 45
                        records
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Achievements:</span> 12
                        unlocked
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Statistics:</span>{" "}
                        Always up-to-date
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Danger Zone
                  </h2>

                  {isDeleteAccountConfirmOpen ? (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Delete account permanently?
                      </p>
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        This action cannot be undone. Your local account settings and session will be removed.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={confirmDeleteAccount}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Yes, delete account
                        </button>
                        <button
                          type="button"
                          onClick={cancelDeleteAccount}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Trash2
                          size={20}
                          className="text-red-600 dark:text-red-400"
                        />
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          Delete Account
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <ChevronRight className="text-slate-600 dark:text-slate-400" />
                  </button>
                </section>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <ContactSupportPanel />
              </div>
            )}

            {activeTab === "admin" && isAdmin && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Megaphone className="text-teal-600 dark:text-teal-400" size={20} />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Broadcast Project Update
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Send an attractive in-app notification to all users whenever you add
                    something new or make an important change.
                  </p>

                  <form onSubmit={handleBroadcastAnnouncement} className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={announcementForm.title}
                      onChange={(event) =>
                        setAnnouncementForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Update title"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <select
                      value={announcementForm.type}
                      onChange={(event) =>
                        setAnnouncementForm((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                    <input
                      value={announcementForm.link}
                      onChange={(event) =>
                        setAnnouncementForm((current) => ({
                          ...current,
                          link: event.target.value,
                        }))
                      }
                      placeholder="/dashboard"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <textarea
                      value={announcementForm.message}
                      onChange={(event) =>
                        setAnnouncementForm((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Write the update message users should see..."
                      className="min-h-32 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                    />
                    <button
                      type="submit"
                      disabled={announcementLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
                    >
                      <Send size={16} />
                      {announcementLoading ? "Sending..." : "Send Notification"}
                    </button>
                  </form>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="text-teal-600 dark:text-teal-400" size={20} />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Admin User Monitor
                        </h2>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Search any user and review the total time they have spent on Hirelytics.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                      <Search size={18} className="text-slate-500" />
                      <input
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full min-w-[220px] bg-transparent text-slate-900 focus:outline-none dark:text-slate-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  {adminLoading ? (
                    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                      Loading users...
                    </div>
                  ) : adminUsers.length ? (
                    adminUsers.map((adminUser) => (
                      <article
                        key={adminUser.email}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-xl font-bold text-white">
                            {adminUser.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {formatDisplayName(adminUser.name)}
                            </p>
                            <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                              {adminUser.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                            <p className="text-slate-500 dark:text-slate-400">Role</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {adminUser.role}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                            <p className="text-slate-500 dark:text-slate-400">Time Spent</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {formatDuration(adminUser.totalTimeSpentSeconds || 0)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                            <p className="text-slate-500 dark:text-slate-400">Points</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {adminUser.points || 0}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                            <p className="text-slate-500 dark:text-slate-400">Interviews</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {adminUser.interviewsTaken || 0}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                      No users matched your search.
                    </div>
                  )}
                </section>
              </div>
            )}

            {!["contact", "admin"].includes(activeTab) && (
              <div className="flex gap-3 sticky bottom-0 py-4 bg-slate-100 dark:bg-slate-950 px-0">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <AppFooter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
