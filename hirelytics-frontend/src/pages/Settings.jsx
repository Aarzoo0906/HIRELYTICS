import { useState, useRef, useEffect, useMemo } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Bell,
  Lock,
  Trash2,
  Download,
  LogOut,
  ChevronRight,
} from "lucide-react";

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
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

  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const fileInputRef = useRef(null);

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [privacy, setPrivacy] = useState(defaultPrivacy);

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedSettings = localStorage.getItem("settings");
    if (!storedSettings) return;

    try {
      const parsed = JSON.parse(storedSettings);
      if (parsed.formData) setFormData(parsed.formData);
      if (parsed.profileImage !== undefined) {
        setProfileImage(parsed.profileImage);
        setImagePreview(parsed.profileImage);
      }
      if (parsed.notifications) {
        setNotifications({ ...defaultNotifications, ...parsed.notifications });
      }
      if (parsed.privacy) setPrivacy({ ...defaultPrivacy, ...parsed.privacy });
    } catch {
      localStorage.removeItem("settings");
    }
  }, [defaultNotifications, defaultPrivacy]);

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
  const handleSave = (e) => {
    e.preventDefault();
    const settingsPayload = {
      formData,
      profileImage,
      notifications,
      privacy,
    };

    localStorage.setItem("settings", JSON.stringify(settingsPayload));
    localStorage.setItem("profilePhoto", profileImage);

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
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      localStorage.removeItem("settings");
      localStorage.removeItem("profilePhoto");
      logout();
      navigate("/login");
    }
  };

  const handleCancel = () => {
    const storedSettings = localStorage.getItem("settings");
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.formData) setFormData(parsed.formData);
        setProfileImage(parsed.profileImage || null);
        setImagePreview(parsed.profileImage || null);
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
      setProfileImage(user?.profileImage || null);
      setImagePreview(user?.profileImage || null);
      setNotifications(defaultNotifications);
      setPrivacy(defaultPrivacy);
    }

    setMessage("Changes reverted.");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <section>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your account, preferences, and privacy settings.
            </p>
          </section>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {[
              { id: "account", label: "Account", icon: "📋" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
              { id: "privacy", label: "Privacy", icon: "🔒" },
              { id: "data", label: "Data & Security", icon: "🌐" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Profile Picture
                  </h2>

                  <div className="flex items-start gap-6">
                    {/* Image Preview */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl text-white font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
                    <div className="flex-1">
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
                      <div className="flex gap-3">
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

            {/* Save Button - Visible on all tabs */}
            <div className="flex gap-3 sticky bottom-0 py-4 bg-slate-100 dark:bg-slate-950 px-0">
              <button
                type="submit"
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
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
