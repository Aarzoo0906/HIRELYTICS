import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { PageHeader } from "../components/PageHeader";
import { PageClock } from "../components/PageClock";
import { Sidebar } from "../components/Sidebar";
import {
  Mail,
  Calendar,
  User as UserIcon,
  Zap,
  Camera,
} from "lucide-react";
import { getValidImageSrc } from "../utils/profileImage";

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(
    getValidImageSrc(localStorage.getItem("profilePhoto")),
  );
  const [previewPhoto, setPreviewPhoto] = useState(profilePhoto);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const fallbackInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const stats = [
    { icon: Zap, label: "Total Points", value: user?.points || 0 },
    { icon: UserIcon, label: "Level", value: user?.level || 1 },
    { icon: Mail, label: "Email", value: user?.email || "N/A" },
    { icon: Calendar, label: "Member Since", value: user?.joinDate || "N/A" },
  ];

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setPreviewPhoto(imageData);
        setIsEditingPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    const nextPhoto = getValidImageSrc(previewPhoto);
    if (nextPhoto) {
      localStorage.setItem("profilePhoto", nextPhoto);
    } else {
      localStorage.removeItem("profilePhoto");
    }
    setProfilePhoto(nextPhoto);
    setIsEditingPhoto(false);
  };

  const handleRemovePhoto = () => {
    localStorage.removeItem("profilePhoto");
    setProfilePhoto(null);
    setPreviewPhoto(null);
    setIsEditingPhoto(false);
  };

  const handleCancelEdit = () => {
    setPreviewPhoto(profilePhoto);
    setIsEditingPhoto(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="User Settings"
            title="Profile"
            description="Manage your personal information and preferences."
            icon={UserIcon}
            backFallbackTo="/dashboard"
          />

          <div className="mx-auto w-full max-w-4xl space-y-8">

          <section className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="relative">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt={user?.name}
                      onError={() => {
                        setPreviewPhoto(null);
                        setProfilePhoto(null);
                        localStorage.removeItem("profilePhoto");
                      }}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-teal-200 dark:border-teal-800"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-2xl flex items-center justify-center border-4 border-teal-200 dark:border-teal-800">
                      <span className="text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400">
                        {fallbackInitial}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg shadow-lg transition-colors"
                    title="Upload photo"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {user?.name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {user?.email}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Member since {user?.joinDate}
                  </p>
                </div>
              </div>
            </div>

            {isEditingPhoto && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Preview
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePhoto}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Save Photo
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  {profilePhoto && (
                    <button
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 pb-4 border-b-2 border-teal-200 dark:border-teal-800">
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <span className="text-slate-600 dark:text-slate-400">
                  {user?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Account Status
                </label>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-teal-200 dark:border-teal-800">
              Performance Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.slice(0, 4).map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          {stat.label}
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <Icon
                        size={24}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 pb-4 border-b-2 border-teal-200 dark:border-teal-800">
              Learning Progress
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Overall Progress
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user?.interviewsTaken || 0} interviews completed
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-teal-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((user?.interviewsTaken || 0) * 10, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Level Progress
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Level {user?.level || 1}
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-teal-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${(user?.points || 0) % 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {100 - ((user?.points || 0) % 100)} points until next level
                </p>
              </div>
            </div>
          </section>

          <AppFooter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
