export const StatCard = ({ icon: Icon, label, value, color = "teal" }) => {
  const colorClasses = {
    teal: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-300",
    slate: "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300",
  };

  return (
    <div className="rounded-2xl border border-cyan-100 bg-[linear-gradient(145deg,#ffffff_0%,#f2fbff_100%)] p-6 shadow-sm dark:border-cyan-400/15 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.96)_0%,rgba(8,47,73,0.92)_100%)]">
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
