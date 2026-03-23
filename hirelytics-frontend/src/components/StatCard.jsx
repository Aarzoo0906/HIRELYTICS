export const StatCard = ({ icon: Icon, label, value, color = "teal" }) => {
  const colorClasses = {
    teal: "bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
    slate: "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    blue: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-3 leading-none">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};
